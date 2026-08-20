import { test, expect } from '../../src/fixtures';
import { buildCustomer } from '../../src/test-data/factories';
import { seedCustomers } from '../../src/test-data/seed';

test.describe('Customer management [FR-CUS-001..003]', () => {
  test('admin can view the seeded customer list', async ({ customerListPage }) => {
    await customerListPage.goto();
    await expect(customerListPage.row(seedCustomers.arunHome.id)).toBeVisible();
    await expect(customerListPage.row(seedCustomers.maliResidence.id)).toBeVisible();
    await expect(customerListPage.row(seedCustomers.somchaiOffice.id)).toBeVisible();
  });

  test('admin can search customers by name', async ({ customerListPage }) => {
    await customerListPage.goto();
    await customerListPage.search('Arun');
    await expect(customerListPage.row(seedCustomers.arunHome.id)).toBeVisible();
    await expect(customerListPage.row(seedCustomers.maliResidence.id)).toHaveCount(0);
  });

  test('admin can search customers by phone', async ({ customerListPage }) => {
    await customerListPage.goto();
    await customerListPage.search(seedCustomers.maliResidence.phone);
    await expect(customerListPage.row(seedCustomers.maliResidence.id)).toBeVisible();
    await expect(customerListPage.row(seedCustomers.arunHome.id)).toHaveCount(0);
  });

  test('admin can view an existing customer detail', async ({ customerListPage, adminPage }) => {
    await customerListPage.goto();
    await customerListPage.openCustomer(seedCustomers.arunHome.id);
    await expect(adminPage).toHaveURL(new RegExp(`/admin/customers/${seedCustomers.arunHome.id}$`));
    await expect(adminPage.getByRole('heading', { name: seedCustomers.arunHome.name })).toBeVisible();
  });

  test('admin can create a customer with valid data [FR-CUS-002]', async ({
    customerListPage,
    customerFormPage,
    adminPage,
  }) => {
    const input = buildCustomer();
    await customerListPage.goto();
    await customerListPage.addButton.click();
    await customerFormPage.fillAndSubmit(input);

    await expect(adminPage).toHaveURL(/\/admin\/customers\/(?!new)[^/]+$/);
    await expect(adminPage.getByRole('heading', { name: input.name })).toBeVisible();
    await expect(adminPage.getByText(input.phone)).toBeVisible();
  });

  test('admin can edit an existing customer [FR-CUS-002]', async ({ customerFormPage, adminPage }) => {
    const updatedNote = `Updated by Playwright ${Date.now()}`;
    await customerFormPage.gotoEdit(seedCustomers.arunHome.id);
    await customerFormPage.fill({ note: updatedNote });
    await customerFormPage.submit();

    await expect(adminPage).toHaveURL(new RegExp(`/admin/customers/${seedCustomers.arunHome.id}$`));
    await expect(adminPage.getByText(updatedNote)).toBeVisible();
  });

  test('name shorter than 2 characters is rejected [FR-CUS-003]', async ({ customerListPage, customerFormPage, adminPage }) => {
    await customerListPage.goto();
    await customerListPage.addButton.click();
    await customerFormPage.fillAndSubmit(buildCustomer({ name: 'A' }));

    await expect(customerFormPage.fieldError('name')).toHaveText('Name must be 2–50 characters');
    await expect(adminPage).toHaveURL(/\/admin\/customers\/new$/);
  });

  test('phone that is not exactly 10 digits is rejected [FR-CUS-003]', async ({ customerListPage, customerFormPage, adminPage }) => {
    await customerListPage.goto();
    await customerListPage.addButton.click();
    await customerFormPage.fillAndSubmit(buildCustomer({ phone: '12345' }));

    await expect(customerFormPage.fieldError('phone')).toHaveText('Phone number must be 10 digits');
    await expect(adminPage).toHaveURL(/\/admin\/customers\/new$/);
  });

  test('address shorter than 5 characters is rejected [FR-CUS-003]', async ({ customerListPage, customerFormPage }) => {
    await customerListPage.goto();
    await customerListPage.addButton.click();
    await customerFormPage.fillAndSubmit(buildCustomer({ address: 'Hi' }));

    await expect(customerFormPage.fieldError('address')).toHaveText('Address must be 5–200 characters');
  });

  test('note longer than 300 characters is rejected [FR-CUS-003]', async ({ customerListPage, customerFormPage }) => {
    const base = buildCustomer();
    await customerListPage.goto();
    await customerListPage.addButton.click();
    await customerFormPage.fill({ name: base.name, phone: base.phone, address: base.address });
    // The note textarea itself is capped at maxLength=300, so exceeding the
    // limit has to happen at the DOM level rather than via a slow real key-by-key type.
    await customerFormPage.noteInput.evaluate((el: HTMLTextAreaElement) => {
      el.removeAttribute('maxlength');
    });
    await customerFormPage.noteInput.fill('x'.repeat(301));
    await customerFormPage.submit();

    await expect(customerFormPage.fieldError('note')).toHaveText('Note must be no more than 300 characters');
  });
});
