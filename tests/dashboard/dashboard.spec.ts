import { test, expect } from '../../src/fixtures';
import { seedDashboardSummary, seedInvoices, seedInventory } from '../../src/test-data/seed';

test.describe('Admin dashboard [FR-DASH-001]', () => {
  test('dashboard cards reflect the documented seed baseline', async ({ adminDashboardPage }) => {
    await adminDashboardPage.goto();

    await expect(adminDashboardPage.totalJobsToday).toContainText(String(seedDashboardSummary.totalJobsToday));
    await expect(adminDashboardPage.pendingJobs).toContainText(String(seedDashboardSummary.pendingJobs));
    await expect(adminDashboardPage.assignedJobs).toContainText(String(seedDashboardSummary.assignedJobs));
    await expect(adminDashboardPage.completedJobs).toContainText(String(seedDashboardSummary.completedJobs));
    await expect(adminDashboardPage.unpaidInvoices).toContainText(String(seedDashboardSummary.unpaidInvoices));
    await expect(adminDashboardPage.lowStockItems).toContainText(String(seedDashboardSummary.lowStockItems));
  });

  test('unpaid invoice count decreases after paying an invoice', async ({ adminDashboardPage, invoiceDetailPage }) => {
    await adminDashboardPage.goto();
    const before = await adminDashboardPage.unpaidInvoicesValue();

    await invoiceDetailPage.goto(seedInvoices.unpaid.id);
    await invoiceDetailPage.markAsPaid();

    await adminDashboardPage.goto();
    await expect(adminDashboardPage.unpaidInvoices).toContainText(String(before - 1));
  });

  test('low-stock count decreases after restocking a low item above its safety stock', async ({
    adminDashboardPage,
    inventoryPage,
  }) => {
    await adminDashboardPage.goto();
    const before = await adminDashboardPage.lowStockItemsValue();

    await inventoryPage.goto();
    // inv-003 (Capacitor): stock 1, safety 2 -> stocking in 5 clears low stock.
    await inventoryPage.adjust(seedInventory.capacitor.id, 'in', 5);

    await adminDashboardPage.goto();
    await expect(adminDashboardPage.lowStockItems).toContainText(String(before - 1));
  });
});
