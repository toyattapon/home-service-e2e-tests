import { test, expect } from '../../src/fixtures';
import { credentials, seedInventory, seedJobs } from '../../src/test-data/seed';

test.describe('Technician workflow [FR-TECH-001..003, FR-INV-004, FR-BILL-001]', () => {
  test('technician sees only jobs assigned to them, not another technician\'s jobs [FR-TECH-001]', async ({
    techJobListPage,
  }) => {
    await techJobListPage.goto();
    await expect(techJobListPage.card(seedJobs.assigned.id)).toBeVisible();
    await expect(techJobListPage.card(seedJobs.inProgress.id)).toBeVisible();
    // job-004 / job-006 belong to the second technician.
    await expect(techJobListPage.card(seedJobs.completedUnpaid.id)).toHaveCount(0);
    await expect(techJobListPage.card(seedJobs.completedPaid.id)).toHaveCount(0);
  });

  test('technician can open an owned job\'s detail', async ({ techJobListPage, techJobDetailPage, techPage }) => {
    await techJobListPage.goto();
    await techJobListPage.openJob(seedJobs.assigned.id);
    await expect(techPage).toHaveURL(new RegExp(`/tech/jobs/${seedJobs.assigned.id}$`));
    await expect(techJobDetailPage.status).toContainText('Assigned');
  });

  test('technician can start an Assigned job [FR-TECH-002]', async ({ techJobDetailPage }) => {
    await techJobDetailPage.goto(seedJobs.assigned.id);
    await expect(techJobDetailPage.startButton).toBeVisible();
    await techJobDetailPage.startJob();

    await expect(techJobDetailPage.status).toContainText('In Progress');
    await expect(techJobDetailPage.completeButton).toBeVisible();
    await expect(techJobDetailPage.startButton).toHaveCount(0);
  });

  test('an In Progress job offers Complete but not Start (cannot start twice) [FR-TECH-002]', async ({
    techJobDetailPage,
  }) => {
    await techJobDetailPage.goto(seedJobs.inProgress.id);
    await expect(techJobDetailPage.completeButton).toBeVisible();
    await expect(techJobDetailPage.startButton).toHaveCount(0);
  });

  test('technician can record used parts on an In Progress job [FR-TECH-003]', async ({
    techJobDetailPage,
    techPage,
  }) => {
    await techJobDetailPage.goto(seedJobs.inProgress.id);
    await techJobDetailPage.addUsedPart(seedInventory.airFilter.id, 2);

    // getByText would also match the (still-present) <option> in the picker,
    // so scope to the recorded-parts list item specifically.
    const recordedPart = techPage.getByRole('listitem').filter({ hasText: seedInventory.airFilter.name });
    await expect(recordedPart).toBeVisible();
    await expect(recordedPart).toContainText('× 2');
  });

  test('completing a job deducts stock exactly once and generates an invoice [FR-INV-004, FR-BILL-001]', async ({
    techJobDetailPage,
    api,
  }) => {
    const { token: adminToken } = await api.login(credentials.admin.email, credentials.admin.password);
    const before = await api.listInventory(adminToken);
    const airFilterBefore = before.find((item) => item.id === seedInventory.airFilter.id)!.stock;

    await techJobDetailPage.goto(seedJobs.inProgress.id);
    await techJobDetailPage.addUsedPart(seedInventory.airFilter.id, 2);
    await techJobDetailPage.completeJob();

    await expect(techJobDetailPage.status).toContainText('Completed');
    await expect(techJobDetailPage.invoiceSummary).toBeVisible();

    const after = await api.listInventory(adminToken);
    const airFilterAfter = after.find((item) => item.id === seedInventory.airFilter.id)!.stock;
    expect(airFilterAfter).toBe(airFilterBefore - 2);
  });
});
