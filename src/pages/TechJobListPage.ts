import { BasePage } from './BasePage';

export class TechJobListPage extends BasePage {
  readonly jobList = this.page.getByTestId('tech-job-list');

  async goto(): Promise<void> {
    await super.goto('/tech/jobs');
  }

  card(jobId: string) {
    return this.page.getByTestId(`tech-job-card-${jobId}`);
  }

  statusBadge(jobId: string) {
    return this.page.getByTestId(`tech-job-status-${jobId}`);
  }

  async openJob(jobId: string): Promise<void> {
    await this.card(jobId).getByRole('link', { name: 'View job' }).click();
  }
}
