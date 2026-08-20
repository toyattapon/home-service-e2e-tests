import { BasePage } from './BasePage';

export class InvoiceDetailPage extends BasePage {
  readonly status = this.page.getByTestId('invoice-status');
  readonly serviceFee = this.page.getByTestId('invoice-service-fee');
  readonly urgentSurcharge = this.page.getByTestId('invoice-urgent-surcharge');
  readonly partsCost = this.page.getByTestId('invoice-parts-cost');
  readonly subtotal = this.page.getByTestId('invoice-subtotal');
  readonly vat = this.page.getByTestId('invoice-vat');
  readonly total = this.page.getByTestId('invoice-total');
  readonly markPaidButton = this.page.getByTestId('invoice-mark-paid-button');
  readonly receiptNumber = this.page.getByTestId('invoice-receipt-number');
  readonly paidAt = this.page.getByTestId('invoice-paid-at');

  async goto(invoiceId: string): Promise<void> {
    await super.goto(`/admin/invoices/${invoiceId}`);
  }

  async markAsPaid(): Promise<void> {
    await this.markPaidButton.click();
    await this.confirm('Mark paid');
  }
}
