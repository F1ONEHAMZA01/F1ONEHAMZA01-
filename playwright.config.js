import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 720 } } },
    {
      name: 'nord5',
      use: {
        viewport: { width: 424, height: 915 }, // OnePlus Nord 5 profile
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2
      }
    }
  ],
  webServer: {
    command: 'node tools/server.mjs',
    port: 3000,
    reuseExistingServer: true,
    timeout: 15000
  }
});
