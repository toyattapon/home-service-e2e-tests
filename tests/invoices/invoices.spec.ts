import { test, expect } from '../../src/fixtures';
import { credentials, seedInvoices } from '../../src/test-data/seed';
import { formatMoney } from '../../src/utils/format';

test.describe('Invoices [FR-BILL-002..004]', () => {
  test('admin can list invoices and filter to Unpaid', async ({ invoiceListPage }) => {
    await invoiceListPage.goto();
    await expect(invoiceListPage.row(seedInvoices.unpaid.id)).toBeVisible();
    await expect(invoiceListPage.row(seedInvoices.paid.id)).toBeVisible();

    await invoiceListPage.filterByStatus('Unpaid');
    await expect(invoiceListPage.row(seedInvoices.unpaid.id)).toBeVisible();
    await expect(invoiceListPage.row(seedInvoices.paid.id)).toHaveCount(0);
  });

  test('invoice detail shows the documented pricing breakdown [FR-BILL-002]', async ({ invoiceDetailPage }) => {
    await invoiceDetailPage.goto(seedInvoices.unpaid.id);

    await expect(invoiceDetailPage.serviceFee).toHaveText(formatMoney(seedInvoices.unpaid.serviceFee));
    await expect(invoiceDetailPage.urgentSurcharge).toHaveText(formatMoney(seedInvoices.unpaid.urgentSurcharge));
    await expect(invoiceDetailPage.partsCost).toHaveText(formatMoney(seedInvoices.unpaid.partsCost));
    await expect(invoiceDetailPage.subtotal).toHaveText(formatMoney(seedInvoices.unpaid.subtotal));
    await expect(invoiceDetailPage.vat).toHaveText(formatMoney(seedInvoices.unpaid.vat));
    await expect(invoiceDetailPage.total).toHaveText(formatMoney(seedInvoices.unpaid.total));
    await expect(invoiceDetailPage.status).toContainText('Unpaid');
  });

  test('a Paid seed invoice already shows its receipt number and no pay button', async ({ invoiceDetailPage }) => {
    await invoiceDetailPage.goto(seedInvoices.paid.id);

    await expect(invoiceDetailPage.status).toContainText('Paid');
    await expect(invoiceDetailPage.receiptNumber).toHaveText(seedInvoices.paid.receiptNo);
    await expect(invoiceDetailPage.markPaidButton).toHaveCount(0);
  });

  test('admin can mark an Unpaid invoice as Paid, generating a receipt [FR-BILL-003, FR-BILL-004]', async ({
    invoiceDetailPage,
  }) => {
    await invoiceDetailPage.goto(seedInvoices.unpaid.id);
    await invoiceDetailPage.markAsPaid();

    await expect(invoiceDetailPage.status).toContainText('Paid');
    await expect(invoiceDetailPage.receiptNumber).toBeVisible();
    await expect(invoiceDetailPage.receiptNumber).not.toHaveText('');
    await expect(invoiceDetailPage.paidAt).toBeVisible();
    // A paid invoice cannot be paid again: the action is no longer offered.
    await expect(invoiceDetailPage.markPaidButton).toHaveCount(0);
  });

  test('paying an invoice twice via the API is rejected [FR-BILL-003]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(api.payInvoice(token, seedInvoices.paid.id)).rejects.toThrow(/INVOICE_ALREADY_PAID/);
  });
});
