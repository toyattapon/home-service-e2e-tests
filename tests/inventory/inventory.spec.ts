import { test, expect } from '../../src/fixtures';
import { seedInventory } from '../../src/test-data/seed';

test.describe('Inventory [FR-INV-001..003]', () => {
  test('admin can view inventory with correct stock and safety values', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    const row = inventoryPage.row(seedInventory.airFilter.id);
    await expect(row).toContainText(seedInventory.airFilter.name);
    await expect(row).toContainText(String(seedInventory.airFilter.stock));
    await expect(row).toContainText(String(seedInventory.airFilter.safetyStock));
  });

  test('low stock badge appears exactly when stock <= safetyStock [FR-INV-003]', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    // inv-002: stock 2, safety 2 -> low at the equality boundary.
    await expect(inventoryPage.lowStockBadge(seedInventory.drainPipe.id)).toBeVisible();
    // inv-003: stock 1, safety 2 -> low below the boundary.
    await expect(inventoryPage.lowStockBadge(seedInventory.capacitor.id)).toBeVisible();
    // inv-001 / inv-004 sit above their safety stock -> healthy, no badge.
    await expect(inventoryPage.lowStockBadge(seedInventory.airFilter.id)).toHaveCount(0);
    await expect(inventoryPage.lowStockBadge(seedInventory.cleaningSpray.id)).toHaveCount(0);
  });

  test('admin can adjust stock in [FR-INV-001]', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.adjust(seedInventory.airFilter.id, 'in', 5);

    await expect(inventoryPage.row(seedInventory.airFilter.id)).toContainText(
      String(seedInventory.airFilter.stock + 5),
    );
  });

  test('admin can adjust stock out [FR-INV-001]', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.adjust(seedInventory.airFilter.id, 'out', 4);

    await expect(inventoryPage.row(seedInventory.airFilter.id)).toContainText(
      String(seedInventory.airFilter.stock - 4),
    );
  });

  test('stock cannot be adjusted below zero [FR-INV-001, FR-INV-002]', async ({ inventoryPage }) => {
    // inv-003 (Capacitor) has only 1 in stock.
    await inventoryPage.goto();
    await inventoryPage.adjust(seedInventory.capacitor.id, 'out', 5);

    await expect(inventoryPage.feedbackBanner).toHaveText('Stock cannot be negative');
    await expect(inventoryPage.row(seedInventory.capacitor.id)).toContainText(
      String(seedInventory.capacitor.stock),
    );
  });
});
