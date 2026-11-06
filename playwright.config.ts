import { defineConfig, devices } from "@playwright/test";
import fs from "fs";

const cachedChromePath =
  "/home/azadmin/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    launchOptions: fs.existsSync(cachedChromePath)
      ? { executablePath: cachedChromePath }
      : undefined,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx next start -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
