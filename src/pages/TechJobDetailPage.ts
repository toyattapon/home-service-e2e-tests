import { BasePage } from './BasePage';

export class TechJobDetailPage extends BasePage {
  readonly status = this.page.getByTestId('tech-job-detail-status');
  readonly startButton = this.page.getByTestId('tech-start-job-button');
  readonly completeButton = this.page.getByTestId('tech-complete-job-button');
  readonly usedPartSelect = this.page.getByTestId('tech-used-part-select');
  readonly usedPartQuantityInput = this.page.getByTestId('tech-used-part-quantity-input');
  readonly addUsedPartButton = this.page.getByTestId('tech-add-used-part-button');
  readonly invoiceSummary = this.page.getByTestId('tech-invoice-summary');

  async goto(jobId: string): Promise<void> {
    await super.goto(`/tech/jobs/${jobId}`);
  }

  async startJob(): Promise<void> {
    await this.startButton.click();
    await this.confirm('Start job');
  }

  async addUsedPart(inventoryItemId: string, quantity: number): Promise<void> {
    await this.usedPartSelect.selectOption(inventoryItemId);
    await this.usedPartQuantityInput.fill(String(quantity));
    await this.addUsedPartButton.click();
  }

  async completeJob(): Promise<void> {
    await this.completeButton.click();
    await this.confirm('Complete job');
  }
}
