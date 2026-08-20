import type { CustomerInput, CreateJobInput } from '../domain/types';
import { seedCustomers } from './seed';

/** Small unique-enough suffix so parallel/repeated runs don't collide on display text. */
function uniqueSuffix(): string {
  return Date.now().toString(36).slice(-6);
}

export function buildCustomer(overrides: Partial<CustomerInput> = {}): CustomerInput {
  return {
    name: `QA Customer ${uniqueSuffix()}`,
    phone: '0899' + String(Math.floor(100000 + Math.random() * 900000)),
    address: '123 Automation Road, Bangkok',
    acBrand: 'Daikin',
    btu: 12000,
    acType: 'Wall Type',
    note: 'Created by Playwright automation',
    ...overrides,
  };
}

function bangkokDate(offsetDays: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** A date guaranteed to be in the past, for negative "past date" validation tests. */
export const pastDate = bangkokDate(-30);

/** A future date far enough out to avoid colliding with seeded conflict slots. */
export const freeFutureDate = bangkokDate(10);

export function buildJob(overrides: Partial<CreateJobInput> = {}): CreateJobInput {
  return {
    customerId: seedCustomers.arunHome.id,
    serviceType: 'Cleaning',
    preferredDate: freeFutureDate,
    timeSlot: '08:00-10:00',
    numberOfUnits: 1,
    priority: 'Normal',
    problemDescription: 'Created by Playwright automation',
    ...overrides,
  };
}
