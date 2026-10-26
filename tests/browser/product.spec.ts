import { test, expect, type APIRequestContext } from "@playwright/test";
import { Pool } from "pg";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { NEW_SERVICES } from "../../shared/services-v3";
const base = process.env.BROWSER_TEST_BASE_URL ?? "http://localhost:5173";
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
  let messageId = "";
  await expect
    .poll(
      async () => {
        const inbox = await (
          await request.get("http://localhost:8025/api/v1/messages")
        ).json();
        messageId =
          inbox.messages.find(
            (message: { ID: string; To: { Address: string }[] }) =>
              message.To.some((target) => target.Address === recipient),
          )?.ID ?? "";
        return messageId;
      },
      {
        timeout: 15000,
        message: "Email verifikasi fixture belum sampai di Mailpit.",
      },
    )
    .not.toBe("");
  const body = await (
    await request.get(`http://localhost:8025/api/v1/message/${messageId}`)
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
  expect(result.ok(), `${result.status()} ${await result.text()}`).toBeTruthy();
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
test("galeri luas: cari, muat lagi, pilih, Tanpa, dan pulihkan draft hewan", async ({
  page,
}) => {
  test.setTimeout(120000);
  await login(page);
  await page.goto("/app/studio/product?service=pets&set=pets-cat&starter=1");
  const place = page.getByRole("group", { name: "Tempat", exact: true });
  await expect(place).toContainText("36 pilihan + Tanpa");
  await place.locator(".v2-choice-current").click();
  let dialog = page.getByRole("dialog");
  await expect(dialog.locator(".v2-gallery-select")).toHaveCount(24);
  await dialog
    .getByRole("button", { name: /Tampilkan 13 pilihan lagi/ })
    .click();
  await expect(dialog.locator(".v2-gallery-select")).toHaveCount(37);
  await dialog.locator(".v2-gallery-search input").fill("teras rumah");
  await expect(dialog.locator(".v2-gallery-select")).toHaveCount(1);
  await dialog.locator(".v2-gallery-select").click();
  await expect(dialog).toHaveCount(0);
  await expect(place.locator(".v2-choice-current")).toContainText(
    "Teras rumah",
  );
  await expect(place.locator(".v2-choice-current")).toBeFocused();
  const props = page.getByRole("group", {
    name: "Tambahan di sekitar hewan",
    exact: true,
  });
  await expect(props.locator(".v2-choice-current")).toContainText(
    "Tanpa arahan tambahan",
  );
  await props.locator(".v2-choice-current").click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Bola besar/, exact: false })
    .first()
    .click();
  await expect(props.locator(".v2-choice-current")).toContainText("Bola besar");
  await expect(page.locator(".v2-save-status")).toContainText(
    "Tersimpan di akun",
  );
  await page.reload();
  await expect(place.locator(".v2-choice-current")).toContainText(
    "Teras rumah",
  );
  await expect(props.locator(".v2-choice-current")).toContainText("Bola besar");
  await props
    .getByRole("button", { name: "Tanpa arahan tambahan", exact: true })
    .click();
  await expect(props.locator(".v2-choice-current")).toContainText(
    "Tanpa arahan tambahan",
  );
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (mode) =>
          document.documentElement.classList.toggle("dark", mode === "dark"),
        theme,
      );
      await place.locator(".v2-choice-current").click();
      dialog = page.getByRole("dialog");
      await dialog
        .getByRole("button", { name: "Luar ruangan", exact: true })
        .click();
      await expect(dialog.locator(".v2-gallery-select img")).toHaveCount(4);
      await expect
        .poll(() =>
          dialog
            .locator(".v2-gallery-select img")
            .evaluateAll((images) =>
              images.every(
                (node) =>
                  (node as HTMLImageElement).complete &&
                  (node as HTMLImageElement).naturalWidth > 0,
              ),
            ),
        )
        .toBeTruthy();
      await page.screenshot({
        path: `artifacts/screenshots/expanded-pets-photos-${width}-${theme}.png`,
      });
      await dialog
        .getByRole("button", { name: "Warna polos", exact: true })
        .click();
      await expect(dialog.locator(".v2-gallery-select")).toHaveCount(24);
      await expect(dialog.locator(".v2-gallery-select img")).toHaveCount(0);
      await page.screenshot({
        path: `artifacts/screenshots/expanded-pets-gallery-${width}-${theme}.png`,
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      if (width === 390 && theme === "light") {
        const audit = await new AxeBuilder({ page })
          .include("dialog")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(audit.violations).toEqual([]);
      }
      await page.keyboard.press("Escape");
    }
  }
});
test("tujuh jasa baru dapat dibuka, sampul relevan, dan filter katalog mudah dipakai", async ({
  page,
}) => {
  await login(page);
  await page.getByLabel("Cari jasa", { exact: true }).fill("baju");
  await expect(
    page.locator(".v2-member-services .v2-service-card"),
  ).toHaveCount(1);
  await expect(page.locator(".v2-member-services")).toContainText(/fashion/i);
  await page.getByLabel("Cari jasa", { exact: true }).clear();
  await page
    .locator(".v3-service-groups")
    .getByRole("button", { name: /Ruang & lainnya/ })
    .click();
  await expect(
    page.locator(".v2-member-services .v2-service-card"),
  ).toHaveCount(3);
  await page
    .locator(".v3-service-groups")
    .getByRole("button", { name: /^Semua/ })
    .click();
  for (const service of NEW_SERVICES) {
    await page
      .getByRole("button", { name: `Pilih set ${service.label}`, exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator(".v2-set-picker a")).toHaveCount(6);
    await dialog
      .locator(".v2-set-picker img")
      .evaluateAll((images) =>
        images.forEach((img) => ((img as HTMLImageElement).loading = "eager")),
      );
    await expect
      .poll(() =>
        dialog
          .locator(".v2-set-picker img")
          .evaluateAll((images) =>
            images.every(
              (img) =>
                (img as HTMLImageElement).complete &&
                (img as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    await dialog.locator(".v2-set-picker a").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      service.label,
    );
    await expect(
      page
        .getByRole("group", { name: "Gaya awal", exact: true })
        .locator("img"),
    ).toHaveAttribute("src", new RegExp(`/portfolio/${service.id}-`));
    await expect(page.locator(".v2-save-status")).toContainText(
      "Tersimpan di akun",
    );
    const rows = (await (await page.request.get("/api/library")).json()).items;
    expect(
      rows.some(
        (i: LibraryFixture) =>
          (i.data.state as { serviceId?: string })?.serviceId === service.id,
      ),
    ).toBeTruthy();
    await page.goto("/app");
  }
});
test("Tanpa, pencarian racikan, prompt manual dan draft lama tetap aman di HP", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto(
    "/app/studio/portrait?service=creator&set=creator-cafe&starter=1",
  );
  await expect(
    page.getByRole("group", { name: "Cahaya", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Cari pengaturan racikan").fill("cahaya");
  const light = page.getByRole("group", { name: "Cahaya", exact: true });
  await light
    .getByRole("button", { name: "Tanpa arahan tambahan", exact: true })
    .click();
  await expect(light.locator(".v2-choice-current")).toContainText(
    "Tanpa arahan tambahan",
  );
  await page.getByLabel("Cari pengaturan racikan").clear();
  await page
    .getByRole("group", { name: "Tampilkan pengaturan", exact: true })
    .getByRole("button", { name: "Tidak diatur", exact: true })
    .click();
  await expect(light).toBeVisible();
  await page
    .getByRole("group", { name: "Tampilkan pengaturan", exact: true })
    .getByRole("button", { name: "Semua", exact: true })
    .click();
  await page.getByRole("tab", { name: /^Prompt/ }).click();
  await page.getByRole("button", { name: "Sunting", exact: true }).click();
  const manual = "My character, my precise manual photography prompt.";
  await page.getByLabel("Sunting prompt manual").fill(manual);
  await expect(page.locator(".v2-save-status")).toContainText(
    "Tersimpan di akun",
  );
  await page.reload();
  await page.getByRole("tab", { name: /^Prompt/ }).click();
  await expect(page.getByLabel("Sunting prompt manual")).toHaveValue(manual);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .locator(".v2-mobile-copy")
    .getByRole("button", { name: "Salin prompt", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(manual);
  await page.getByRole("tab", { name: "Racik", exact: true }).click();
  await expect(
    page
      .getByRole("group", { name: "Cahaya", exact: true })
      .locator(".v2-choice-current"),
  ).toContainText("Tanpa arahan tambahan");
  await page.route("**/api/studios/*/preview", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Pratinjau uji sementara gagal." }),
    }),
  );
  await page
    .getByRole("group", { name: "Tempat", exact: true })
    .locator(".v2-choice-current")
    .click();
  await page
    .getByRole("dialog")
    .locator(".v2-gallery-select")
    .filter({ hasText: "Tanpa arahan tambahan" })
    .click();
  await expect(page.locator(".v2-prompt-panel .v2-notice")).toContainText(
    "Pratinjau uji sementara gagal",
  );
  await page
    .locator(".v2-studio-actions")
    .getByRole("button", { name: "Simpan Gaya", exact: true })
    .click();
  await page
    .getByLabel("Nama gaya", { exact: true })
    .fill("Pilihan saat pratinjau gagal");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Simpan gaya", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const entries = (await (await page.request.get("/api/library")).json()).items;
  const savedPreset = entries.find(
    (item: { name: string }) => item.name === "Pilihan saat pratinjau gagal",
  );
  expect(savedPreset.data.state.selections.background).toBe("__skip");
  expect(savedPreset.data.state.selections.lighting).toBe("__skip");
  await page.unroute("**/api/studios/*/preview");
});
test("landing page dan login responsif di empat ukuran dan dua tema", async ({
  page,
}) => {
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Bangun Studio",
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
    if (width === 390) {
      const menu = page.getByRole("button", { name: "Buka menu", exact: true });
      await menu.click();
      await expect(
        page
          .getByRole("navigation", { name: "Navigasi utama" })
          .getByRole("link")
          .first(),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
      await menu.click();
      await page
        .getByRole("navigation", { name: "Navigasi utama" })
        .getByRole("link", { name: "Cara Kerja", exact: true })
        .click();
      await expect(page.locator("#cara-kerja h2")).toBeFocused();
      await expect(
        page.getByRole("button", { name: "Buka menu", exact: true }),
      ).toHaveAttribute("aria-expanded", "false");
    }
    if (width === 1440) {
      await page.screenshot({
        path: "artifacts/screenshots/landing-hero.jpg",
        type: "jpeg",
        quality: 90,
      });
      await page.locator(".v2-gallery-section").scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          page
            .locator(".v2-case-grid img")
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
    await expect(page.locator(".auth-art-label")).toContainText(
      "RUANG KERJA STUDIO AI-MU",
    );
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
    page.getByRole("heading", { name: /Mau membuat apa/ }),
  ).toBeVisible();
});
test("cara kerja bergambar tanpa demo, contoh jasa bisa difilter, dan potensi omzet mudah dibaca", async ({
  page,
}) => {
  const demoRequests: string[] = [];
  await page.route("**/api/demo/preview", (route) => {
    demoRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto("/");
  const slider = page.locator(".v2-hero-work").getByRole("slider");
  await slider.focus();
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("49");
  await page
    .locator(".v2-hero-tabs")
    .getByRole("button", { name: "Produk", exact: true })
    .click();
  await expect(page.locator(".v2-work-caption:visible")).toContainText(
    "Katalog marketplace",
  );
  const gallery = page.locator("#contoh");
  await gallery.getByRole("button", { name: "Produk", exact: true }).click();
  await expect(gallery.locator(".v2-case-card")).toHaveCount(3);
  const recipe = gallery
    .getByRole("button", { name: "Lihat racikannya", exact: true })
    .first();
  await recipe.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(recipe).toBeFocused();
  await expect(page.locator("#demo")).toHaveCount(0);
  await expect(page.locator('a[href="#demo"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: /coba.*gratis/i })).toHaveCount(
    0,
  );
  await page
    .getByRole("link", { name: "Lihat cara kerjanya", exact: true })
    .click();
  await expect(page).toHaveURL(/#cara-kerja$/);
  const walkthrough = page.locator("#cara-kerja");
  await expect(
    walkthrough.locator(".v2-visual-walkthrough > article"),
  ).toHaveCount(3);
  await expect(
    walkthrough.locator(".v2-walkthrough-options figure"),
  ).toHaveCount(3);
  await expect(walkthrough.locator(".v2-walkthrough-prompt")).toContainText(
    "Siap disalin dari studio",
  );
  await expect(walkthrough.locator(".v2-walkthrough-note")).toContainText(
    "bukan demo interaktif",
  );
  await expect
    .poll(() =>
      walkthrough
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (node) =>
              (node as HTMLImageElement).complete &&
              (node as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBeTruthy();
  expect(demoRequests).toEqual([]);
  const income = page.locator("#potensi");
  await expect(income.locator("input")).toHaveCount(0);
  await expect(income.locator(".v2-income-card")).toHaveCount(3);
  await expect(income.locator(".v2-income-card strong").nth(0)).toContainText(
    "250.000",
  );
  await expect(income.locator(".v2-income-card strong").nth(1)).toContainText(
    "750.000",
  );
  await expect(income.locator(".v2-income-card strong").nth(2)).toContainText(
    "600.000",
  );
  await expect(income.locator(".v2-income-note")).toContainText(
    "belum dipotong",
  );
  await expect(page.locator("#jasa .v2-service-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Lihat 12 jasa lainnya" }).click();
  await expect(page.locator("#jasa .v2-service-card")).toHaveCount(18);
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (mode) =>
          document.documentElement.classList.toggle("dark", mode === "dark"),
        theme,
      );
      await walkthrough.scrollIntoViewIfNeeded();
      await walkthrough.screenshot({
        path: `artifacts/screenshots/walkthrough-${width}-${theme}.png`,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      if (width === 390 && theme === "light") {
        const audit = await new AxeBuilder({ page })
          .include("#cara-kerja")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(audit.violations).toEqual([]);
      }
    }
  }
  expect(demoRequests).toEqual([]);
});
async function login(page: import("@playwright/test").Page) {
  // Reuse the genuinely email-verified fixture session; the separate test above exercises the login UI.
  await page.context().addCookies(memberState.cookies);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/app$/);
}
test("portofolio jasa baru terbuka dari landing tanpa galeri kosong", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("#jasa .v2-service-card")
    .filter({ hasText: "Foto fashion & baju" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".v3-public-portfolio article")).toHaveCount(6);
  await dialog
    .locator("img")
    .evaluateAll((images) =>
      images.forEach((img) => ((img as HTMLImageElement).loading = "eager")),
    );
  await expect
    .poll(() =>
      dialog
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (img) =>
              (img as HTMLImageElement).complete &&
              (img as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  for (const dark of [false, true])
    for (const width of [390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await page.evaluate(
        (d) => document.documentElement.classList.toggle("dark", d),
        dark,
      );
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      await expect(page).toHaveScreenshot(
        `v3-service-portfolio-${width}-${dark ? "dark" : "light"}.png`,
      );
      if (width === 1440) {
        const audit = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(audit.violations).toEqual([]);
      }
    }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page
      .locator("#jasa .v2-service-card")
      .filter({ hasText: "Foto fashion & baju" }),
  ).toBeFocused();
});
test("16 sampul gaya terbuka dan salin di HP aman saat pratinjau gagal", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page
    .getByRole("button", {
      name: "Pilih set Foto Profesional & Personal",
      exact: true,
    })
    .click();
  const picker = page.getByRole("dialog");
  await expect(picker.locator(".v2-set-picker a")).toHaveCount(16);
  await picker.locator(".v2-set-picker img").evaluateAll((images) =>
    images.forEach((image) => {
      (image as HTMLImageElement).loading = "eager";
    }),
  );
  await expect
    .poll(() =>
      picker
        .locator(".v2-set-picker img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await picker.locator(".v2-set-picker a").last().click();
  await expect(
    page.getByRole("group", { name: "Gaya awal", exact: true }).locator("img"),
  ).toHaveAttribute("src", /sets-v3/);
  const copy = page
    .locator(".v2-mobile-copy")
    .getByRole("button", { name: "Salin prompt", exact: true });
  await expect(copy).toBeEnabled();
  const previewRoute = "**/api/studios/*/preview";
  const fail = (route: import("@playwright/test").Route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Pratinjau sedang tidak tersedia." }),
    });
  await page.route(previewRoute, fail);
  async function changeBackground() {
    await page
      .getByRole("group", { name: "Latar", exact: true })
      .locator(".v2-choice-current")
      .click();
    await page
      .getByRole("dialog")
      .locator('.v2-gallery-select[aria-pressed="false"]')
      .first()
      .click();
  }
  await changeBackground();
  await expect(copy).toBeDisabled();
  await page.getByRole("tab", { name: /^Prompt/ }).click();
  await expect(page.locator(".v2-prompt-mode")).toContainText(
    "Prompt belum diperbarui",
  );
  await page.unroute(previewRoute, fail);
  await page
    .locator(".v2-prompt-panel")
    .getByRole("button", { name: "Coba lagi", exact: true })
    .click();
  await expect(copy).toBeEnabled();
  await page.getByRole("button", { name: "Sunting", exact: true }).click();
  const manual = "MY MANUAL PROMPT STAYS READY DURING NETWORK ERRORS.";
  await page.getByLabel("Sunting prompt manual").fill(manual);
  await page.route(previewRoute, fail);
  await page.getByRole("tab", { name: "Racik", exact: true }).click();
  await changeBackground();
  await page.getByRole("tab", { name: /^Prompt/ }).click();
  await expect(page.locator(".v2-prompt-panel .v2-notice")).toContainText(
    "Pratinjau sedang tidak tersedia",
  );
  await expect(copy).toBeEnabled();
  await expect(page.getByLabel("Sunting prompt manual")).toHaveValue(manual);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await copy.click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(manual);
  await page.unroute(previewRoute, fail);
  await page.goto("/");
  await expect(page.locator(".v2-hero-actions .button")).toHaveText(
    /Buka Studio/,
  );
  await expect(page.locator(".v2-hero-actions .button")).toHaveAttribute(
    "href",
    "/app",
  );
});
test("checkout akun belum berbayar menampilkan cakupan V2, harga server, dan status konfigurasi jujur", async ({
  page,
}) => {
  await login(page);
  await pool.query(
    "UPDATE aichemy_entitlements SET status='revoked' WHERE user_id=$1 AND environment='sandbox'",
    [userId],
  );
  try {
    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: "Ringkasan pembelian" }),
    ).toBeVisible();
    await expect(
      page.getByText("18 jasa dan 218 gaya awal dengan pilihan visual", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("18 prompt fotografi siap salin", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".order-total")).toContainText("Rp149.000");
    const configuration = await (await page.request.get("/api/config")).json();
    if (!configuration.paymentConfigured) {
      await expect(
        page.getByText(
          "Pembayaran uji belum dikonfigurasi. Pengelola sedang menyiapkan checkout.",
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Lanjut ke Pembayaran", exact: true }),
      ).toBeDisabled();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  } finally {
    await pool.query(
      "UPDATE aichemy_entitlements SET status='active' WHERE user_id=$1 AND environment='sandbox'",
      [userId],
    );
  }
});
test("V2 menjaga brief dan manual saat ganti set, preset, undo, refresh cepat, salin, dan ekspor", async ({
  page,
  context,
}) => {
  await login(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(
    "/app/studio/product?service=product&set=product-marketplace&starter=1",
  );
  await page.locator(".v2-add-details summary").click();
  await page
    .getByLabel("Subjek utama", { exact: false })
    .fill("Botol parfum kaca hijau milik klien — jangan ubah bentuk.");
  await page.getByLabel("Nama merek", { exact: true }).fill("RUMAH “AROMA”");
  await expect(page.locator(".v2-prompt-mode")).toContainText("Mengikuti");
  await page.getByRole("button", { name: "Sunting", exact: true }).click();
  const manual = "MANUAL CLIENT PROMPT. Do not overwrite. Identitas tetap.";
  await page.getByLabel("Sunting prompt manual").fill(manual);
  await page.reload();
  await page.locator(".v2-add-details summary").click();
  await expect(page.getByLabel("Sunting prompt manual")).toHaveValue(manual);
  await expect(page.getByLabel("Subjek utama", { exact: false })).toHaveValue(
    "Botol parfum kaca hijau milik klien — jangan ubah bentuk.",
  );
  const starterGallery = page.getByRole("group", {
    name: "Gaya awal",
    exact: true,
  });
  await starterGallery.locator(".v2-choice-current").click();
  await page
    .getByRole("dialog")
    .locator(".v2-gallery-select")
    .filter({ hasText: "Skincare premium" })
    .click();
  await expect(page.getByLabel("Sunting prompt manual")).toHaveValue(manual);
  const background = page.getByRole("group", { name: "Latar", exact: true });
  await background.locator(".v2-choice-current").click();
  await page
    .getByRole("dialog")
    .locator(".v2-gallery-select")
    .filter({ hasText: "Merah formal" })
    .click();
  await background.locator(".v2-choice-current").click();
  await expect(
    page
      .getByRole("dialog")
      .locator(".v2-gallery-select")
      .filter({ hasText: "Merah formal" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Tutup dialog" })
    .click();
  await page.getByRole("button", { name: /Acak Gaya/ }).click();
  await page
    .getByRole("button", { name: "Batalkan perubahan", exact: true })
    .click();
  await expect(page.getByLabel("Sunting prompt manual")).toHaveValue(manual);
  await page
    .locator(".v2-studio-actions")
    .getByRole("button", { name: "Simpan Gaya", exact: true })
    .click();
  await page.getByLabel("Nama gaya", { exact: true }).fill("Gaya V2 Browser");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Simpan gaya", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Gaya Tersimpan", exact: true })
    .click();
  await page.getByRole("button", { name: /Gaya V2 Browser/ }).click();
  await expect(
    page.getByText("Pratinjau perubahan", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pakai gaya ini" }).click();
  await expect(page.getByLabel("Sunting prompt manual")).toHaveValue(manual);
  await page
    .locator(".v2-prompt-tools")
    .getByRole("button", { name: "Salin prompt", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(manual);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("aichemy-product.txt");
  await page.locator(".v2-add-details summary").click();
  await expect(page.getByLabel("Nama merek", { exact: true })).toHaveValue(
    "RUMAH “AROMA”",
  );
  await expect(page.locator(".v2-save-status")).toContainText("Tersimpan");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("tab", { name: /Prompt/ }).click();
  await expect(page.getByLabel("Sunting prompt manual")).toHaveValue(manual);
  await expect(page.locator(".v2-mobile-copy")).toBeVisible();
  await page.getByRole("tab", { name: "Racik", exact: true }).click();
  await expect(page.getByLabel("Subjek utama", { exact: false })).toHaveValue(
    "Botol parfum kaca hijau milik klien — jangan ubah bentuk.",
  );
});
test("draft V1 hanya ditingkatkan melalui salinan eksplisit dan sumber tetap utuh", async ({
  page,
  request,
}) => {
  await login(page);
  const id = crypto.randomUUID();
  const original = {
    kind: "draft",
    studioId: "product",
    name: "Draft V1 dilindungi",
    data: {
      state: { productName: "Produk klien lama", lighting: "window" },
      manual: "LEGACY MANUAL MUST STAY",
    },
  };
  const r = await page.request.put(`/api/library/${id}`, {
    headers: { origin: base },
    data: original,
  });
  expect(r.ok()).toBeTruthy();
  await page.goto(`/app/studio/product?draft=${id}`);
  await expect(
    page.getByText("Draft mesin lama tetap utuh.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Buat salinan V2", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Buat salinan, jangan ubah sumber" })
    .click();
  await expect(page).toHaveURL(/service=product&draft=/);
  await expect(page.getByLabel("Sunting prompt manual")).toHaveValue(
    "LEGACY MANUAL MUST STAY",
  );
  const rows = (await (await page.request.get("/api/library")).json()).items;
  expect(rows.find((i: LibraryFixture) => i.id === id)?.data).toEqual(
    original.data,
  );
  expect(
    rows.filter(
      (i: LibraryFixture) =>
        i.data.engineVersion === 2 && i.data.legacySource?.id === id,
    ),
  ).toHaveLength(1);
});
type LibraryFixture = {
  id: string;
  data: {
    engineVersion?: number;
    legacySource?: { id: string };
    [key: string]: unknown;
  };
};
test("V2 katalog, builder visual, galeri dan Viral dapat dipakai dengan keyboard pada empat breakpoint", async ({
  page,
  context,
}) => {
  await login(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const dark of [false, true]) {
    await page.evaluate((d) => {
      document.documentElement.classList.toggle("dark", d);
      localStorage.setItem("aichemy-theme", d ? "dark" : "light");
    }, dark);
    for (const width of [390, 768, 1280, 1440]) {
      // Only this synthetic fixture user's data: keep the discovery baselines independent of prior journeys.
      await pool.query("DELETE FROM aichemy_library WHERE user_id=$1", [
        userId,
      ]);
      await page.setViewportSize({ width, height: 960 });
      await page.goto("/app");
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "Mau membuat apa",
      );
      await expect(page).toHaveScreenshot(
        `v2-catalog-${width}-${dark ? "dark" : "light"}.png`,
      );
      await page.goto(
        "/app/studio/id-photo?service=formal&set=formal-cv&starter=1",
      );
      const formalBackground = page.getByRole("group", {
        name: "Latar",
        exact: true,
      });
      await expect(formalBackground).toBeVisible();
      await formalBackground.locator(".v2-choice-current").focus();
      await page.keyboard.press("Enter");
      const gallery = page.getByRole("dialog");
      await gallery
        .locator(".v2-gallery-select")
        .filter({ hasText: "Biru formal" })
        .focus();
      await page.keyboard.press("Enter");
      await formalBackground.locator(".v2-choice-current").click();
      await expect(
        gallery
          .locator(".v2-gallery-select")
          .filter({ hasText: "Biru formal" }),
      ).toHaveAttribute("aria-pressed", "true");
      await gallery.getByRole("button", { name: "Tutup dialog" }).click();
      await expect(page.locator(".v2-save-status")).toContainText("Tersimpan");
      const toast = page.getByRole("button", { name: "Tutup pemberitahuan" });
      if (await toast.isVisible()) await toast.click();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      await expect(page).toHaveScreenshot(
        `v2-builder-${width}-${dark ? "dark" : "light"}.png`,
      );
      if (width === 1440) {
        const a = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          a.violations,
          JSON.stringify(
            a.violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
          ),
        ).toEqual([]);
      }
    }
  }
  await page.goto("/app/viral");
  await expect(
    page.getByRole("button", { name: "Buka Avatar clay", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Cari Prompt Viral").fill("motion blur");
  await expect(page.locator(".v2-viral-open")).toHaveCount(1);
  await page.getByRole("button", { name: "Jenis shot", exact: true }).click();
  await page.getByLabel("Cari Prompt Viral").clear();
  await expect(page.locator(".v2-viral-open")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Buka Jalanan motion blur", exact: true })
    .click();
  await expect(page.getByLabel("Prompt Viral siap salin")).not.toBeEmpty();
  await expect(
    page.getByRole("link", {
      name: /Nikon — 10 Tips for Better Camera Panning/,
    }),
  ).toHaveAttribute(
    "href",
    "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/10-tips-for-better-camera-panning",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const viralPrompt = await page
    .getByLabel("Prompt Viral siap salin")
    .inputValue();
  await page
    .getByRole("button", { name: "Salin prompt", exact: true })
    .first()
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(viralPrompt);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Buka Jalanan motion blur", exact: true }),
  ).toBeFocused();
});
test("galeri, koleksi dan dialog detail responsif di dua tema tanpa overflow", async ({
  page,
}) => {
  test.setTimeout(120000);
  await login(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const dark of [false, true])
    for (const width of [390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
      await page.goto("/");
      await page.evaluate((d) => {
        document.documentElement.classList.toggle("dark", d);
        localStorage.setItem("aichemy-theme", d ? "dark" : "light");
      }, dark);
      const gallery = page.locator("#contoh");
      await gallery.scrollIntoViewIfNeeded();
      await expect(page).toHaveScreenshot(
        `v2-gallery-${width}-${dark ? "dark" : "light"}.png`,
      );
      await gallery
        .getByRole("button", { name: "Lihat racikannya", exact: true })
        .first()
        .click();
      await expect
        .poll(() =>
          page
            .getByRole("dialog")
            .locator("img")
            .first()
            .evaluate((img: HTMLImageElement) => img.naturalWidth),
        )
        .toBeGreaterThan(0);
      await expect(page).toHaveScreenshot(
        `v2-case-dialog-${width}-${dark ? "dark" : "light"}.png`,
      );
      await page.keyboard.press("Escape");
      await page.goto("/app/viral");
      await expect(
        page.getByRole("button", {
          name: "Buka Jalanan motion blur",
          exact: true,
        }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot(
        `v2-viral-${width}-${dark ? "dark" : "light"}.png`,
      );
      await page
        .getByRole("button", { name: "Buka Jalanan motion blur", exact: true })
        .click();
      await expect(page.getByLabel("Prompt Viral siap salin")).not.toBeEmpty();
      await expect
        .poll(() =>
          page
            .getByRole("dialog")
            .locator("img")
            .first()
            .evaluate((img: HTMLImageElement) => img.naturalWidth),
        )
        .toBeGreaterThan(0);
      await expect(
        page.getByRole("button", { name: "Tutup dialog" }),
      ).toBeFocused();
      await expect(page).toHaveScreenshot(
        `v2-viral-dialog-${width}-${dark ? "dark" : "light"}.png`,
      );
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      if (width === 1440) {
        const a = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          a.violations,
          JSON.stringify(
            a.violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
          ),
        ).toEqual([]);
      }
      await page.keyboard.press("Escape");
    }
});
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
  await page
    .getByRole("button", { name: "Buat studio kustom", exact: true })
    .click();
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
