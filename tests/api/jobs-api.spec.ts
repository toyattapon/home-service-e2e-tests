import { test, expect } from '../../src/fixtures';
import { buildJob, pastDate } from '../../src/test-data/factories';
import { credentials, seedJobs, seedTechnicians } from '../../src/test-data/seed';

// Business rules that are awkward or unreliable to trigger through the UI
// (native <input> constraint validation, exact HTTP status/error codes) are
// asserted directly against the API here, complementing the UI-level tests.
test.describe('Job API contract [FR-JOB-003, FR-DISP-002, common error catalogue]', () => {
  test('creating a job with a past date is rejected server-side [FR-JOB-003]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(api.createJob(token, buildJob({ preferredDate: pastDate }))).rejects.toThrow(
      /VALIDATION_ERROR/,
    );
  });

  test('creating a job with 0 units is rejected [FR-JOB-003]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(api.createJob(token, buildJob({ numberOfUnits: 0 }))).rejects.toThrow(/VALIDATION_ERROR/);
  });

  test('creating a job with 6 units is rejected [FR-JOB-003]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(api.createJob(token, buildJob({ numberOfUnits: 6 }))).rejects.toThrow(/VALIDATION_ERROR/);
  });

  test('creating a job for an unknown customer returns 404 [FR-JOB-003]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(api.createJob(token, buildJob({ customerId: 'cus-does-not-exist' }))).rejects.toThrow(
      /API request failed \(404\)/,
    );
  });

  test('creating a job for an unknown technician returns 404 [FR-JOB-003]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(
      api.createJob(token, buildJob({ technicianId: 'tech-does-not-exist' })),
    ).rejects.toThrow(/API request failed \(404\)/);
  });

  test('assigning a technician into an occupied slot is a schedule conflict [FR-DISP-002]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    // seed job-002 is Assigned to tech-001 for tomorrow 10:00-12:00; seed
    // job-001 (Pending) sits in the same date+slot for a different customer.
    await expect(api.assignJob(token, seedJobs.pending.id, seedTechnicians.demoTechnician.id)).rejects.toThrow(
      /TECHNICIAN_SCHEDULE_CONFLICT/,
    );
  });

  test('an In Progress job cannot be reassigned [FR-DISP-003]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(
      api.assignJob(token, seedJobs.inProgress.id, seedTechnicians.secondTechnician.id),
    ).rejects.toThrow(/API request failed \(400\)/);
  });

  test('a Completed job cannot be reassigned [FR-DISP-004]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(
      api.assignJob(token, seedJobs.completedUnpaid.id, seedTechnicians.demoTechnician.id),
    ).rejects.toThrow(/API request failed \(400\)/);
  });

  test('admin cannot request Assigned -> In Progress; that transition is technician-only [role rules]', async ({
    api,
  }) => {
    // Pending -> In Progress isn't in anyone's allowed-transition list, but
    // the role check runs first: only a technician may ever request
    // -> In Progress (for their own Assigned job), so admin gets FORBIDDEN
    // rather than INVALID_STATUS_TRANSITION here.
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(api.updateJobStatus(token, seedJobs.assigned.id, 'In Progress')).rejects.toThrow(/FORBIDDEN/);
  });

  test('a technician cannot request In Progress -> Completed on a job they do not own [FR-STAT-001]', async ({
    api,
  }) => {
    const { token } = await api.login(credentials.technician.email, credentials.technician.password);
    // job-004 belongs to tech-002, not the demo tech-001 account.
    await expect(api.updateJobStatus(token, seedJobs.completedUnpaid.id, 'Completed')).rejects.toThrow(
      /API request failed \(40[03]\)/,
    );
  });

  test('Completed is a terminal state [FR-STAT-002]', async ({ api }) => {
    const { token } = await api.login(credentials.admin.email, credentials.admin.password);
    await expect(api.updateJobStatus(token, seedJobs.completedUnpaid.id, 'Cancelled')).rejects.toThrow(
      /INVALID_STATUS_TRANSITION/,
    );
  });

  test('a technician cannot read a job assigned to someone else [FR-TECH-001]', async ({ api }) => {
    const { token } = await api.login(credentials.technician.email, credentials.technician.password);
    // job-004/006 are assigned to tech-002, not the demo tech-001 account.
    await expect(api.getJob(token, seedJobs.completedUnpaid.id)).rejects.toThrow(/API request failed \(403\)/);
  });

  test('requests without a bearer token are rejected [FR-AUTH-004]', async ({ api }) => {
    await expect(api.listTechnicians('')).rejects.toThrow(/API request failed \(401\)/);
  });

  test('a technician cannot call an admin-only endpoint [FR-AUTH-005]', async ({ api }) => {
    const { token } = await api.login(credentials.technician.email, credentials.technician.password);
    await expect(api.createJob(token, buildJob())).rejects.toThrow(/API request failed \(403\)/);
  });
});
