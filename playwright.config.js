import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true
  },
  webServer: {
    command: 'node tools/server.mjs',
    port: 3000,
    reuseExistingServer: true,
    timeout: 15000
  }
});
