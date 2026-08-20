import type { APIRequestContext } from '@playwright/test';
import type {
  ApiFailure,
  Customer,
  CustomerInput,
  CreateJobInput,
  DashboardSummary,
  Invoice,
  InventoryItem,
  Job,
  JobStatus,
  SessionUser,
  Technician,
  UsedPart,
} from '../domain/types';

export interface LoginResult {
  token: string;
  user: SessionUser;
}

/**
 * Thin, typed wrapper around the home_service_qa_demo API for test setup,
 * teardown, and pure-API assertions. UI tests should still exercise the UI
 * for the behavior under test; use this client to arrange state quickly
 * (e.g. create a throwaway job) or to verify a side effect that has no
 * convenient UI surface.
 *
 * Built from a request context whose baseURL is the API's *origin only*
 * (see env.apiOrigin) — every call here spells out the full "/api/..."
 * path itself. Do not shorten these to a bare "/auth/login" etc: Playwright
 * resolves a leading-slash path against baseURL using WHATWG URL rules,
 * which would silently drop a "/api" path segment living in baseURL instead
 * of appending to it.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  private async unwrap<T>(response: {
    ok(): boolean;
    status(): number;
    json(): Promise<unknown>;
  }): Promise<T> {
    const body = await response.json();
    if (!response.ok()) {
      const failure = body as ApiFailure;
      throw new Error(
        `API request failed (${response.status()}): ${failure.message} [${failure.code}]`,
      );
    }
    return (body as { data: T }).data;
  }

  async health(): Promise<boolean> {
    const response = await this.request.get('/api/health');
    return response.ok();
  }

  /** Resets the SUT database to its deterministic seed state. Dev/test only. */
  async reset(): Promise<void> {
    const response = await this.request.post('/api/test/reset');
    if (!response.ok()) {
      throw new Error(
        `POST /api/test/reset failed with ${response.status()}. Is the SUT running with NODE_ENV=development|test?`,
      );
    }
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const response = await this.request.post('/api/auth/login', { data: { email, password } });
    return this.unwrap<LoginResult>(response);
  }

  async listTechnicians(token: string): Promise<Technician[]> {
    const response = await this.request.get('/api/technicians', { headers: this.authHeaders(token) });
    return this.unwrap<Technician[]>(response);
  }

  async dashboardSummary(token: string): Promise<DashboardSummary> {
    const response = await this.request.get('/api/dashboard/summary', { headers: this.authHeaders(token) });
    return this.unwrap<DashboardSummary>(response);
  }

  async createCustomer(token: string, input: CustomerInput): Promise<Customer> {
    const response = await this.request.post('/api/customers', { headers: this.authHeaders(token), data: input });
    return this.unwrap<Customer>(response);
  }

  async listCustomers(token: string, search?: string): Promise<Customer[]> {
    const response = await this.request.get('/api/customers', {
      headers: this.authHeaders(token),
      params: search ? { search } : undefined,
    });
    return this.unwrap<Customer[]>(response);
  }

  async createJob(token: string, input: CreateJobInput): Promise<Job> {
    const response = await this.request.post('/api/jobs', { headers: this.authHeaders(token), data: input });
    return this.unwrap<Job>(response);
  }

  async getJob(token: string, jobId: string): Promise<Job> {
    const response = await this.request.get(`/api/jobs/${jobId}`, { headers: this.authHeaders(token) });
    return this.unwrap<Job>(response);
  }

  async listJobs(
    token: string,
    query: { status?: JobStatus; search?: string; date?: string; technicianId?: string } = {},
  ): Promise<Job[]> {
    const response = await this.request.get('/api/jobs', { headers: this.authHeaders(token), params: query });
    return this.unwrap<Job[]>(response);
  }

  async assignJob(token: string, jobId: string, technicianId: string): Promise<Job> {
    const response = await this.request.patch(`/api/jobs/${jobId}/assign`, {
      headers: this.authHeaders(token),
      data: { technicianId },
    });
    return this.unwrap<Job>(response);
  }

  async updateJobStatus(
    token: string,
    jobId: string,
    nextStatus: JobStatus,
  ): Promise<{ job: Job; invoice?: Invoice }> {
    const response = await this.request.patch(`/api/jobs/${jobId}/status`, {
      headers: this.authHeaders(token),
      data: { nextStatus },
    });
    return this.unwrap<{ job: Job; invoice?: Invoice }>(response);
  }

  async replaceUsedParts(token: string, jobId: string, usedParts: UsedPart[]): Promise<Job> {
    const response = await this.request.put(`/api/jobs/${jobId}/used-parts`, {
      headers: this.authHeaders(token),
      data: { usedParts },
    });
    return this.unwrap<Job>(response);
  }

  async listInventory(token: string): Promise<InventoryItem[]> {
    const response = await this.request.get('/api/inventory', { headers: this.authHeaders(token) });
    return this.unwrap<InventoryItem[]>(response);
  }

  async adjustInventory(
    token: string,
    itemId: string,
    type: 'in' | 'out',
    quantity: number,
  ): Promise<InventoryItem> {
    const response = await this.request.patch(`/api/inventory/${itemId}/adjust`, {
      headers: this.authHeaders(token),
      data: { type, quantity },
    });
    return this.unwrap<InventoryItem>(response);
  }

  async listInvoices(token: string, status?: 'Unpaid' | 'Paid'): Promise<Invoice[]> {
    const response = await this.request.get('/api/invoices', {
      headers: this.authHeaders(token),
      params: status ? { status } : undefined,
    });
    return this.unwrap<Invoice[]>(response);
  }

  async getInvoice(token: string, invoiceId: string): Promise<Invoice> {
    const response = await this.request.get(`/api/invoices/${invoiceId}`, { headers: this.authHeaders(token) });
    return this.unwrap<Invoice>(response);
  }

  async payInvoice(token: string, invoiceId: string): Promise<Invoice> {
    const response = await this.request.patch(`/api/invoices/${invoiceId}/pay`, { headers: this.authHeaders(token) });
    return this.unwrap<Invoice>(response);
  }
}
