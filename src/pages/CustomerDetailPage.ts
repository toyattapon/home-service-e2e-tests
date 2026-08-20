import { BasePage } from './BasePage';

export class CustomerDetailPage extends BasePage {
  readonly editLink = this.page.getByRole('link', { name: 'Edit' });
  readonly backLink = this.page.getByRole('link', { name: 'Back' });

  async goto(customerId: string): Promise<void> {
    await super.goto(`/admin/customers/${customerId}`);
  }

  async edit(): Promise<void> {
    await this.editLink.click();
  }
}
