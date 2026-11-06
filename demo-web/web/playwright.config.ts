import { defineConfig, devices } from '@playwright/test';

/**  npx playwright test --ui
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Mock Typhoon OCR API + the app server under test. */
  webServer: [
    {
      command: 'node e2e/support/mock-typhoon-server.js',
      port: 4010,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node server.js',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: '3000',
        TYPHOON_API_KEY: 'test-key',
        TYPHOON_OCR_URL: 'http://localhost:4010/v1/ocr',
        TYPHOON_CHAT_URL: 'http://localhost:4010/v1/chat/completions',
      },
    },
  ],
});
