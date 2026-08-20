import { chromium, request as playwrightRequest, type FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ApiClient } from './src/api/apiClient';
import { env } from './src/config/env';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './src/config/storageKeys';
import { ADMIN_STORAGE_STATE, TECH_STORAGE_STATE } from './src/fixtures/storageStatePaths';

/**
 * Runs once before the whole suite. Logs in as Admin and Technician via the
 * real API (proving the login endpoint works), then persists a Playwright
 * storageState per role so individual tests can start already authenticated
 * without re-driving the login form every time. Tests that specifically
 * cover login itself (tests/auth/login.spec.ts) intentionally do NOT use
 * these fixtures.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  const authDir = path.dirname(ADMIN_STORAGE_STATE);
  fs.mkdirSync(authDir, { recursive: true });

  const apiRequest = await playwrightRequest.newContext({ baseURL: env.apiOrigin });
  const api = new ApiClient(apiRequest);

  const [admin, technician] = await Promise.all([
    api.login(env.admin.email, env.admin.password),
    api.login(env.technician.email, env.technician.password),
  ]);
  await apiRequest.dispose();

  const browser = await chromium.launch();

  await saveAuthState(browser, env.webBaseUrl, admin.token, admin.user, ADMIN_STORAGE_STATE);
  await saveAuthState(browser, env.webBaseUrl, technician.token, technician.user, TECH_STORAGE_STATE);

  await browser.close();
}

async function saveAuthState(
  browser: import('@playwright/test').Browser,
  baseUrl: string,
  token: string,
  user: unknown,
  outFile: string,
): Promise<void> {
  const context = await browser.newContext({ baseURL: baseUrl });
  const page = await context.newPage();
  // Navigate first so localStorage.setItem has an origin to attach to.
  await page.goto('/login');
  await page.evaluate(
    ([tokenKey, userKey, tokenValue, userValue]) => {
      localStorage.setItem(tokenKey, tokenValue);
      localStorage.setItem(userKey, userValue);
    },
    [TOKEN_STORAGE_KEY, USER_STORAGE_KEY, token, JSON.stringify(user)] as const,
  );
  await context.storageState({ path: outFile });
  await context.close();
}
