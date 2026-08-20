import { expect } from '@playwright/test';
import type { CustomerInput } from '../domain/types';
import { BasePage } from './BasePage';

export class CustomerFormPage extends BasePage {
  readonly nameInput = this.page.getByTestId('customer-name-input');
  readonly phoneInput = this.page.getByTestId('customer-phone-input');
  readonly addressInput = this.page.getByTestId('customer-address-input');
  readonly acBrandInput = this.page.getByTestId('customer-ac-brand-input');
  readonly btuSelect = this.page.getByTestId('customer-btu-select');
  readonly acTypeSelect = this.page.getByTestId('customer-ac-type-select');
  readonly noteInput = this.page.getByTestId('customer-note-input');
  readonly saveButton = this.page.getByTestId('customer-save-button');

  async gotoNew(): Promise<void> {
    await super.goto('/admin/customers/new');
  }

  async gotoEdit(customerId: string): Promise<void> {
    await super.goto(`/admin/customers/${customerId}/edit`);
    // The form loads the existing customer asynchronously and then
    // overwrites the whole form state at once (setForm(loadedCustomer)).
    // Filling fields before that resolves would get silently clobbered the
    // moment the response arrives, so wait for it to land first.
    await expect(this.nameInput).not.toHaveValue('');
  }

  /** Field-level validation text rendered next to an input (`<span class="field-error">`). */
  fieldError(field: 'name' | 'phone' | 'address' | 'note') {
    const testId: Record<typeof field, string> = {
      name: 'customer-name-input',
      phone: 'customer-phone-input',
      address: 'customer-address-input',
      note: 'customer-note-input',
    };
    return this.page.locator(`[data-testid="${testId[field]}"] ~ .field-error`);
  }

  async fill(input: Partial<CustomerInput>): Promise<void> {
    if (input.name !== undefined) await this.nameInput.fill(input.name);
    if (input.phone !== undefined) await this.phoneInput.fill(input.phone);
    if (input.address !== undefined) await this.addressInput.fill(input.address);
    if (input.acBrand !== undefined) await this.acBrandInput.fill(input.acBrand);
    if (input.btu !== undefined) await this.btuSelect.selectOption(String(input.btu));
    if (input.acType !== undefined) await this.acTypeSelect.selectOption(input.acType);
    if (input.note !== undefined) await this.noteInput.fill(input.note);
  }

  async submit(): Promise<void> {
    await this.saveButton.click();
  }

  async fillAndSubmit(input: Partial<CustomerInput>): Promise<void> {
    await this.fill(input);
    await this.submit();
  }
}
