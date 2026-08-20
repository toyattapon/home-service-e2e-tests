import type { JobStatus } from '../domain/types';
import { BasePage } from './BasePage';

export class JobListPage extends BasePage {
  readonly createButton = this.page.getByTestId('job-create-button');
  readonly searchInput = this.page.getByTestId('job-search-input');
  readonly statusFilter = this.page.getByTestId('job-status-filter');
  readonly table = this.page.getByTestId('job-table');

  async goto(): Promise<void> {
    await super.goto('/admin/jobs');
  }

  row(jobId: string) {
    return this.page.getByTestId(`job-row-${jobId}`);
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.getByRole('button', { name: 'Apply', exact: true }).click();
  }

  async filterByStatus(status: JobStatus | ''): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.page.getByRole('button', { name: 'Apply', exact: true }).click();
  }

  async openJob(jobId: string): Promise<void> {
    await this.row(jobId).getByRole('link').click();
  }

  async goToCreateJob(): Promise<void> {
    await this.createButton.click();
  }
}
