import { test, expect } from '../../src/fixtures';
import { credentials } from '../../src/test-data/seed';

test.describe('Auth API contract [FR-AUTH-001..003]', () => {
  test('valid admin login returns a token and user', async ({ api }) => {
    const result = await api.login(credentials.admin.email, credentials.admin.password);
    expect(result.token).toBe('mock-token-admin');
    expect(result.user).toMatchObject({ email: credentials.admin.email, role: 'admin' });
  });

  test('valid technician login returns a token and technicianId', async ({ api }) => {
    const result = await api.login(credentials.technician.email, credentials.technician.password);
    expect(result.token).toBe('mock-token-technician');
    expect(result.user).toMatchObject({ email: credentials.technician.email, role: 'technician' });
    expect(result.user.technicianId).toBeTruthy();
  });

  test('invalid credentials return 401 INVALID_CREDENTIALS', async ({ api }) => {
    await expect(api.login(credentials.invalid.email, credentials.invalid.password)).rejects.toThrow(
      /API request failed \(401\).*INVALID_CREDENTIALS/,
    );
  });

  test('missing password returns 400', async ({ api }) => {
    await expect(api.login(credentials.admin.email, '')).rejects.toThrow(/API request failed \(400\)/);
  });

  test('the health endpoint is reachable without authentication', async ({ api }) => {
    expect(await api.health()).toBe(true);
  });
});
