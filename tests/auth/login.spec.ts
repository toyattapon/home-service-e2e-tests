import { test, expect } from '../../src/fixtures';
import { credentials } from '../../src/test-data/seed';

// FR-AUTH-001..006. Intentionally uses the plain `page` fixture (no
// pre-authenticated storageState) since these tests exercise login itself.
test.describe('Login', () => {
  test('valid admin credentials redirect to /admin/dashboard [FR-AUTH-001]', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(credentials.admin.email, credentials.admin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
  });

  test('valid technician credentials redirect to /tech/jobs [FR-AUTH-002]', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(credentials.technician.email, credentials.technician.password);
    await expect(page).toHaveURL(/\/tech\/jobs$/);
  });

  test('invalid credentials show an error and do not create a session [FR-AUTH-003]', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(credentials.invalid.email, credentials.invalid.password);
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/login$/);

    // No session was created: a protected page still bounces to /login.
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('empty fields show a client-side validation message [FR-AUTH-003]', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitButton.click();
    await expect(loginPage.errorMessage).toHaveText('Email and password are required');
  });

  test('unauthenticated users cannot open protected pages [FR-AUTH-004]', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/tech/jobs');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('technician users cannot access admin pages [FR-AUTH-005]', async ({ techPage }) => {
    await techPage.goto('/admin/dashboard');
    await expect(techPage).toHaveURL(/\/tech\/jobs$/);

    await techPage.goto('/admin/customers');
    await expect(techPage).toHaveURL(/\/tech\/jobs$/);
  });

  test('logout clears the session and returns to /login [FR-AUTH-006]', async ({ adminPage }) => {
    await adminPage.goto('/admin/dashboard');
    await adminPage.getByRole('button', { name: 'Logout' }).click();
    await expect(adminPage).toHaveURL(/\/login$/);

    // The cleared session cannot be reused by revisiting a protected route.
    await adminPage.goto('/admin/dashboard');
    await expect(adminPage).toHaveURL(/\/login$/);
  });
});
