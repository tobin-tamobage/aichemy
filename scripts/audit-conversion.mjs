import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const round = process.argv[2] ?? "baseline";
if (!/^[a-z0-9-]+$/.test(round)) throw new Error("Invalid round label");
const output = `artifacts/conversion-review/${round}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const frames = [];
try {
  for (const dark of [false, true]) {
    for (const width of [390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
      await page.goto(process.env.AUDIT_URL ?? "http://localhost:5173");
      await page.evaluate(
        (isDark) => document.documentElement.classList.toggle("dark", isDark),
        dark,
      );
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() =>
        [...document.querySelectorAll(".v2-hero img")]
          .filter((img) => img.getBoundingClientRect().width > 0)
          .every((img) => img.complete && img.naturalWidth > 0),
      );
      await page.screenshot({
        path: `${output}/hero-${width}-${dark ? "dark" : "light"}.png`,
      });
      frames.push(
        await page.evaluate(
          ({ width, dark }) => {
            const hero = document.querySelector(".v2-hero");
            const button = document.querySelector(".v2-hero-actions .button");
            const note = document.querySelector(".v2-disclaimer");
            const text = [...document.querySelectorAll(".v2-section-head p")];
            return {
              width,
              dark,
              overflow: document.documentElement.scrollWidth > innerWidth,
              primaryHeight: button?.getBoundingClientRect().height ?? 0,
              primaryHref: button?.getAttribute("href"),
              noteFontSize: note
                ? Number.parseFloat(getComputedStyle(note).fontSize)
                : 0,
              minimumSectionIntro: Math.min(
                ...text.map((el) =>
                  Number.parseFloat(getComputedStyle(el).fontSize),
                ),
              ),
              heroWords: hero?.textContent.trim().split(/\s+/).length,
              mobilePurchaseVisible: [
                ...document.querySelectorAll(".v2-mobile-purchase"),
              ].some((el) => el.getBoundingClientRect().height > 0),
            };
          },
          { width, dark },
        ),
      );
    }
  }
  const content = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content,
    headings: [...document.querySelectorAll("main h1, main h2")].map((el) =>
      el.textContent.trim(),
    ),
    proof: document.querySelector(".v2-proof-strip")?.textContent.trim(),
    calculatorInputs: document.querySelectorAll(
      "#simulasi input, #potensi input",
    ).length,
    heroPortfolios: document.querySelectorAll(".v2-hero-work").length,
    incomeExamples: document.querySelectorAll(".v2-income-card").length,
    wordCount: document.querySelector("main")?.innerText.trim().split(/\s+/)
      .length,
    body: document.querySelector("main")?.innerText,
  }));
  await page.evaluate(() => document.documentElement.classList.remove("dark"));
  for (const id of ["jasa", "demo", "potensi", "harga"]) {
    const section = page.locator(`#${id}`);
    if (await section.count()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForFunction(
        (selector) =>
          [...document.querySelectorAll(`${selector} img`)]
            .filter((img) => img.getBoundingClientRect().width > 0)
            .every((img) => img.complete && img.naturalWidth > 0),
        `#${id}`,
      );
      await page.screenshot({ path: `${output}/${id}-desktop.png` });
    }
  }
  const report = {
    round,
    recordedAt: new Date().toISOString(),
    frames,
    content,
    errors,
  };
  await writeFile(
    `${output}/evidence.json`,
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(
    JSON.stringify(
      { round, frames, content: { ...content, body: undefined }, errors },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
