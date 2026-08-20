import type { CreateJobInput } from '../domain/types';
import { BasePage } from './BasePage';

export class JobFormPage extends BasePage {
  readonly customerSelect = this.page.getByTestId('job-customer-select');
  readonly serviceTypeSelect = this.page.getByTestId('job-service-type-select');
  readonly dateInput = this.page.getByTestId('job-date-input');
  readonly timeSlotSelect = this.page.getByTestId('job-time-slot-select');
  readonly technicianSelect = this.page.getByTestId('job-technician-select');
  readonly unitsInput = this.page.getByTestId('job-units-input');
  readonly prioritySelect = this.page.getByTestId('job-priority-select');
  readonly descriptionInput = this.page.getByTestId('job-description-input');
  readonly saveButton = this.page.getByTestId('job-save-button');

  async goto(): Promise<void> {
    await super.goto('/admin/jobs/new');
  }

  async fill(input: Partial<CreateJobInput>): Promise<void> {
    if (input.customerId !== undefined) await this.customerSelect.selectOption(input.customerId);
    if (input.serviceType !== undefined) await this.serviceTypeSelect.selectOption(input.serviceType);
    if (input.preferredDate !== undefined) await this.dateInput.fill(input.preferredDate);
    if (input.timeSlot !== undefined) await this.timeSlotSelect.selectOption(input.timeSlot);
    if (input.technicianId !== undefined) await this.technicianSelect.selectOption(input.technicianId);
    if (input.numberOfUnits !== undefined) await this.unitsInput.fill(String(input.numberOfUnits));
    if (input.priority !== undefined) await this.prioritySelect.selectOption(input.priority);
    if (input.problemDescription !== undefined) await this.descriptionInput.fill(input.problemDescription);
  }

  async submit(): Promise<void> {
    await this.saveButton.click();
  }

  async fillAndSubmit(input: Partial<CreateJobInput>): Promise<void> {
    await this.fill(input);
    await this.submit();
  }
}
