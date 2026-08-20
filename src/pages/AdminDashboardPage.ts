import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminDashboardPage extends BasePage {
  readonly totalJobsToday = this.page.getByTestId('dashboard-total-jobs');
  readonly pendingJobs = this.page.getByTestId('dashboard-pending-jobs');
  readonly assignedJobs = this.page.getByTestId('dashboard-assigned-jobs');
  readonly completedJobs = this.page.getByTestId('dashboard-completed-jobs');
  readonly unpaidInvoices = this.page.getByTestId('dashboard-unpaid-invoices');
  readonly lowStockItems = this.page.getByTestId('dashboard-low-stock');

  async goto(): Promise<void> {
    await super.goto('/admin/dashboard');
  }

  private async metric(locator: Locator): Promise<number> {
    // The card shows "—" until GET /dashboard/summary resolves; wait past
    // that placeholder instead of racing it (a raw innerText() snapshot
    // would happily read "—" and parse it as NaN).
    const value = locator.locator('strong');
    await expect(value).not.toHaveText('—');
    const text = await value.innerText();
    return Number(text.trim());
  }

  async totalJobsTodayValue(): Promise<number> {
    return this.metric(this.totalJobsToday);
  }

  async pendingJobsValue(): Promise<number> {
    return this.metric(this.pendingJobs);
  }

  async assignedJobsValue(): Promise<number> {
    return this.metric(this.assignedJobs);
  }

  async completedJobsValue(): Promise<number> {
    return this.metric(this.completedJobs);
  }

  async unpaidInvoicesValue(): Promise<number> {
    return this.metric(this.unpaidInvoices);
  }

  async lowStockItemsValue(): Promise<number> {
    return this.metric(this.lowStockItems);
  }
}
