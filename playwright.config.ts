import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * Tests run serially against ONE shared PostgreSQL-backed SUT, with the
 * database reset to its deterministic seed state before every test (see
 * `resetDb` in src/fixtures/index.ts). Parallel workers would race on that
 * shared state (one test's reset wiping another's in-flight fixtures), so
 * we deliberately trade speed for determinism here. Revisit this only if
 * you also move to per-worker data isolation (e.g. a Postgres schema or
 * container per worker).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['html', { open: 'never' }], ['list']],
  globalSetup: './global-setup.ts',

  use: {
    baseURL: env.webBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'bash scripts/start-sut.sh',
    // Gate readiness on the API's health endpoint, not the web app: Vite
    // serves index.html almost instantly, well before the API has finished
    // running migrations/reset and called app.listen() (see
    // scripts/start-sut.sh — it runs migrate/reset before `npm run dev`).
    // Checking the web root would let globalSetup race an API that isn't
    // listening yet.
    url: `${env.apiBaseUrl}/health`,
    timeout: 180_000,
    reuseExistingServer: true,
    env: { SUT_DIR: env.sutDir },
  },
});
