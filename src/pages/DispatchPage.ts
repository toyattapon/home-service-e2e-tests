import { BasePage } from './BasePage';

export class DispatchPage extends BasePage {
  readonly dateInput = this.page.getByTestId('dispatch-date-input');
  readonly jobSelect = this.page.getByTestId('dispatch-job-select');
  readonly timeSlotSelect = this.page.getByTestId('dispatch-time-slot-select');
  readonly technicianSelect = this.page.getByTestId('dispatch-technician-select');
  readonly assignButton = this.page.getByTestId('dispatch-assign-button');
  readonly assignmentTable = this.page.getByTestId('dispatch-assignment-table');
  readonly successBanner = this.page.getByText('Assignment saved successfully');

  async goto(): Promise<void> {
    await super.goto('/admin/dispatch');
  }

  async filterByDate(date: string): Promise<void> {
    await this.dateInput.fill(date);
  }

  async assign(jobId: string, technicianId: string): Promise<void> {
    await this.jobSelect.selectOption(jobId);
    await this.technicianSelect.selectOption(technicianId);
    await this.assignButton.click();
  }
}
