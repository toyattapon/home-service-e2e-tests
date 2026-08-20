import { test as base, expect, type Page } from '@playwright/test';
import { ApiClient } from '../api/apiClient';
import { env } from '../config/env';
import { ADMIN_STORAGE_STATE, TECH_STORAGE_STATE } from './storageStatePaths';
import * as pages from '../pages';

interface Fixtures {
  /** Typed API client, pre-pointed at the SUT's API base URL. */
  api: ApiClient;
  /** Resets the SUT database to seed state before the test body runs. Auto-applied. */
  resetDb: void;
  /** A fresh, already-authenticated Admin page (separate browser context). */
  adminPage: Page;
  /** A fresh, already-authenticated Technician page (separate browser context). */
  techPage: Page;

  loginPage: pages.LoginPage;
  adminDashboardPage: pages.AdminDashboardPage;
  customerListPage: pages.CustomerListPage;
  customerFormPage: pages.CustomerFormPage;
  customerDetailPage: pages.CustomerDetailPage;
  jobListPage: pages.JobListPage;
  jobFormPage: pages.JobFormPage;
  jobDetailPage: pages.JobDetailPage;
  dispatchPage: pages.DispatchPage;
  inventoryPage: pages.InventoryPage;
  invoiceListPage: pages.InvoiceListPage;
  invoiceDetailPage: pages.InvoiceDetailPage;
  techJobListPage: pages.TechJobListPage;
  techJobDetailPage: pages.TechJobDetailPage;
}

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({ baseURL: env.apiOrigin });
    await use(new ApiClient(request));
    await request.dispose();
  },

  resetDb: [
    async ({ api }, use) => {
      await api.reset();
      await use();
    },
    { auto: true },
  ],

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ baseURL: env.webBaseUrl, storageState: ADMIN_STORAGE_STATE });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  techPage: async ({ browser }, use) => {
    const context = await browser.newContext({ baseURL: env.webBaseUrl, storageState: TECH_STORAGE_STATE });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  loginPage: async ({ page }, use) => use(new pages.LoginPage(page)),
  adminDashboardPage: async ({ adminPage }, use) => use(new pages.AdminDashboardPage(adminPage)),
  customerListPage: async ({ adminPage }, use) => use(new pages.CustomerListPage(adminPage)),
  customerFormPage: async ({ adminPage }, use) => use(new pages.CustomerFormPage(adminPage)),
  customerDetailPage: async ({ adminPage }, use) => use(new pages.CustomerDetailPage(adminPage)),
  jobListPage: async ({ adminPage }, use) => use(new pages.JobListPage(adminPage)),
  jobFormPage: async ({ adminPage }, use) => use(new pages.JobFormPage(adminPage)),
  jobDetailPage: async ({ adminPage }, use) => use(new pages.JobDetailPage(adminPage)),
  dispatchPage: async ({ adminPage }, use) => use(new pages.DispatchPage(adminPage)),
  inventoryPage: async ({ adminPage }, use) => use(new pages.InventoryPage(adminPage)),
  invoiceListPage: async ({ adminPage }, use) => use(new pages.InvoiceListPage(adminPage)),
  invoiceDetailPage: async ({ adminPage }, use) => use(new pages.InvoiceDetailPage(adminPage)),
  techJobListPage: async ({ techPage }, use) => use(new pages.TechJobListPage(techPage)),
  techJobDetailPage: async ({ techPage }, use) => use(new pages.TechJobDetailPage(techPage)),
});

export { expect };
