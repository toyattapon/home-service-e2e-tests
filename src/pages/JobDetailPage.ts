import { BasePage } from './BasePage';

export class JobDetailPage extends BasePage {
  readonly status = this.page.getByTestId('job-detail-status');
  readonly customer = this.page.getByTestId('job-detail-customer');
  readonly technician = this.page.getByTestId('job-detail-technician');
  readonly assignButton = this.page.getByTestId('job-assign-button');
  readonly cancelButton = this.page.getByTestId('job-cancel-button');
  readonly invoiceLink = this.page.getByTestId('job-invoice-link');
  /** The technician <select> in the assignment section; only present for Pending/Assigned jobs. */
  readonly technicianSelect = this.technician.locator('select');

  async goto(jobId: string): Promise<void> {
    await super.goto(`/admin/jobs/${jobId}`);
  }

  async assignTechnician(technicianId: string): Promise<void> {
    await this.technicianSelect.selectOption(technicianId);
    await this.assignButton.click();
  }

  async cancelJob(): Promise<void> {
    await this.cancelButton.click();
    await this.confirm('Cancel job');
  }

  async openInvoice(): Promise<void> {
    await this.invoiceLink.click();
  }
}
