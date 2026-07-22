import { defineConfig, devices } from '@playwright/test';

// Scoped to the sentinel only — unit tests run under Vitest.
export default defineConfig({
  testDir: './sentinel',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: 1,
  reporter: [['list'], ['json', { outputFile: '.sentinel/playwright-report.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    headless: true,
    // GitHub's CSP forbids injected inline scripts; bypass it so the sentinel
    // can inject the probe bundle. Test-context only — never ships.
    bypassCSP: true,
  },
});
