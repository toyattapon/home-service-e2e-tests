import { test, expect } from '../../src/fixtures';
import { buildCustomer, buildJob, freeFutureDate } from '../../src/test-data/factories';
import { seedInventory, seedTechnicians } from '../../src/test-data/seed';
import { formatMoney } from '../../src/utils/format';

/**
 * The full "core workflow" loop documented in home_service_qa_demo's README:
 *
 *   Admin login -> create customer -> create Pending job -> assign technician
 *   -> Technician login -> start job -> record used parts -> complete job
 *   -> inventory deducted + Unpaid invoice created
 *   -> Admin verifies invoice -> marks it Paid -> verifies receipt + dashboard
 *
 * Individual steps are covered in isolation elsewhere; this test exists to
 * prove the pieces actually chain together end to end through the real UI,
 * handing off between the Admin and Technician roles like a real shift would.
 */
test.describe('Core service workflow (end-to-end loop)', () => {
  test('a job travels from booking to paid invoice across both roles', async ({
    // Admin-side page objects
    customerListPage,
    customerFormPage,
    jobListPage,
    jobFormPage,
    jobDetailPage,
    adminDashboardPage,
    invoiceDetailPage,
    adminPage,
    // Technician-side page objects
    techJobListPage,
    techJobDetailPage,
    techPage,
  }) => {
    await adminDashboardPage.goto();
    const dashboardBefore = {
      completedJobs: await adminDashboardPage.completedJobsValue(),
      unpaidInvoices: await adminDashboardPage.unpaidInvoicesValue(),
    };

    // --- Admin: create the customer ---------------------------------------
    const customer = buildCustomer({ name: `E2E Loop Customer ${Date.now()}` });
    await customerListPage.goto();
    await customerListPage.addButton.click();
    await customerFormPage.fillAndSubmit(customer);
    // Saving navigates asynchronously (POST /customers resolves, then
    // navigate()); wait for it rather than reading the URL right away.
    await expect(adminPage).toHaveURL(/\/admin\/customers\/(?!new)[^/]+$/);
    const customerId = adminPage.url().split('/').pop()!;

    // --- Admin: create a Pending job for that customer, no technician yet -
    const job = buildJob({
      customerId,
      serviceType: 'Cleaning',
      numberOfUnits: 1,
      priority: 'Normal',
      preferredDate: freeFutureDate,
    });
    await jobListPage.goto();
    await jobListPage.goToCreateJob();
    await jobFormPage.fillAndSubmit(job);
    await expect(adminPage).toHaveURL(/\/admin\/jobs\/(?!new)[^/]+$/);
    await expect(jobDetailPage.status).toContainText('Pending');
    const jobId = adminPage.url().split('/').pop()!;

    // --- Admin: assign a technician -> job becomes Assigned ---------------
    await jobDetailPage.assignTechnician(seedTechnicians.demoTechnician.id);
    await expect(jobDetailPage.status).toContainText('Assigned');

    // --- Technician: start the assigned job --------------------------------
    await techJobListPage.goto();
    await expect(techJobListPage.card(jobId)).toBeVisible();
    await techJobDetailPage.goto(jobId);
    await techJobDetailPage.startJob();
    await expect(techJobDetailPage.status).toContainText('In Progress');

    // --- Technician: record used parts before completing -------------------
    await techJobDetailPage.addUsedPart(seedInventory.airFilter.id, 1);
    // getByText would also match the (still-present) <option> in the picker,
    // so scope to the recorded-parts list item specifically.
    await expect(techPage.getByRole('listitem').filter({ hasText: seedInventory.airFilter.name })).toBeVisible();

    // --- Technician: complete the job --------------------------------------
    await techJobDetailPage.completeJob();
    await expect(techJobDetailPage.status).toContainText('Completed');
    await expect(techJobDetailPage.invoiceSummary).toBeVisible();

    // --- Admin: verify the job, then the generated invoice ------------------
    await jobDetailPage.goto(jobId);
    await expect(jobDetailPage.status).toContainText('Completed');
    await expect(jobDetailPage.invoiceLink).toBeVisible();
    await jobDetailPage.openInvoice();

    // Cleaning (600 x 1 unit) + Air Filter parts (150 x 1), no urgent
    // surcharge, 7% VAT — see IMPLEMENTATION_PLAN.md section 9.4.
    await expect(invoiceDetailPage.status).toContainText('Unpaid');
    await expect(invoiceDetailPage.serviceFee).toHaveText(formatMoney(600));
    await expect(invoiceDetailPage.partsCost).toHaveText(formatMoney(150));
    await expect(invoiceDetailPage.subtotal).toHaveText(formatMoney(750));
    await expect(invoiceDetailPage.vat).toHaveText(formatMoney(52.5));
    await expect(invoiceDetailPage.total).toHaveText(formatMoney(802.5));

    // --- Admin: mark the invoice Paid and confirm the receipt ---------------
    await invoiceDetailPage.markAsPaid();
    await expect(invoiceDetailPage.status).toContainText('Paid');
    await expect(invoiceDetailPage.receiptNumber).toBeVisible();

    // --- Admin: dashboard reflects the completed, paid job -------------------
    await adminDashboardPage.goto();
    await expect(adminDashboardPage.completedJobs).toContainText(String(dashboardBefore.completedJobs + 1));
    await expect(adminDashboardPage.unpaidInvoices).toContainText(String(dashboardBefore.unpaidInvoices));
  });
});
