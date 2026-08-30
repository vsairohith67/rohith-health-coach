import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "apps/web/tests",
  timeout: 120_000,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/playwright-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command:
      "pnpm.cmd --filter @rohith-health/web dev --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000/today",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        channel: "chrome",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
