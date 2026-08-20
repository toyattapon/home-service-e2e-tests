import { test, expect } from '../../src/fixtures';
import { seedCustomers, seedJobs, seedTechnicians } from '../../src/test-data/seed';

test.describe('Dispatch [FR-DISP-001..003]', () => {
  test('admin can assign a Pending job to a technician', async ({ dispatchPage }) => {
    await dispatchPage.goto();
    await dispatchPage.assign(seedJobs.pending.id, seedTechnicians.secondTechnician.id);

    await expect(dispatchPage.successBanner).toBeVisible();
    // Second Technician is also already assigned to seed job-004, which
    // happens to share job-001's customer (Arun Home) too — disambiguate
    // with job-001's own time slot as well.
    await expect(
      dispatchPage.assignmentTable
        .getByRole('row')
        .filter({ hasText: seedCustomers.arunHome.name })
        .filter({ hasText: seedTechnicians.secondTechnician.name })
        .filter({ hasText: seedJobs.pending.timeSlot }),
    ).toBeVisible();
  });

  test('the dispatch job selector only offers Pending/Assigned jobs, never Completed or Cancelled', async ({
    dispatchPage,
  }) => {
    await dispatchPage.goto();
    const optionValues = await dispatchPage.jobSelect.locator('option').evaluateAll((els) =>
      els.map((el) => (el as HTMLOptionElement).value),
    );

    expect(optionValues).not.toContain(seedJobs.completedUnpaid.id);
    expect(optionValues).not.toContain(seedJobs.cancelled.id);
    expect(optionValues).not.toContain(seedJobs.inProgress.id);
  });

  test('assigning a technician into an occupied slot is blocked with a clear error [FR-DISP-002]', async ({
    dispatchPage,
  }) => {
    // seed job-001 (Pending) and job-002 (Assigned to tech-001) share the
    // same tomorrow 10:00-12:00 slot; tech-001 is already booked there.
    await dispatchPage.goto();
    await dispatchPage.assign(seedJobs.pending.id, seedTechnicians.demoTechnician.id);

    await expect(dispatchPage.feedbackBanner).toHaveText('Technician already has a job in this time slot');
  });
});
