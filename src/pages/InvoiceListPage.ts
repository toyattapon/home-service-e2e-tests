import type { InvoiceStatus } from '../domain/types';
import { BasePage } from './BasePage';

export class InvoiceListPage extends BasePage {
  readonly statusFilter = this.page.getByTestId('invoice-status-filter');
  readonly table = this.page.getByTestId('invoice-table');

  async goto(): Promise<void> {
    await super.goto('/admin/invoices');
  }

  row(invoiceId: string) {
    return this.page.getByTestId(`invoice-row-${invoiceId}`);
  }

  async filterByStatus(status: InvoiceStatus | ''): Promise<void> {
    await this.statusFilter.selectOption(status);
  }

  async openInvoice(invoiceId: string): Promise<void> {
    await this.row(invoiceId).getByRole('link').click();
  }
}
