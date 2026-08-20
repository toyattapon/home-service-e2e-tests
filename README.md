# Home Service E2E Tests

Playwright automation framework for [`home_service_qa_demo`](../home_service_qa_demo),
a deterministic PostgreSQL-backed home-service management app built as a QA
practice SUT (System Under Test). This repo is the learner-owned automation
layer the SUT's own README explicitly leaves out: UI + API tests, a Page
Object Model, fixtures, and (eventually) CI.

## What's here

- **UI tests** (`tests/**/*.spec.ts`, excluding `tests/api`) drive the app
  through Playwright using a Page Object Model (`src/pages`).
- **API tests** (`tests/api/**`) hit `home_service_qa_demo`'s Express API
  directly for business rules that are awkward or unreliable to trigger
  through the browser (exact HTTP status/error codes, native `<input>`
  constraints that would otherwise intercept the request).
- **`tests/e2e/core-workflow.spec.ts`** is the full booking-to-paid-invoice
  loop from the SUT's README, run end to end across both the Admin and
  Technician roles.
- **`src/fixtures`** wires up a typed API client, pre-authenticated Admin/
  Technician browser contexts, and a database reset that runs before every
  single test (see *Test isolation strategy* below).
- **`src/test-data/seed.ts`** mirrors the SUT's documented seed catalogue
  (IMPLEMENTATION_PLAN.md §8.8) so tests can reference `job-002`, `inv-003`,
  etc. directly instead of re-deriving IDs at runtime.

## Prerequisites

- Node.js 20+
- Docker Desktop running (for the SUT's PostgreSQL container)
- A checkout of `home_service_qa_demo` on this machine

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Edit `.env` and point `SUT_DIR` at your `home_service_qa_demo` checkout if it
isn't a sibling directory at the default path.

## Running the tests

```bash
npm test
```

By default Playwright's `webServer` config (`playwright.config.ts`) runs
`scripts/start-sut.sh`, which boots the SUT's Postgres container, applies
migrations, reloads seed data, and starts `npm run dev` for you — then waits
for the web app to respond before the suite starts. If the SUT is *already*
running (you started it yourself with `npm run dev` in that project),
Playwright detects that and reuses it instead of starting a second copy.

Other useful commands:

```bash
npm run test:headed   # watch the browser
npm run test:ui       # Playwright's interactive UI mode
npm run test:debug    # step through with the inspector
npm run test:auth     # just tests/auth
npm run test:e2e      # just the full core-workflow loop
npm run report        # open the last HTML report
npm run codegen       # record new interactions against the running app
npm run sut:down      # stop the SUT's Postgres container when you're done
```

## Test isolation strategy

The SUT is one shared PostgreSQL database with a `POST /api/test/reset`
endpoint that restores its documented seed data. This framework calls that
endpoint **before every test** (`resetDb` in `src/fixtures/index.ts`, an
auto-use fixture) and runs the suite **serially** (`workers: 1`,
`fullyParallel: false` in `playwright.config.ts`).

That's a deliberate trade of speed for determinism: every test can assume
the exact seed state documented in `IMPLEMENTATION_PLAN.md` §8.8 (e.g. "`tech-001`
already has a job at tomorrow 10:00–12:00, so assigning them into `job-001`'s
identical slot must conflict") without juggling per-worker data isolation.
The seed set is small and the reset is a fast local transaction, so this
stays fast enough for a project this size.

If this ever needs to scale up (more tests, slower feedback loop), the
natural next step is per-worker isolation — a Postgres schema or container
per Playwright worker — rather than resetting a single shared database more
carefully. That's intentionally left as a stretch goal, not implemented here.

## Authentication strategy

`global-setup.ts` logs in as both demo accounts through the real
`/api/auth/login` endpoint once per run, then seeds `localStorage` in a
throwaway browser context and saves it as a Playwright `storageState` file
per role (`playwright/.auth/*.json`, gitignored). The `adminPage` / `techPage`
fixtures hand tests an already-authenticated `Page` built from that state, so
most tests skip re-driving the login form.

`tests/auth/login.spec.ts` is the deliberate exception: it uses the plain
`page` fixture (no stored session) because login itself is what's under test.

## Project structure

```text
src/
  config/       env loading, localStorage key names shared with the SUT
  domain/       TypeScript types mirroring the SUT's API/domain contracts
  test-data/    seed catalogue + factories for fresh, valid test data
  api/          typed API client used by fixtures and tests/api
  pages/        Page Object Model, one class per SUT page
  fixtures/     Playwright test.extend(): api, resetDb, adminPage/techPage,
                and one fixture per page object
tests/
  auth/         login, logout, protected routes, role guards
  api/          API-contract and business-rule tests
  customers/    customer CRUD + validation
  jobs/         job creation, list/filter/search, detail, assignment
  dispatch/     technician dispatch + schedule-conflict rules
  technician/   technician-side job lifecycle
  inventory/    stock adjustment + low-stock rules
  invoices/     pricing calculation + payment
  dashboard/    summary card correctness
  e2e/          the full core-workflow loop, across both roles
scripts/        start-sut.sh / stop-sut.sh — boot/stop the SUT for you
```

## Traceability

Test names and `describe` blocks reference the Functional Requirement IDs
from the SUT's `IMPLEMENTATION_PLAN.md` (e.g. `[FR-AUTH-001]`, `[FR-DISP-002]`)
so a failing test maps back to a specific documented business rule.

## Roadmap / not yet built

- **CI/CD**: not wired up yet by design — see [`docs/CI_CD_PLAN.md`](docs/CI_CD_PLAN.md)
  for the intended GitHub Actions pipeline.
- **SQL validation scripts**: direct PostgreSQL checks against `jobs`,
  `inventory_items`, `job_used_parts`, `invoices` (per the SUT README) are not
  part of this Playwright project and would live alongside it separately.
- **Load testing**: out of scope here; the SUT README notes k6/JMeter/Artillery
  as a separate learner-owned exercise.
