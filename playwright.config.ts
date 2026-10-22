import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 45000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.015 },
  },
  use: {
    baseURL: "http://localhost:5173",
    browserName: "chromium",
    viewport: { width: 1440, height: 960 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  workers: 1,
  reporter: "list",
});
