import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly table = this.page.getByTestId('inventory-table');
  readonly adjustTypeSelect = this.page.getByTestId('inventory-adjust-type-select');
  readonly adjustQuantityInput = this.page.getByTestId('inventory-adjust-quantity-input');
  readonly adjustButton = this.page.getByTestId('inventory-adjust-button');
  /** The item <select> has no data-testid in the SUT; located by its accessible label. */
  readonly itemSelect = this.page.getByLabel('Item');

  async goto(): Promise<void> {
    await super.goto('/admin/inventory');
  }

  row(itemId: string) {
    return this.page.getByTestId(`inventory-row-${itemId}`);
  }

  lowStockBadge(itemId: string) {
    return this.page.getByTestId(`low-stock-badge-${itemId}`);
  }

  async adjust(itemId: string, type: 'in' | 'out', quantity: number): Promise<void> {
    await this.itemSelect.selectOption(itemId);
    await this.adjustTypeSelect.selectOption(type);
    await this.adjustQuantityInput.fill(String(quantity));
    await this.adjustButton.click();
  }
}
