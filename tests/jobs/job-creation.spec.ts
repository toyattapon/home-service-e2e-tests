import { test, expect } from '../../src/fixtures';
import { buildJob, pastDate } from '../../src/test-data/factories';
import { seedCustomers, seedTechnicians } from '../../src/test-data/seed';

test.describe('Job creation [FR-JOB-001..003]', () => {
  test('admin can create a Pending job without a technician [FR-JOB-001]', async ({
    jobListPage,
    jobFormPage,
    jobDetailPage,
    adminPage,
  }) => {
    await jobListPage.goto();
    await jobListPage.goToCreateJob();
    await jobFormPage.fillAndSubmit(buildJob({ customerId: seedCustomers.arunHome.id }));

    await expect(adminPage).toHaveURL(/\/admin\/jobs\/(?!new)[^/]+$/);
    await expect(jobDetailPage.status).toContainText('Pending');
    await expect(jobDetailPage.technician).toContainText('Unassigned');
  });

  test('admin can create an Assigned job with an available technician [FR-JOB-002]', async ({
    jobListPage,
    jobFormPage,
    jobDetailPage,
    adminPage,
  }) => {
    await jobListPage.goto();
    await jobListPage.goToCreateJob();
    await jobFormPage.fillAndSubmit(
      buildJob({ customerId: seedCustomers.maliResidence.id, technicianId: seedTechnicians.demoTechnician.id }),
    );

    await expect(adminPage).toHaveURL(/\/admin\/jobs\/(?!new)[^/]+$/);
    await expect(jobDetailPage.status).toContainText('Assigned');
    await expect(jobDetailPage.technician).toContainText(seedTechnicians.demoTechnician.name);
  });

  test('a past preferred date is blocked by the date field itself [FR-JOB-003]', async ({
    jobListPage,
    jobFormPage,
    adminPage,
  }) => {
    await jobListPage.goto();
    await jobListPage.goToCreateJob();
    await jobFormPage.fill(buildJob({ preferredDate: pastDate }));
    await jobFormPage.submit();

    // The native `min` constraint on the date input rejects the out-of-range
    // value before the form's submit handler ever runs.
    await expect(adminPage).toHaveURL(/\/admin\/jobs\/new$/);
    const isValid = await jobFormPage.dateInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('number of units is constrained to 1-5 by the input itself [FR-JOB-003]', async ({ jobListPage, jobFormPage }) => {
    await jobListPage.goto();
    await jobListPage.goToCreateJob();
    await expect(jobFormPage.unitsInput).toHaveAttribute('min', '1');
    await expect(jobFormPage.unitsInput).toHaveAttribute('max', '5');
  });
});
