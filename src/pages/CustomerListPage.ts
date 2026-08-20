import { BasePage } from './BasePage';

export class CustomerListPage extends BasePage {
  readonly searchInput = this.page.getByTestId('customer-search-input');
  readonly addButton = this.page.getByTestId('customer-add-button');
  readonly table = this.page.getByTestId('customer-table');

  async goto(): Promise<void> {
    await super.goto('/admin/customers');
  }

  row(customerId: string) {
    return this.page.getByTestId(`customer-row-${customerId}`);
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
  }

  async openCustomer(customerId: string): Promise<void> {
    await this.row(customerId).getByRole('link', { name: 'View' }).click();
  }
}
