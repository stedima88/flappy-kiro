'use strict';
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], viewport: { width: 1000, height: 750 } },
});
