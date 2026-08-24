# Working agreement for this project

This file is read automatically at the start of every Claude Code session in
this repo. It exists so a new session (or a new day) doesn't need to be
re-briefed from scratch — read this first, then `README.md` for setup, then
`IMPLEMENTATION_PLAN.md` in the sibling `home_service_qa_demo` checkout for
the SUT's actual requirements.

## Principle

**Every session leaves files behind, not just chat.** A chat window loses
context the moment it closes; a file committed to git doesn't. Every test
case gets a Test Case ID; every automated test's name carries the FR-ID it
proves; every non-obvious decision (why a test is structured a certain way,
why a bug was worked around a certain way) gets a code comment or a note in
this file — not left to live only in a conversation.

## Who writes the test code

**The learner (mctroy) writes the Playwright tests.** This project exists to
build hands-on QA automation skill, not to collect AI-generated code. Claude's
job here is: explain concepts, review code the learner wrote, point out bugs
and fix strategies, and handle pure documentation/tooling work (this file,
README, CI plan, test-case docs, scaffolding config). Claude should not
write `tests/**/*.spec.ts` or `src/pages/**/*.ts` content wholesale unless the
learner explicitly asks for that on a given task. See `[[hands-on-learning-preference]]`
if you have access to project memory.

## Pipeline for adding a new test

Adapted from a colleague's AI-assisted QA workflow (no Jira/Figma here — the
SUT's own docs and this repo's own docs fill those roles):

1. **Read context** — find the requirement in `home_service_qa_demo/IMPLEMENTATION_PLAN.md`
   (its FR-ID, e.g. `FR-JOB-003`) and check `docs/TEST_CASES.csv` for whether
   a Test Case ID already exists for it.
2. **Explore the real thing** — run the SUT (`npm run sut:up` or manually),
   click through the actual page/API being tested. Confirm the `data-testid`s
   and behavior match what's documented; the SUT's source is ground truth,
   the plan doc is not always current.
3. **Think through edge cases before writing code** — happy path, negative
   paths, boundary values, and whether the test depends on seed data that
   another test might also touch (see *Test isolation strategy* in README).
4. **Add/update the manual test case row** in `docs/TEST_CASES.csv` if one
   doesn't exist yet — Test Case ID, Steps, Expected Result, in plain
   non-technical language.
5. **Implement bottom-up** — page object (`src/pages/`) → seed/factory data
   (`src/test-data/`) → fixture wiring if needed (`src/fixtures/`) → the spec
   itself (`tests/`). The spec should read like the manual test case's Steps,
   not like raw Playwright calls.
6. **Verify against the real running SUT** — `npm test`, not just "it looks
   right." Re-run at least once from a cold `docker compose down` state
   before considering a test done (catches timing/race bugs — see the four
   real bugs documented in README's git history / commit messages).
7. **Review before committing** — no hardcoded waits, no locator string
   duplicated across files, page objects have no assertions in them, the
   test name includes the FR-ID it proves.
8. **Commit with a message that names the FR-ID(s)** covered, so `git log`
   stays a second traceability trail alongside `docs/TEST_CASES.csv`.
9. **Push** — `main` on `github.com/toyattapon/home-service-e2e-tests` is the
   published copy; keep it green (all tests passing) rather than pushing
   broken work.

## Guardrails

| Rule | Why |
|---|---|
| Tests reference FR-IDs in their title | Traceability from a failing test back to the exact business rule |
| No `page.locator('...')` raw CSS selectors in spec files | Selectors belong in page objects; specs should stay readable by a non-engineer |
| `resetDb` (autouse fixture) is never bypassed | Every test must be able to assume documented seed state |
| Don't silently `git push --force` | Confirm with the human first — see the one time this was necessary (`home-service-e2e-tests` initial push) and why |
| Claude shows the command before running anything state-changing (git push, force operations, deleting files) | Matches the AMS QA team's own guardrail: never run silently |

## Known gotchas (read before debugging from scratch)

- `home_service_qa_demo`'s real code lives only on branch `feature/portfolio-core`
  historically, but as of the GitHub push it's merged into `main` — if files
  ever look "missing" there, `git branch` first.
- Playwright `request.newContext({ baseURL })` + a leading `/` in the request
  path silently drops any path segment already in `baseURL` (WHATWG URL
  resolution rule). `src/api/apiClient.ts` works around this by using the
  API's *origin only* as baseURL and spelling `/api/...` in every call —
  don't "simplify" that back to a shorter baseURL.
- Reading `page.url()` or asserting `toHaveURL(/regex/)` immediately after a
  form submit can race the app's async navigate() — and a loose regex like
  `/\/admin\/jobs\/[^/]+$/` will false-match the *pre-navigation* `/new` URL.
  Wait for a real navigation with a regex that excludes `new`, e.g.
  `/\/admin\/jobs\/(?!new)[^/]+$/`.

## Status (update this as the project grows)

**Done:** 70 Playwright tests across 12 spec files, all passing from a cold
SUT restart. `docs/TEST_CASES.csv` (70 manual-style test cases) importable
into Notion. Pushed to GitHub.

**Not done yet, on purpose:** CI/CD (plan only, see `docs/CI_CD_PLAN.md`),
SQL validation scripts, load testing — all out of scope for this Playwright
project per the SUT's own README.
