// Deterministic seed catalogue from home_service_qa_demo, section 8.8 of
// IMPLEMENTATION_PLAN.md and server/db/reset.ts. This is restored by
// POST /api/test/reset (see the `resetDb` autouse fixture) before every
// test, so these IDs are safe to reference directly in assertions.
//
// Relative dates (job-001/002/003/005/006) are recalculated on every reset
// against Asia/Bangkok "today", so we recompute them here the same way
// rather than hard-coding a date string.

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

export const seedDates = {
  tomorrow: bangkokDate(1),
  yesterday: bangkokDate(-1),
  inTwoDays: bangkokDate(2),
  twoDaysAgo: bangkokDate(-2),
};

export const credentials = {
  admin: { email: 'admin@demo.com', password: 'password123' },
  technician: { email: 'tech@demo.com', password: 'password123' },
  invalid: { email: 'admin@demo.com', password: 'wrong-password' },
};

export const seedCustomers = {
  arunHome: { id: 'cus-001', name: 'Arun Home', phone: '0812345678', acType: 'Wall Type', btu: 12000 },
  maliResidence: { id: 'cus-002', name: 'Mali Residence', phone: '0898765432', acType: 'Cassette', btu: 18000 },
  somchaiOffice: { id: 'cus-003', name: 'Somchai Office', phone: '0861234567', acType: 'Floor Standing', btu: 24000 },
} as const;

export const seedTechnicians = {
  demoTechnician: { id: 'tech-001', name: 'Demo Technician', phone: '0811111111' },
  secondTechnician: { id: 'tech-002', name: 'Second Technician', phone: '0822222222' },
} as const;

export const seedInventory = {
  airFilter: { id: 'inv-001', name: 'Air Filter', stock: 10, safetyStock: 3, unitCost: 150, lowStock: false },
  drainPipe: { id: 'inv-002', name: 'Drain Pipe', stock: 2, safetyStock: 2, unitCost: 120, lowStock: true },
  capacitor: { id: 'inv-003', name: 'Capacitor', stock: 1, safetyStock: 2, unitCost: 250, lowStock: true },
  cleaningSpray: { id: 'inv-004', name: 'Cleaning Spray', stock: 8, safetyStock: 3, unitCost: 80, lowStock: false },
} as const;

export const seedJobs = {
  // Pending Cleaning, no technician; conflict-ready against pendingConflict's slot once assigned.
  pending: { id: 'job-001', status: 'Pending', customerId: 'cus-001', date: seedDates.tomorrow, timeSlot: '10:00-12:00' },
  // Assigned Cleaning, tech-001, same date+slot as `pending` -> assigning tech-001 to job-001 must conflict.
  assigned: { id: 'job-002', status: 'Assigned', customerId: 'cus-002', date: seedDates.tomorrow, timeSlot: '10:00-12:00', technicianId: 'tech-001' },
  // In Progress Repair, Urgent, tech-001.
  inProgress: { id: 'job-003', status: 'In Progress', customerId: 'cus-003', date: seedDates.tomorrow, timeSlot: '13:00-15:00', technicianId: 'tech-001' },
  // Completed Installation, tech-002; used 2x Cleaning Spray; has Unpaid invoice-001.
  completedUnpaid: { id: 'job-004', status: 'Completed', customerId: 'cus-001', date: seedDates.yesterday, timeSlot: '08:00-10:00', technicianId: 'tech-002' },
  // Cancelled Cleaning, terminal state.
  cancelled: { id: 'job-005', status: 'Cancelled', customerId: 'cus-002', date: seedDates.inTwoDays, timeSlot: '15:00-17:00' },
  // Completed Repair, tech-002; used 1x Capacitor; has Paid invoice-002.
  completedPaid: { id: 'job-006', status: 'Completed', customerId: 'cus-003', date: seedDates.twoDaysAgo, timeSlot: '13:00-15:00', technicianId: 'tech-002' },
} as const;

export const seedInvoices = {
  // Unpaid invoice for job-004: service 1500, parts 160, subtotal 1660, VAT 116.20, total 1776.20
  unpaid: { id: 'invoice-001', jobId: 'job-004', status: 'Unpaid', serviceFee: 1500, urgentSurcharge: 0, partsCost: 160, subtotal: 1660, vat: 116.2, total: 1776.2 },
  // Paid invoice for job-006: service 300, urgent 300, parts 250, subtotal 850, VAT 59.50, total 909.50
  paid: { id: 'invoice-002', jobId: 'job-006', status: 'Paid', serviceFee: 300, urgentSurcharge: 300, partsCost: 250, subtotal: 850, vat: 59.5, total: 909.5, receiptNo: 'RCP-SEED-0001' },
} as const;

export const seedDashboardSummary = {
  totalJobsToday: 0,
  pendingJobs: 1,
  assignedJobs: 1,
  completedJobs: 2,
  unpaidInvoices: 1,
  lowStockItems: 2,
} as const;
