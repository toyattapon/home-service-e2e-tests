import { test, expect } from '../../src/fixtures';
import { seedCustomers, seedJobs, seedTechnicians } from '../../src/test-data/seed';

test.describe('Job list and detail [FR-JOB-004, FR-DISP-001, FR-STAT-002]', () => {
  test('admin can list, filter by status, and search jobs [FR-JOB-004]', async ({ jobListPage }) => {
    await jobListPage.goto();
    await expect(jobListPage.row(seedJobs.pending.id)).toBeVisible();

    await jobListPage.filterByStatus('Cancelled');
    await expect(jobListPage.row(seedJobs.cancelled.id)).toBeVisible();
    await expect(jobListPage.row(seedJobs.pending.id)).toHaveCount(0);

    await jobListPage.filterByStatus('');
    await jobListPage.search(seedCustomers.somchaiOffice.phone);
    await expect(jobListPage.row(seedJobs.inProgress.id)).toBeVisible();
    await expect(jobListPage.row(seedJobs.pending.id)).toHaveCount(0);
  });

  test('admin can open a job and see customer, technician, and status', async ({ jobListPage, jobDetailPage }) => {
    await jobListPage.goto();
    await jobListPage.openJob(seedJobs.inProgress.id);

    await expect(jobDetailPage.status).toContainText('In Progress');
    await expect(jobDetailPage.customer).toContainText(seedCustomers.somchaiOffice.name);
    await expect(jobDetailPage.technician).toContainText(seedTechnicians.demoTechnician.name);
  });

  test('admin can assign a technician to a Pending job [FR-DISP-001]', async ({ jobDetailPage }) => {
    await jobDetailPage.goto(seedJobs.pending.id);
    await jobDetailPage.assignTechnician(seedTechnicians.secondTechnician.id);

    await expect(jobDetailPage.status).toContainText('Assigned');
    await expect(jobDetailPage.technician).toContainText(seedTechnicians.secondTechnician.name);
  });

  test('admin can reassign an Assigned job before it starts [FR-DISP-001]', async ({ jobDetailPage }) => {
    await jobDetailPage.goto(seedJobs.assigned.id);
    await jobDetailPage.assignTechnician(seedTechnicians.secondTechnician.id);

    await expect(jobDetailPage.technician).toContainText(seedTechnicians.secondTechnician.name);
  });

  test('admin can cancel a Pending job', async ({ jobDetailPage }) => {
    await jobDetailPage.goto(seedJobs.pending.id);
    await jobDetailPage.cancelJob();

    await expect(jobDetailPage.status).toContainText('Cancelled');
  });

  test('admin cannot cancel a Completed job; no cancel button is offered [FR-STAT-002]', async ({ jobDetailPage }) => {
    await jobDetailPage.goto(seedJobs.completedUnpaid.id);

    await expect(jobDetailPage.status).toContainText('Completed');
    await expect(jobDetailPage.cancelButton).toHaveCount(0);
  });

  test('admin sees an invoice link on a Completed job and can open it', async ({ jobDetailPage, adminPage }) => {
    await jobDetailPage.goto(seedJobs.completedUnpaid.id);
    await jobDetailPage.openInvoice();

    await expect(adminPage).toHaveURL(/\/admin\/invoices\/invoice-001$/);
  });
});
