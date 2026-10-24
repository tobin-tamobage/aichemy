import { before, after, test, mock } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { getMigrations } from "better-auth/db/migration";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { auth } from "../server/auth";
import { pool, db } from "../server/db";
import { createServer, applyPayment } from "../server/app";
import { config } from "../server/config";
import type { Payment } from "../server/payments";
import { PRICE } from "../shared/product";
import { NEW_SERVICES } from "../shared/services-v3";
if (
  config.NODE_ENV !== "test" ||
  !new URL(config.DATABASE_URL).pathname.endsWith("_test")
)
  throw new Error(
    "Pengujian API hanya boleh menggunakan database *_test dengan NODE_ENV=test.",
  );
let app: Awaited<ReturnType<typeof createServer>>;
const users: string[] = [];
const fixtures: { id: string; cookie: string }[] = [];
const origin = new URL(config.APP_URL).origin;
async function fixture() {
  const email = `test-${crypto.randomUUID()}@aichemy.test`;
  const password = "Aichemy-test-password-2026";
  const signup = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { origin },
    payload: {
      name: "Kreator Test",
      email,
      password,
      callbackURL: "/checkout",
    },
  });
  assert.equal(signup.statusCode, 200, signup.body);
  const id = signup.json().user.id;
  users.push(id);
  await pool.query('UPDATE "user" SET "emailVerified"=true WHERE id=$1', [id]);
  const login = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: { origin },
    payload: { email, password },
  });
  assert.equal(login.statusCode, 200, login.body);
  const raw = login.headers["set-cookie"];
  const cookie = (Array.isArray(raw) ? raw : [raw as string])
    .map((value) => value.split(";")[0])
    .join("; ");
  return { id, cookie };
}
before(async () => {
  await (await getMigrations(auth.options)).runMigrations();
  await migrate(db, { migrationsFolder: "./server/db/migrations" });
  await pool.query('DELETE FROM "rateLimit"'); // Isolated *_test database only.
  app = await createServer();
  fixtures.push(await fixture(), await fixture());
});
after(async () => {
  mock.restoreAll();
  if (users.length)
    await pool.query('DELETE FROM "user" WHERE id=ANY($1)', [users]);
  await app?.close();
  await pool.end();
});
// Separate IP keeps the bounded public-demo stress check independent of account fixtures.
test("demo publik dibatasi dan origin asing ditolak dengan aman", async () => {
  assert.equal(
    (
      await app.inject({
        method: "POST",
        url: "/api/demo/preview",
        headers: { origin: "https://example.invalid" },
        payload: { serviceId: "product" },
      })
    ).statusCode,
    403,
  );
  let limited: Awaited<ReturnType<typeof app.inject>> | undefined;
  for (let n = 0; n < 42; n++) {
    const response = await app.inject({
      method: "POST",
      url: "/api/demo/preview",
      remoteAddress: "127.0.0.77",
      headers: { origin },
      payload: { serviceId: "product" },
    });
    if (response.statusCode === 429) {
      limited = response;
      break;
    }
    assert.equal(response.statusCode, 200);
  }
  assert.ok(limited);
  assert.match(limited.json().error, /Terlalu banyak percobaan/);
});
test("akses API studio ditolak untuk pengunjung dan akun belum berbayar", async () => {
  assert.equal(
    (await app.inject({ method: "GET", url: "/api/studios" })).statusCode,
    401,
  );
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/studios",
        headers: { cookie: fixtures[0].cookie },
      })
    ).statusCode,
    402,
  );
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/admin",
        headers: { cookie: fixtures[0].cookie },
      })
    ).statusCode,
    403,
  );
});
test("V2 premium dan Prompt Viral tetap memerlukan sesi serta entitlement", async () => {
  for (const url of [
    "/api/viral-prompts",
    "/api/viral-prompts/flash-digicam",
  ]) {
    assert.equal((await app.inject({ method: "GET", url })).statusCode, 401);
  }
  const demo = await app.inject({
    method: "POST",
    url: "/api/demo/preview",
    headers: { origin },
    payload: { serviceId: "formal", selections: { background: "red" } },
  });
  assert.equal(demo.statusCode, 200);
  assert.equal(demo.json().engineVersion, 2);
  const denied = await app.inject({
    method: "POST",
    url: "/api/demo/preview",
    headers: { origin },
    payload: { serviceId: "branding" },
  });
  assert.equal(denied.statusCode, 400);
  const paid = fixtures[0];
  await pool.query(
    "INSERT INTO aichemy_entitlements(id,user_id,environment,status) VALUES($1,$2,'sandbox','active') ON CONFLICT(user_id,environment) DO UPDATE SET status='active'",
    [crypto.randomUUID(), paid.id],
  );
  const preview = await app.inject({
    method: "POST",
    url: "/api/studios/product/preview",
    headers: { origin, cookie: paid.cookie },
    payload: {
      engineVersion: 2,
      state: { serviceId: "product", setId: "product-skincare" },
    },
  });
  assert.equal(preview.statusCode, 200);
  assert.equal(preview.json().document.engineVersion, 2);
  const mismatch = await app.inject({
    method: "POST",
    url: "/api/studios/product/preview",
    headers: { origin, cookie: paid.cookie },
    payload: { engineVersion: 2, state: { serviceId: "formal" } },
  });
  assert.equal(mismatch.statusCode, 400);
  const full = await app.inject({
    method: "GET",
    url: "/api/viral-prompts/flash-digicam",
    headers: { cookie: paid.cookie },
  });
  assert.equal(full.statusCode, 200);
  assert.ok(full.json().prompt.length > 200);
  const list = await app.inject({
    method: "GET",
    url: "/api/viral-prompts",
    headers: { cookie: paid.cookie },
  });
  assert.equal(list.statusCode, 200);
  assert.equal(list.json().items.length, 18);
  assert.ok(
    list
      .json()
      .items.every((v: { medium: string }) => v.medium === "photography"),
  );
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/viral-prompts/clay",
        headers: { cookie: paid.cookie },
      })
    ).statusCode,
    404,
  );
  assert.ok(list.json().items.every((v: { prompt?: string }) => !v.prompt));
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/viral-prompts/unpublished",
        headers: { cookie: paid.cookie },
      })
    ).statusCode,
    404,
  );
  await pool.query(
    "UPDATE aichemy_entitlements SET status='revoked' WHERE user_id=$1",
    [paid.id],
  );
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/viral-prompts/flash-digicam",
        headers: { cookie: paid.cookie },
      })
    ).statusCode,
    402,
  );
  assert.equal(
    (
      await app.inject({
        method: "POST",
        url: "/api/studios/product/preview",
        headers: { origin, cookie: paid.cookie },
        payload: { engineVersion: 2, state: { serviceId: "product" } },
      })
    ).statusCode,
    402,
  );
  await pool.query(
    "UPDATE aichemy_entitlements SET status='active' WHERE user_id=$1",
    [paid.id],
  );
});
test("jasa baru tetap dibatasi akses dan draft V3 tersimpan pada akun pembuat", async () => {
  for (const service of NEW_SERVICES) {
    const payload = {
      engineVersion: 2,
      state: {
        catalogVersion: 3,
        serviceId: service.id,
        setId: service.sets[0].id,
      },
    };
    const url = `/api/studios/${service.recipeId}/preview`;
    assert.equal(
      (await app.inject({ method: "POST", url, headers: { origin }, payload }))
        .statusCode,
      401,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url,
          headers: { origin, cookie: fixtures[1].cookie },
          payload,
        })
      ).statusCode,
      402,
    );
    const result = await app.inject({
      method: "POST",
      url,
      headers: { origin, cookie: fixtures[0].cookie },
      payload,
    });
    assert.equal(result.statusCode, 200, result.body);
    assert.equal(result.json().service.id, service.id);
    assert.equal(result.json().catalogVersion, 3);
    assert.ok(
      result
        .json()
        .fields.every((f: { options: { value: string }[] }) =>
          f.options.some((o) => o.value === "__skip"),
        ),
    );
    const id = crypto.randomUUID();
    const data = {
      schemaVersion: 2,
      engineVersion: 2,
      state: result.json().state,
      manual: "MANUAL V3 PROTECTED",
    };
    const save = await app.inject({
      method: "PUT",
      url: `/api/library/${id}`,
      headers: { origin, cookie: fixtures[0].cookie },
      payload: {
        kind: "draft",
        studioId: service.recipeId,
        name: `V3 ${service.id}`,
        data,
      },
    });
    assert.equal(save.statusCode, 200, save.body);
  }
  const rows = await app.inject({
    method: "GET",
    url: "/api/library",
    headers: { cookie: fixtures[0].cookie },
  });
  assert.equal(
    rows
      .json()
      .items.filter((item: { name: string }) => item.name.startsWith("V3 "))
      .length,
    7,
  );
  const unpaidRows = await app.inject({
    method: "GET",
    url: "/api/library",
    headers: { cookie: fixtures[1].cookie },
  });
  assert.equal(unpaidRows.statusCode, 402);
});
test("autosave V2 terlambat tidak menimpa prompt manual yang lebih baru", async () => {
  const user = fixtures[0];
  const id = crypto.randomUUID();
  const state = {
    serviceId: "product",
    setId: "product-marketplace",
    selections: {},
  };
  const put = (manual: string, clientModifiedAt: string) =>
    app.inject({
      method: "PUT",
      url: `/api/library/${id}`,
      headers: { origin, cookie: user.cookie },
      payload: {
        kind: "draft",
        studioId: "product",
        name: "Uji urutan autosave",
        data: {
          schemaVersion: 2,
          engineVersion: 2,
          state,
          manual,
          clientModifiedAt,
        },
      },
    });
  assert.equal(
    (await put("NEWEST MANUAL", "2026-10-22T12:00:02.000Z")).statusCode,
    200,
  );
  assert.equal(
    (await put("STALE MANUAL", "2026-10-22T12:00:01.000Z")).statusCode,
    409,
  );
  const saved = await pool.query(
    "SELECT data FROM aichemy_library WHERE id=$1 AND user_id=$2",
    [id, user.id],
  );
  assert.equal(saved.rows[0].data.manual, "NEWEST MANUAL");
});
test("pembayaran terverifikasi mengaktifkan akun tepat sekali tanpa kedaluwarsa", async () => {
  const id = crypto.randomUUID();
  await pool.query(
    "INSERT INTO aichemy_orders(id,user_id,amount,environment,status) VALUES($1,$2,$3,'sandbox','pending')",
    [id, fixtures[0].id, PRICE],
  );
  const payment: Payment = {
    order_id: id,
    status_code: "200",
    gross_amount: "149000.00",
    transaction_status: "settlement",
    currency: "IDR",
  };
  assert.equal(await applyPayment(payment), "paid");
  assert.equal(await applyPayment(payment), "paid");
  assert.equal(
    await applyPayment({ ...payment, transaction_status: "pending" }),
    "paid",
  );
  const granted = await pool.query(
    "SELECT * FROM aichemy_entitlements WHERE user_id=$1",
    [fixtures[0].id],
  );
  assert.equal(granted.rowCount, 1);
  assert.equal(granted.rows[0].status, "active");
  await pool.query(
    "UPDATE aichemy_entitlements SET status='revoked' WHERE user_id=$1",
    [fixtures[0].id],
  );
  await applyPayment(payment);
  assert.equal(
    (
      await pool.query(
        "SELECT status FROM aichemy_entitlements WHERE user_id=$1",
        [fixtures[0].id],
      )
    ).rows[0].status,
    "revoked",
    "webhook duplikat tidak boleh membatalkan pencabutan admin",
  );
  await pool.query(
    "UPDATE aichemy_entitlements SET status='active' WHERE user_id=$1",
    [fixtures[0].id],
  );
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/studios",
        headers: { cookie: fixtures[0].cookie },
      })
    ).statusCode,
    200,
  );
  await pool.query(
    "UPDATE aichemy_entitlements SET environment='production' WHERE user_id=$1",
    [fixtures[0].id],
  );
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/studios",
        headers: { cookie: fixtures[0].cookie },
      })
    ).statusCode,
    402,
  );
  await pool.query(
    "UPDATE aichemy_entitlements SET environment='sandbox' WHERE user_id=$1",
    [fixtures[0].id],
  );
});
test("webhook palsu ditolak; webhook sah memakai status server penyedia", async () => {
  const id = crypto.randomUUID();
  await pool.query(
    "INSERT INTO aichemy_orders(id,user_id,amount,environment,status) VALUES($1,$2,$3,'sandbox','pending')",
    [id, fixtures[1].id, PRICE],
  );
  const payload = {
    order_id: id,
    status_code: "200",
    gross_amount: "149000.00",
    transaction_status: "settlement",
    signature_key: "bad",
  };
  assert.equal(
    (
      await app.inject({
        method: "POST",
        url: "/api/payments/webhook",
        payload,
      })
    ).statusCode,
    403,
  );
  payload.signature_key = createHash("sha512")
    .update(id + "200" + "149000.00" + config.MIDTRANS_SERVER_KEY)
    .digest("hex");
  const intercepted = mock.method(globalThis, "fetch", async () =>
    Response.json({ ...payload, currency: "IDR" }),
  );
  assert.equal(
    (
      await app.inject({
        method: "POST",
        url: "/api/payments/webhook",
        payload,
      })
    ).statusCode,
    200,
  );
  intercepted.mock.restore();
  assert.equal(
    (await pool.query("SELECT status FROM aichemy_orders WHERE id=$1", [id]))
      .rows[0].status,
    "paid",
  );
});
test("draft dan preset tidak bisa dibaca atau ditimpa akun lain", async () => {
  const id = crypto.randomUUID();
  const body = {
    kind: "draft",
    studioId: "product",
    name: "Racikan pribadi",
    data: {
      state: { productName: "My private product" },
      manual: "My private manual prompt",
    },
  };
  const one = { cookie: fixtures[0].cookie, origin };
  const two = { cookie: fixtures[1].cookie, origin };
  assert.equal(
    (
      await app.inject({
        method: "PUT",
        url: `/api/library/${id}`,
        headers: one,
        payload: body,
      })
    ).statusCode,
    200,
  );
  const list = (
    await app.inject({ method: "GET", url: "/api/library", headers: two })
  ).json();
  assert.ok(!list.items.some((i: { id: string }) => i.id === id));
  assert.equal(
    (
      await app.inject({
        method: "PUT",
        url: `/api/library/${id}`,
        headers: two,
        payload: { ...body, name: "Hijacked" },
      })
    ).statusCode,
    403,
  );
  await app.inject({
    method: "DELETE",
    url: `/api/library/${id}`,
    headers: two,
  });
  assert.equal(
    (await pool.query("SELECT name FROM aichemy_library WHERE id=$1", [id]))
      .rows[0].name,
    body.name,
  );
  assert.equal(
    (
      await app.inject({
        method: "PUT",
        url: `/api/library/${id}`,
        headers: { ...one, origin: "https://wrong.example" },
        payload: body,
      })
    ).statusCode,
    403,
  );
});
test("semua studio dan starter bisa diakses melalui API berbayar", async () => {
  const headers = { cookie: fixtures[0].cookie, origin };
  const studios = (
    await app.inject({ method: "GET", url: "/api/studios", headers })
  ).json().studios;
  assert.equal(studios.length, 10);
  for (const studio of studios) {
    const response = await app.inject({
      method: "POST",
      url: `/api/studios/${studio.id}/preview`,
      headers,
      payload: { starter: true },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.ok(response.json().prompt.length > 30);
  }
});
test("pesanan dan nominal tidak dapat dimanipulasi oleh akun lain", async () => {
  const id = crypto.randomUUID();
  await pool.query(
    "INSERT INTO aichemy_orders(id,user_id,amount,environment,status) VALUES($1,$2,$3,'sandbox','pending')",
    [id, fixtures[0].id, PRICE],
  );
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: `/api/orders/${id}`,
        headers: { cookie: fixtures[1].cookie },
      })
    ).statusCode,
    404,
  );
  await assert.rejects(() =>
    applyPayment({
      order_id: id,
      status_code: "200",
      gross_amount: "1",
      transaction_status: "settlement",
    }),
  );
  assert.equal(
    (await pool.query("SELECT status FROM aichemy_orders WHERE id=$1", [id]))
      .rows[0].status,
    "pending",
  );
});
test("template duplikat sepuluh studio tetap valid untuk builder pribadi", async () => {
  const headers = { cookie: fixtures[0].cookie, origin };
  const studios = (
    await app.inject({ method: "GET", url: "/api/studios", headers })
  ).json().studios;
  for (const studio of studios) {
    const template = (
      await app.inject({
        method: "GET",
        url: `/api/studios/${studio.id}/template`,
        headers,
      })
    ).json().recipe;
    const result = (
      await app.inject({
        method: "POST",
        url: "/api/custom-preview",
        headers,
        payload: { recipe: template },
      })
    ).json();
    assert.equal(
      result.valid,
      true,
      studio.id + ": " + JSON.stringify(result.errors),
    );
  }
});
test("checkout menahan nominal di server dan mengizinkan mencoba setelah kedaluwarsa", async () => {
  const user = await fixture();
  const headers = { cookie: user.cookie, origin };
  let amount = 0;
  const intercepted = mock.method(
    globalThis,
    "fetch",
    async (_url: unknown, init?: RequestInit) => {
      amount = JSON.parse(String(init?.body)).transaction_details.gross_amount;
      return Response.json({
        redirect_url: "https://app.sandbox.midtrans.com/snap/test",
      });
    },
  );
  try {
    const first = await app.inject({
      method: "POST",
      url: "/api/checkout",
      headers,
      payload: { amount: 1 },
    });
    assert.equal(first.statusCode, 200, first.body);
    assert.equal(amount, PRICE);
    const id = first.json().id;
    const same = await app.inject({
      method: "POST",
      url: "/api/checkout",
      headers,
    });
    assert.equal(same.json().id, id);
    await applyPayment({
      order_id: id,
      status_code: "200",
      gross_amount: "149000",
      transaction_status: "expire",
    });
    const retry = await app.inject({
      method: "POST",
      url: "/api/checkout",
      headers,
    });
    assert.equal(retry.statusCode, 200);
    assert.notEqual(retry.json().id, id);
  } finally {
    intercepted.mock.restore();
  }
});
test("email nyata Mailpit memverifikasi akun dan reset mencabut sesi lama", async () => {
  await pool.query('DELETE FROM "rateLimit"');
  const email = `auth-${crypto.randomUUID()}@aichemy.test`;
  const password = "Aichemy-Auth-Test-2026!";
  const signup = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { origin },
    payload: { name: "Uji Email", email, password, callbackURL: "/checkout" },
  });
  assert.equal(signup.statusCode, 200, signup.body);
  const id = signup.json().user.id;
  users.push(id);
  const inboxLink = async (subject: string) => {
    const inbox = (await (
      await fetch("http://localhost:8025/api/v1/messages")
    ).json()) as {
      messages: { ID: string; Subject: string; To: { Address: string }[] }[];
    };
    const message = inbox.messages.find(
      (m) =>
        m.Subject.includes(subject) && m.To.some((to) => to.Address === email),
    );
    assert.ok(message, "Email benar-benar diterima melalui SMTP");
    const body = (await (
      await fetch(`http://localhost:8025/api/v1/message/${message.ID}`)
    ).json()) as { Text: string };
    return new URL(body.Text.match(/https?:\/\/[^\s]+/)![0]);
  };
  const unverified = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: { origin },
    payload: { email, password },
  });
  assert.equal(unverified.statusCode, 403);
  const link = await inboxLink("Verifikasi");
  const verified = await app.inject({
    method: "GET",
    url: link.pathname + link.search,
  });
  assert.equal(verified.statusCode, 302, verified.body);
  const cookie = verified.headers["set-cookie"];
  const oldSession = (Array.isArray(cookie) ? cookie : [cookie as string])
    .map((v) => v.split(";")[0])
    .join("; ");
  assert.ok(
    (
      await app.inject({
        method: "GET",
        url: "/api/session",
        headers: { cookie: oldSession },
      })
    ).json().user,
  );
  const requestReset = await app.inject({
    method: "POST",
    url: "/api/auth/request-password-reset",
    headers: { origin },
    payload: { email, redirectTo: "/atur-ulang-kata-sandi" },
  });
  assert.equal(requestReset.statusCode, 200, requestReset.body);
  const resetLink = await inboxLink("Atur ulang");
  const redirect = await app.inject({
    method: "GET",
    url: resetLink.pathname + resetLink.search,
  });
  const token = new URL(
    String(redirect.headers.location),
    origin,
  ).searchParams.get("token");
  assert.ok(token);
  const newPassword = "Aichemy-New-Password-2026!";
  const reset = await app.inject({
    method: "POST",
    url: "/api/auth/reset-password",
    headers: { origin },
    payload: { token, newPassword },
  });
  assert.equal(reset.statusCode, 200, reset.body);
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/session",
        headers: { cookie: oldSession },
      })
    ).json().user,
    null,
  );
  assert.equal(
    (
      await app.inject({
        method: "POST",
        url: "/api/auth/reset-password",
        headers: { origin },
        payload: { token, newPassword },
      })
    ).statusCode,
    400,
    "Token hanya dapat dipakai sekali",
  );
  const login = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: { origin },
    payload: { email, password: newPassword },
  });
  assert.equal(login.statusCode, 200, login.body);
  const raw = login.headers["set-cookie"];
  const session = (Array.isArray(raw) ? raw : [raw as string])
    .map((v) => v.split(";")[0])
    .join("; ");
  assert.equal(
    (
      await app.inject({
        method: "POST",
        url: "/api/auth/sign-out",
        headers: { origin, cookie: session },
        payload: {},
      })
    ).statusCode,
    200,
  );
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/session",
        headers: { cookie: session },
      })
    ).json().user,
    null,
  );
});
