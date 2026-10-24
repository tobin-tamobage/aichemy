import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.PREVIEW_URL ?? "http://localhost:4173";
const output = process.env.PERFORMANCE_OUTPUT ?? "artifacts/v2-review";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  const settleImages = () =>
    page.waitForFunction(
      () =>
        [...document.querySelectorAll("img")]
          .filter((img) => {
            const r = img.getBoundingClientRect();
            return (
              r.width > 0 &&
              r.height > 0 &&
              r.bottom > 0 &&
              r.top < innerHeight &&
              r.right > 0 &&
              r.left < innerWidth
            );
          })
          .every((img) => img.complete && img.naturalWidth > 0),
      {},
      { timeout: 10000 },
    );
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`HTTP ${response.status()} ${response.url()}`);
  });
  await page.addInitScript(() => {
    window.__v2Metrics = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        window.__v2Metrics.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.__v2Metrics.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 80,
    downloadThroughput: 4_000_000 / 8,
    uploadThroughput: 1_000_000 / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const metrics = await page.evaluate(() => ({
    ...window.__v2Metrics,
    resources: performance.getEntriesByType("resource").length,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const checks = [];
  for (const dark of [false, true])
    for (const width of [390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
      const toggle = page.getByRole("button", {
        name: dark ? "Gunakan tema gelap" : "Gunakan tema terang",
        exact: true,
      });
      if (await toggle.isVisible()) await toggle.click();
      await page.evaluate(() => window.scrollTo(0, 0));
      await settleImages();
      await page.screenshot({
        path: `${output}/landing-${width}-${dark ? "dark" : "light"}.png`,
      });
      checks.push({
        width,
        dark,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      });
    }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page
    .getByRole("button", { name: "Gunakan tema terang", exact: true })
    .click();
  for (const selector of [
    "#jasa",
    "#contoh",
    "#demo",
    "#cara-kerja",
    "#viral",
    "#potensi",
    "#harga",
    "#faq",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await settleImages();
    await page.screenshot({
      path: `${output}/${selector.slice(1)}-desktop.png`,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const selector of ["#potensi", "#harga", "#demo"]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await settleImages();
    await page.screenshot({ path: `${output}/${selector.slice(1)}-mobile.png` });
  }
  const summary = {
    url: base,
    measuredAt: new Date().toISOString(),
    method:
      "Single cold Chromium mobile lab run, 390×844, 4 Mbps down / 1 Mbps up, 80ms latency, 4× CPU slowdown; not field data or Lighthouse.",
    metrics,
    checks,
    errors,
  };
  await writeFile(`${output}/metrics.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
