import { test, expect, type APIRequestContext } from "@playwright/test";
import { Pool } from "pg";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
const base = "http://localhost:5173";
const dbUrl =
  process.env.BROWSER_TEST_DATABASE_URL ??
  "postgres://localhost:5432/aichemy_dev";
if (
  !["localhost", "127.0.0.1"].includes(new URL(dbUrl).hostname) ||
  !new URL(dbUrl).pathname.endsWith("_dev")
)
  throw new Error("Test browser memerlukan database lokal *_dev.");
const pool = new Pool({ connectionString: dbUrl });
let userId = "";
const email = `browser-${crypto.randomUUID()}@aichemy.test`;
const password = "Aichemy-Browser-Test-2026!";
let memberState: Awaited<ReturnType<APIRequestContext["storageState"]>>;
async function verificationUrl(request: APIRequestContext, recipient: string) {
  const inbox = await (
    await request.get("http://localhost:8025/api/v1/messages")
  ).json();
  const message = inbox.messages.find((m: { To: { Address: string }[] }) =>
    m.To.some((t) => t.Address === recipient),
  );
  expect(message).toBeTruthy();
  const body = await (
    await request.get(`http://localhost:8025/api/v1/message/${message.ID}`)
  ).json();
  return String(body.Text).match(/https?:\/\/[^\s]+/)![0];
}
test.beforeAll(async ({ request }) => {
  const result = await request.post(`${base}/api/auth/sign-up/email`, {
    headers: { origin: base },
    data: {
      name: "Kreator Browser",
      email,
      password,
      callbackURL: "/checkout",
    },
  });
  expect(result.ok()).toBeTruthy();
  userId = (await result.json()).user.id;
  const verify = await request.get(await verificationUrl(request, email));
  expect(verify.ok()).toBeTruthy();
  memberState = await request.storageState();
  await pool.query(
    "INSERT INTO aichemy_entitlements(id,user_id,environment,status) VALUES($1,$2,'sandbox','active')",
    [crypto.randomUUID(), userId],
  );
  await mkdir("artifacts/screenshots", { recursive: true });
});
test.afterAll(async () => {
  if (userId) await pool.query('DELETE FROM "user" WHERE id=$1', [userId]);
  await pool.end();
});
test("landing page dan login responsif di empat ukuran dan dua tema", async ({
  page,
}) => {
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Gambar bagus",
    );
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await expect(page).toHaveScreenshot(`landing-${width}-light.png`);
    await page.getByRole("button", { name: "Gunakan tema gelap" }).click();
    await expect(page).toHaveScreenshot(`landing-${width}-dark.png`);
    await page.getByRole("button", { name: "Gunakan tema terang" }).click();
    if (width === 1440) {
      await page.screenshot({
        path: "artifacts/screenshots/landing-hero.jpg",
        type: "jpeg",
        quality: 90,
      });
      await page.locator(".relight-section").scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          page
            .locator(".relight-art img")
            .evaluateAll((imgs) =>
              imgs.every(
                (img) =>
                  (img as HTMLImageElement).complete &&
                  (img as HTMLImageElement).naturalWidth > 0,
              ),
            ),
        )
        .toBe(true);
      await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
      await page.screenshot({
        path: "artifacts/screenshots/landing-desktop.jpg",
        fullPage: true,
        type: "jpeg",
        quality: 85,
      });
    }
    await page.goto("/masuk");
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await expect(page).toHaveScreenshot(`login-${width}.png`);
    if (width === 1440)
      await page.screenshot({
        path: "artifacts/screenshots/login-desktop.jpg",
        type: "jpeg",
        quality: 85,
      });
  }
});
test("pengunjung diarahkan ke login dan akun berbayar membuka studio", async ({
  page,
}) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/masuk$/);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByPlaceholder("Kata sandi akunmu").fill(password);
  await page.getByRole("button", { name: "Masuk ke Aichemy" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByRole("heading", { name: /Mau bikin apa/ }),
  ).toBeVisible();
});
async function login(page: import("@playwright/test").Page) {
  // Reuse the genuinely email-verified fixture session; the separate test above exercises the login UI.
  await page.context().addCookies(memberState.cookies);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/app$/);
}
test("starter, sunting manual, remix, undo, preset, dan refresh menjaga data", async ({
  page,
}) => {
  await login(page);
  await page.goto("/app/studio/product?starter=1");
  await expect(
    page.getByLabel("Nama & deskripsi produk", { exact: false }),
  ).not.toBeEmpty();
  await page
    .getByLabel("Nama & deskripsi produk", { exact: false })
    .fill("A handmade ivory ceramic mug");
  await page.getByRole("button", { name: "Sunting", exact: true }).click();
  const manual =
    "A handmade ivory mug. This exact manual edit must survive remix and refresh.";
  await page.getByLabel("Sunting prompt bahasa Inggris").fill(manual);
  await page.getByRole("button", { name: "Acak Gaya", exact: true }).click();
  await expect(page.getByLabel("Sunting prompt bahasa Inggris")).toHaveValue(
    manual,
  );
  await page.getByRole("button", { name: "Batalkan perubahan" }).click();
  await expect(page.getByLabel("Sunting prompt bahasa Inggris")).toHaveValue(
    manual,
  );
  await page
    .getByRole("button", { name: "Simpan gaya sebagai preset" })
    .click();
  await page.getByLabel("Nama gaya").fill("Preset Browser");
  await page.getByRole("button", { name: "Simpan Gaya", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\?draft=/);
  await expect(page.locator(".save-indicator")).toContainText("Tersimpan");
  await page.reload();
  await page.getByRole("button", { name: "Sunting", exact: true }).click();
  await expect(page.getByLabel("Sunting prompt bahasa Inggris")).toHaveValue(
    manual,
  );
  await expect(
    page.getByLabel("Nama & deskripsi produk", { exact: false }),
  ).toHaveValue("A handmade ivory ceramic mug");
  await page.screenshot({
    path: "artifacts/screenshots/studio-desktop.jpg",
    fullPage: true,
    type: "jpeg",
    quality: 85,
  });
  await page.getByRole("button", { name: "Pakai Preset", exact: true }).click();
  await expect(page.getByText("Preset Browser", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Pakai Preset", exact: true }),
  ).toBeFocused();
  await page
    .getByLabel("Nama & deskripsi produk", { exact: false })
    .fill("A new description that a preset must never replace");
  await page.getByRole("button", { name: "Pakai Preset", exact: true }).click();
  await page.getByRole("button", { name: "Pakai", exact: true }).click();
  await expect(
    page.getByLabel("Nama & deskripsi produk", { exact: false }),
  ).toHaveValue("A new description that a preset must never replace");
  await expect(page.getByLabel("Sunting prompt bahasa Inggris")).toHaveValue(
    manual,
  );
  await page.getByRole("button", { name: /03 Selesaikan/ }).click();
  await expect(
    page.getByRole("heading", { name: "Racikanmu sudah siap." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Pratinjau", exact: true }).click();
  await expect(page.getByLabel("Sunting prompt bahasa Inggris")).toHaveValue(
    manual,
  );
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.screenshot({
    path: "artifacts/screenshots/studio-mobile.jpg",
    fullPage: true,
    type: "jpeg",
    quality: 85,
  });
});
test("studio pribadi bisa dibuat, disimpan, dan dibuka", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "Buat Studio", exact: true }).click();
  await page
    .getByLabel("Nama studio", { exact: true })
    .fill("Studio Kopi Browser");
  await page
    .getByLabel("Deskripsi singkat", { exact: true })
    .fill("Racikan foto kopi untuk pengujian.");
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page
    .getByRole("button", { name: "Simpan Studio", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByText("Studio Kopi Browser", { exact: true }),
  ).toBeVisible();
  await page.goto("/app/pustaka");
  await page.getByRole("button", { name: /Studio Pribadi/ }).click();
  await page.getByRole("button", { name: "Sunting", exact: true }).click();
  await page
    .getByLabel("Nama studio", { exact: true })
    .fill("Studio Kopi Diperbarui");
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page
    .getByRole("button", { name: "Simpan Studio", exact: true })
    .click();
  await expect(
    page.getByText("Studio Kopi Diperbarui", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Hapus Studio Kopi Diperbarui", exact: true })
    .click();
  await page.getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(
    page.getByText("Studio Kopi Diperbarui", { exact: true }),
  ).toHaveCount(0);
});
test("aksesibilitas utama, keyboard dialog, clipboard, ekspor, dan reduced motion", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/", "/masuk"]) {
    await page.goto(route);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations,
      JSON.stringify(
        audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ),
    ).toEqual([]);
    if (route === "/") {
      await page.getByRole("button", { name: "Gunakan tema gelap" }).click();
      const darkAudit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        darkAudit.violations,
        JSON.stringify(
          darkAudit.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        ),
      ).toEqual([]);
      await page.getByRole("button", { name: "Gunakan tema terang" }).click();
    }
  }
  await login(page);
  await page.goto("/app/studio/product?starter=1");
  await expect(
    page.getByRole("button", { name: "Salin Prompt", exact: true }).first(),
  ).toBeVisible();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .getByRole("button", { name: "Salin Prompt", exact: true })
    .first()
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("skincare serum");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unduh .txt", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.txt$/);
  await page
    .getByRole("button", { name: "Simpan gaya sebagai preset" })
    .click();
  await page.getByLabel("Nama gaya").fill("Uji Fokus");
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Tutup dialog" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Simpan Gaya", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    )
    .toBe(true);
  for (const dark of [false, true]) {
    const dismiss = page.getByRole("button", { name: "Tutup pemberitahuan" });
    if (await dismiss.isVisible()) await dismiss.click();
    if (dark)
      await page.getByRole("button", { name: "Gunakan tema gelap" }).click();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations,
      JSON.stringify(
        audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ),
    ).toEqual([]);
    for (const width of [390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      await expect(page.locator(".save-indicator")).toContainText("Tersimpan");
      await expect(page).toHaveScreenshot(
        `studio-${width}-${dark ? "dark" : "light"}.png`,
      );
    }
  }
});
