import Fastify, { LogController } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import { createHash } from "node:crypto";
import { auth } from "./auth";
import { config } from "./config";
import { pool } from "./db";
import {
  createCheckout,
  getPayment,
  paymentStatus,
  verifySignature,
  type Payment,
} from "./payments";
import { getRecipe, describeStudio, cloneStudio } from "./studios";
import { validateRecipe } from "../domains/custom/validate";
import { DOMAINS } from "../domains";
import { recipeError } from "./validation";
import { LOOKS, PRICE } from "../shared/product";
import { buildStudioV2, demoV2 } from "./engine-v2";
import { findService, SERVICES } from "../shared/v2-catalog";
import { publishedViral } from "./viral";

const record = z.record(z.string().max(80), z.unknown());
const uuid = z.string().uuid();
const itemSchema = z.object({
  kind: z.enum(["draft", "preset", "favorite", "studio"]),
  studioId: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  data: record,
});
const headersOf = (input: Record<string, unknown>) => {
  const result = new Headers();
  for (const [key, value] of Object.entries(input))
    if (value)
      result.set(key, Array.isArray(value) ? value.join(",") : String(value));
  return result;
};
const orderSelect =
  'id, status, amount, environment, created_at as "createdAt", checkout_url as "checkoutUrl"';

export async function applyPayment(payment: Payment) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const order = (
      await client.query(
        "SELECT * FROM aichemy_orders WHERE id=$1 AND environment=$2 FOR UPDATE",
        [payment.order_id, config.PAYMENT_MODE],
      )
    ).rows[0];
    if (!order) throw new Error("Pesanan tidak ditemukan.");
    const status = paymentStatus(payment, order.status);
    const eventId = createHash("sha256")
      .update(
        JSON.stringify([
          payment.order_id,
          payment.transaction_status,
          payment.fraud_status,
          payment.refund_amount,
        ]),
      )
      .digest("hex");
    await client.query(
      "INSERT INTO aichemy_payment_events(id,order_id,status) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
      [eventId, order.id, payment.transaction_status],
    );
    await client.query("UPDATE aichemy_orders SET status=$1 WHERE id=$2", [
      status,
      order.id,
    ]);
    if (status === "paid" && order.status !== "paid")
      await client.query(
        "INSERT INTO aichemy_entitlements(id,user_id,environment,order_id,status) VALUES($1,$2,$3,$4,'active') ON CONFLICT(user_id,environment) DO UPDATE SET status='active',order_id=excluded.order_id",
        [crypto.randomUUID(), order.user_id, config.PAYMENT_MODE, order.id],
      );
    if (status === "revoked")
      await client.query(
        "UPDATE aichemy_entitlements SET status='revoked' WHERE order_id=$1",
        [order.id],
      );
    await client.query("COMMIT");
    return status;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createServer() {
  const app = Fastify({
    logger: config.NODE_ENV !== "test",
    logController: new LogController({ disableRequestLogging: true }),
    bodyLimit: 512 * 1024,
    trustProxy: config.NODE_ENV === "production",
  });
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute" });
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof z.ZodError)
      return reply.code(400).send({
        error: "Data belum sesuai. Periksa kembali isian Anda.",
        details: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      });
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    if (status >= 500) app.log.error(error);
    reply.code(status).send({
      error:
        status === 429
          ? "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi."
          : status >= 500
            ? "Ada kendala pada layanan. Silakan coba lagi."
            : (error as Error).message,
    });
  });
  app.addHook("onRequest", async (request, reply) => {
    reply
      .header("X-Content-Type-Options", "nosniff")
      .header("Referrer-Policy", "strict-origin-when-cross-origin");
    if (request.url.startsWith("/api/"))
      reply.header("Cache-Control", "no-store");
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
      !request.url.startsWith("/api/payments/webhook")
    ) {
      const origin = request.headers.origin;
      if (
        (origin && origin !== new URL(config.APP_URL).origin) ||
        (!origin && request.headers.cookie)
      )
        return reply.code(403).send({
          error: "Permintaan berasal dari alamat yang tidak diizinkan.",
        });
    }
  });
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: async (request, reply) => {
      const response = await auth.handler(
        new Request(new URL(request.raw.url!, config.APP_URL), {
          method: request.method,
          headers: headersOf(request.headers),
          ...(request.method === "POST"
            ? { body: JSON.stringify(request.body ?? {}) }
            : {}),
        }),
      );
      response.headers.forEach((value, key) => {
        if (key !== "set-cookie") reply.header(key, value);
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) reply.header("set-cookie", cookies);
      reply.code(response.status).send(await response.text());
    },
  });
  async function account(
    request: { headers: Record<string, unknown> },
    paid = false,
  ) {
    const session = await auth.api.getSession({
      headers: headersOf(request.headers),
    });
    if (!session)
      throw Object.assign(new Error("Silakan masuk terlebih dahulu."), {
        statusCode: 401,
      });
    const active =
      (
        await pool.query(
          "SELECT 1 FROM aichemy_entitlements WHERE user_id=$1 AND environment=$2 AND status='active'",
          [session.user.id, config.PAYMENT_MODE],
        )
      ).rowCount! > 0;
    if (paid && !active)
      throw Object.assign(
        new Error("Aktifkan akses lifetime untuk menggunakan studio."),
        { statusCode: 402 },
      );
    return {
      ...session.user,
      admin: config.adminEmails.includes(session.user.email.toLowerCase()),
      active,
      environment: config.PAYMENT_MODE,
    };
  }
  async function admin(request: { headers: Record<string, unknown> }) {
    const user = await account(request);
    if (!user.admin || !user.emailVerified)
      throw Object.assign(new Error("Akses khusus admin."), {
        statusCode: 403,
      });
    return user;
  }
  async function ownedRecipe(id: string, userId: string) {
    const custom = id.startsWith("x-")
      ? (
          await pool.query(
            "SELECT data FROM aichemy_library WHERE user_id=$1 AND kind='studio' AND studio_id=$2",
            [userId, id],
          )
        ).rows[0]?.data.recipe
      : undefined;
    try {
      return getRecipe(id, custom);
    } catch {
      throw Object.assign(new Error("Studio tidak ditemukan."), {
        statusCode: 404,
      });
    }
  }
  app.get("/api/health", async () => {
    await pool.query("SELECT 1");
    return { ok: true };
  });
  app.get("/api/config", async () => ({
    environment: config.PAYMENT_MODE,
    paymentConfigured: Boolean(
      config.MIDTRANS_SERVER_KEY && config.MIDTRANS_CLIENT_KEY,
    ),
    supportEmail: config.SUPPORT_EMAIL,
    businessName: config.BUSINESS_NAME,
    price: PRICE,
  }));
  app.get("/api/session", async (request) => {
    try {
      return { user: await account(request) };
    } catch (e) {
      if ((e as { statusCode?: number }).statusCode === 401)
        return { user: null };
      throw e;
    }
  });
  app.get("/api/studios", async (request) => {
    const user = await account(request, true);
    const customs = (
      await pool.query(
        "SELECT studio_id as id,name as label,data FROM aichemy_library WHERE user_id=$1 AND kind='studio'",
        [user.id],
      )
    ).rows;
    return { studios: [...LOOKS, ...customs], services: SERVICES };
  });
  app.post(
    "/api/demo/preview",
    { config: { rateLimit: { max: 40, timeWindow: "1 minute" } } },
    async (request) => demoV2(request.body),
  );
  app.get("/api/viral-prompts", async (request) => {
    await account(request, true);
    return {
      items: publishedViral().map(({ prompt, instructions, ...meta }) => meta),
    };
  });
  app.get("/api/viral-prompts/:id", async (request, reply) => {
    await account(request, true);
    const { id } = z.object({ id: z.string().max(100) }).parse(request.params);
    const item = publishedViral().find((i) => i.id === id);
    return item ?? reply.code(404).send({ error: "Prompt belum tersedia." });
  });
  app.post("/api/studios/:id/preview", async (request) => {
    const user = await account(request, true);
    const { id } = z.object({ id: z.string().max(100) }).parse(request.params);
    const body = z
      .object({
        state: record.default({}),
        starter: z.boolean().default(false),
        engineVersion: z.union([z.literal(1), z.literal(2)]).default(1),
      })
      .parse(request.body);
    if (body.engineVersion === 2) {
      const result = buildStudioV2(body.state);
      if (result.service.recipeId !== id)
        throw Object.assign(
          new Error("Jasa tidak sesuai dengan alamat studio."),
          { statusCode: 400 },
        );
      return result;
    }
    try {
      return describeStudio(
        await ownedRecipe(id, user.id),
        body.state,
        body.starter,
      );
    } catch (e) {
      if ((e as { statusCode?: number }).statusCode) throw e;
      throw Object.assign(e as Error, { statusCode: 400 });
    }
  });
  app.post("/api/custom-preview", async (request) => {
    await account(request, true);
    const body = z.object({ recipe: z.unknown() }).parse(request.body);
    const result = validateRecipe(
      body.recipe,
      DOMAINS.map((d) => d.id),
    );
    if (!result.ok)
      return { valid: false, errors: result.errors.map(recipeError) };
    return {
      valid: true,
      prompt: describeStudio(getRecipe(result.recipe.id, result.recipe)).prompt,
    };
  });
  app.get("/api/studios/:id/template", async (request) => {
    const user = await account(request, true);
    const { id } = z.object({ id: z.string().max(100) }).parse(request.params);
    const recipe = await ownedRecipe(id, user.id);
    if (id.startsWith("x-")) {
      const original = (
        await pool.query(
          "SELECT data FROM aichemy_library WHERE user_id=$1 AND studio_id=$2 AND kind='studio'",
          [user.id, id],
        )
      ).rows[0].data.recipe;
      return {
        recipe: {
          ...original,
          id: `x-copy-${crypto.randomUUID().slice(0, 12)}`,
          label: `${original.label} — Salinan`,
        },
      };
    }
    return { recipe: cloneStudio(recipe) };
  });
  app.get("/api/library", async (request) => {
    const user = await account(request, true);
    return {
      items: (
        await pool.query(
          'SELECT id,kind,studio_id as "studioId",name,data,updated_at as "updatedAt" FROM aichemy_library WHERE user_id=$1 ORDER BY updated_at DESC',
          [user.id],
        )
      ).rows,
    };
  });
  app.put("/api/library/:id", async (request, reply) => {
    const user = await account(request, true);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const body = itemSchema.parse(request.body);
    if (body.kind === "studio") {
      const result = validateRecipe(
        body.data.recipe,
        DOMAINS.map((d) => d.id),
      );
      if (!result.ok || result.recipe.id !== body.studioId)
        return reply.code(400).send({
          error: "Definisi studio belum valid.",
          details: result.ok ? [] : result.errors.map(recipeError),
        });
      if (
        result.recipe.sections.some((s) =>
          s.fields.some((f) => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.key)),
        )
      )
        return reply.code(400).send({
          error: "Kunci kolom harus berupa huruf, angka, dan garis bawah.",
        });
      const duplicate = await pool.query(
        "SELECT id FROM aichemy_library WHERE user_id=$1 AND kind='studio' AND studio_id=$2 AND id<>$3",
        [user.id, body.studioId, id],
      );
      if (duplicate.rowCount)
        return reply
          .code(409)
          .send({ error: "ID studio sudah digunakan. Pilih ID lain." });
    } else {
      await ownedRecipe(body.studioId, user.id);
      if (
        body.data.engineVersion === 2 &&
        ["draft", "preset"].includes(body.kind)
      ) {
        const result = buildStudioV2(body.data.state);
        if (result.service.recipeId !== body.studioId)
          throw Object.assign(new Error("Data studio tidak sesuai."), {
            statusCode: 400,
          });
        if (
          body.data.manual !== null &&
          typeof body.data.manual !== "string" &&
          body.data.manual !== undefined
        )
          throw Object.assign(new Error("Suntingan prompt tidak valid."), {
            statusCode: 400,
          });
        if (body.data.clientModifiedAt !== undefined)
          z.iso.datetime().parse(body.data.clientModifiedAt);
        body.data = {
          ...body.data,
          schemaVersion: 2,
          state: result.state,
          manual: body.data.manual ?? null,
        };
      }
    }
    const saved = await pool.query(
      "INSERT INTO aichemy_library(id,user_id,kind,studio_id,name,data) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,studio_id=excluded.studio_id,name=excluded.name,data=excluded.data,updated_at=now() WHERE aichemy_library.user_id=$2 AND NOT (excluded.kind='draft' AND COALESCE(excluded.data->>'engineVersion','')='2' AND COALESCE(aichemy_library.data->>'engineVersion','')='2' AND COALESCE(aichemy_library.data->>'clientModifiedAt','') > COALESCE(excluded.data->>'clientModifiedAt','')) RETURNING id",
      [
        id,
        user.id,
        body.kind,
        body.studioId,
        body.name,
        JSON.stringify(body.data),
      ],
    );
    if (!saved.rowCount) {
      const owned = await pool.query(
        "SELECT 1 FROM aichemy_library WHERE id=$1 AND user_id=$2",
        [id, user.id],
      );
      return owned.rowCount
        ? reply.code(409).send({
            error:
              "Versi draft yang lebih baru sudah tersimpan. Muat ulang sebelum menyimpan.",
          })
        : reply.code(403).send({ error: "Item bukan milik akun Anda." });
    }
    return { id };
  });
  app.delete("/api/library/:id", async (request) => {
    const user = await account(request, true);
    const { id } = z.object({ id: uuid }).parse(request.params);
    await pool.query("DELETE FROM aichemy_library WHERE id=$1 AND user_id=$2", [
      id,
      user.id,
    ]);
    return { ok: true };
  });
  app.get("/api/orders", async (request) => {
    const user = await account(request);
    return {
      orders: (
        await pool.query(
          `SELECT ${orderSelect} FROM aichemy_orders WHERE user_id=$1 AND environment=$2 ORDER BY created_at DESC`,
          [user.id, config.PAYMENT_MODE],
        )
      ).rows,
    };
  });
  app.post("/api/checkout", async (request, reply) => {
    const user = await account(request);
    if (!user.emailVerified)
      return reply
        .code(403)
        .send({ error: "Verifikasi email sebelum melakukan pembayaran." });
    if (user.active)
      return reply
        .code(409)
        .send({ error: "Akun Anda sudah memiliki akses lifetime." });
    if (!config.MIDTRANS_SERVER_KEY || !config.MIDTRANS_CLIENT_KEY)
      return reply.code(503).send({
        error:
          "Pembayaran uji belum dikonfigurasi. Pengelola sedang menyiapkan checkout.",
      });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        `checkout:${user.id}:${config.PAYMENT_MODE}`,
      ]);
      const existing = (
        await client.query(
          "SELECT id,checkout_url as \"checkoutUrl\" FROM aichemy_orders WHERE user_id=$1 AND environment=$2 AND status IN ('created','pending') AND checkout_url IS NOT NULL ORDER BY created_at DESC LIMIT 1",
          [user.id, config.PAYMENT_MODE],
        )
      ).rows[0];
      if (existing) {
        await client.query("COMMIT");
        return existing;
      }
      const id = crypto.randomUUID();
      const checkoutUrl = await createCheckout(id, user.email, user.name);
      await client.query(
        "INSERT INTO aichemy_orders(id,user_id,amount,environment,status,checkout_url) VALUES($1,$2,$3,$4,$5,$6)",
        [id, user.id, PRICE, config.PAYMENT_MODE, "pending", checkoutUrl],
      );
      await client.query("COMMIT");
      return { id, checkoutUrl };
    } catch (error) {
      await client.query("ROLLBACK");
      app.log.error(error);
      return reply.code(502).send({ error: (error as Error).message });
    } finally {
      client.release();
    }
  });
  app.get("/api/orders/:id", async (request, reply) => {
    const user = await account(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const order = (
      await pool.query(
        `SELECT ${orderSelect} FROM aichemy_orders WHERE id=$1 AND user_id=$2 AND environment=$3`,
        [id, user.id, config.PAYMENT_MODE],
      )
    ).rows[0];
    if (!order)
      return reply.code(404).send({ error: "Pesanan tidak ditemukan." });
    return { order };
  });
  app.post("/api/orders/:id/refresh", async (request, reply) => {
    const user = await account(request);
    const { id } = z.object({ id: uuid }).parse(request.params);
    const order = (
      await pool.query(
        "SELECT id FROM aichemy_orders WHERE id=$1 AND user_id=$2 AND environment=$3",
        [id, user.id, config.PAYMENT_MODE],
      )
    ).rows[0];
    if (!order)
      return reply.code(404).send({ error: "Pesanan tidak ditemukan." });
    try {
      const verified = await getPayment(id);
      if (verified.order_id !== id) throw new Error("Pesanan tidak sesuai.");
      return { status: await applyPayment(verified) };
    } catch {
      return reply.code(502).send({
        error: "Status pembayaran belum tersedia. Coba lagi sebentar.",
      });
    }
  });
  app.post(
    "/api/payments/webhook",
    { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const body = z
        .object({
          order_id: uuid,
          status_code: z.string(),
          gross_amount: z.string(),
          signature_key: z.string(),
          transaction_status: z.string(),
        })
        .passthrough()
        .parse(request.body) as Payment;
      if (!verifySignature(body))
        return reply.code(403).send({ error: "Tanda tangan tidak valid." });
      const verified = await getPayment(body.order_id);
      if (verified.order_id !== body.order_id)
        return reply.code(400).send({ error: "Pesanan tidak sesuai." });
      await applyPayment(verified);
      return { ok: true };
    },
  );
  app.get("/api/admin", async (request) => {
    await admin(request);
    const [users, orders, audit, reviews] = await Promise.all([
      pool.query(
        'SELECT u.id,u.name,u.email,u."emailVerified",COALESCE(e.status,\'unpaid\') as access FROM "user" u LEFT JOIN aichemy_entitlements e ON e.user_id=u.id AND e.environment=$1 ORDER BY u."createdAt" DESC LIMIT 200',
        [config.PAYMENT_MODE],
      ),
      pool.query(
        'SELECT o.*,u.email FROM aichemy_orders o JOIN "user" u ON u.id=o.user_id ORDER BY o.created_at DESC LIMIT 200',
      ),
      pool.query(
        "SELECT * FROM aichemy_audit ORDER BY created_at DESC LIMIT 100",
      ),
      pool.query(
        "SELECT p.order_id,p.status,p.created_at,u.email FROM aichemy_payment_events p JOIN aichemy_orders o ON o.id=p.order_id JOIN \"user\" u ON u.id=o.user_id WHERE p.status IN ('partial_refund','partial_chargeback') AND o.environment=$1 ORDER BY p.created_at DESC LIMIT 100",
        [config.PAYMENT_MODE],
      ),
    ]);
    return {
      users: users.rows,
      orders: orders.rows,
      audit: audit.rows,
      reviews: reviews.rows,
    };
  });
  app.post("/api/admin/access", async (request, reply) => {
    const actor = await admin(request);
    const body = z
      .object({ userId: uuid, active: z.boolean() })
      .parse(request.body);
    const target = (
      await pool.query('SELECT id,"emailVerified" FROM "user" WHERE id=$1', [
        body.userId,
      ])
    ).rows[0];
    if (!target?.emailVerified)
      return reply
        .code(400)
        .send({ error: "Akun tidak ditemukan atau email belum diverifikasi." });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO aichemy_entitlements(id,user_id,environment,status) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,environment) DO UPDATE SET status=excluded.status,order_id=NULL",
        [
          crypto.randomUUID(),
          body.userId,
          config.PAYMENT_MODE,
          body.active ? "active" : "revoked",
        ],
      );
      await client.query(
        "INSERT INTO aichemy_audit(id,actor_id,target_id,action) VALUES($1,$2,$3,$4)",
        [
          crypto.randomUUID(),
          actor.id,
          body.userId,
          body.active ? "grant" : "revoke",
        ],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    return { ok: true };
  });
  return app;
}
function findLabel(id: string) {
  return LOOKS.find((look) => look.id === id)?.label ?? id;
}
