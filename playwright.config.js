'use strict';
const { defineConfig, devices } = require('@playwright/test');

// Chromium by default. ALL_BROWSERS=1 also runs Firefox and WebKit (Safari engine),
// which treat file:// pages differently (CSP 'self', localStorage).
const viewport = { width: 1000, height: 750 };
const projects = [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport } }];
if (process.env.ALL_BROWSERS) {
  projects.push(
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport } },
  );
}

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  reporter: 'list',
  forbidOnly: !!process.env.CI, // a stray test.only must not silently skip the suite in CI
  retries: 0, // flaky failures are investigated, not retried away (PBT-08)
  projects,
});
