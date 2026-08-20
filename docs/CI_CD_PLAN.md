# CI/CD plan (not yet implemented)

Deliberately not wired up yet — see the decision in the project setup
conversation. This document exists so the design is ready to implement
without re-deriving it later.

## Goal

On every push / pull request, run the full Playwright suite against a fresh
instance of the SUT (`home_service_qa_demo`), with no manual steps.

## Proposed workflow: `.github/workflows/e2e.yml`

```yaml
name: E2E tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_DB: home_service_qa
          POSTGRES_USER: home_service
          POSTGRES_PASSWORD: home_service
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U home_service -d home_service_qa"
          --health-interval 2s
          --health-timeout 3s
          --health-retries 15

    steps:
      - name: Check out home_service_qa_demo (SUT)
        uses: actions/checkout@v4
        with:
          repository: <owner>/home_service_qa_demo
          path: sut

      - name: Check out home_service_e2e_tests (this repo)
        uses: actions/checkout@v4
        with:
          path: e2e

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install + migrate + seed the SUT
        working-directory: sut
        env:
          DATABASE_URL: postgresql://home_service:home_service@localhost:5432/home_service_qa
          NODE_ENV: test
        run: |
          npm ci
          npm run db:migrate
          npm run db:reset

      - name: Start the SUT in the background
        working-directory: sut
        env:
          DATABASE_URL: postgresql://home_service:home_service@localhost:5432/home_service_qa
          NODE_ENV: test
        run: npm run dev &

      - name: Wait for the API to be healthy
        run: npx wait-on http://localhost:4000/api/health

      - name: Install E2E dependencies
        working-directory: e2e
        run: |
          npm ci
          npx playwright install --with-deps chromium

      - name: Run Playwright tests
        working-directory: e2e
        env:
          WEB_BASE_URL: http://localhost:5173
          API_BASE_URL: http://localhost:4000/api
          CI: true
        run: npx playwright test

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: e2e/playwright-report/
          retention-days: 14
```

## Notes for whoever implements this

- `playwright.config.ts` already reads `process.env.CI` to flip
  `reuseExistingServer` and `retries`/`forbidOnly`, so no config changes
  should be needed on the Playwright side — only this workflow file plus
  `webServer.command` should be skipped in CI (the workflow starts the SUT
  itself) by setting `PLAYWRIGHT_SKIP_WEBSERVER=1` or removing the
  `webServer` block behind a `process.env.CI` check.
- The SUT and this framework are two separate repos/checkouts on purpose
  (matching the SUT's own "not a monorepo" stance) — the workflow checks
  out both.
- Keep `NODE_ENV=test` for the SUT in CI so `POST /api/test/reset` stays
  enabled (see the SUT's README: it is disabled outside development/test).
- Consider caching `node_modules` and the Playwright browser binary
  (`~/.cache/ms-playwright`) once this is real, to keep CI fast.
