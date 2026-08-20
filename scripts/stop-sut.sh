#!/usr/bin/env bash
# Stops the SUT's PostgreSQL container (keeps the data volume, matching the
# SUT's own README guidance). API/web dev servers started via `npm run dev`
# are stopped separately (Ctrl+C, or by Playwright's webServer teardown).
set -euo pipefail

if [ -z "${SUT_DIR:-}" ]; then
  echo "[stop-sut] SUT_DIR is not set. Copy .env.example to .env and point" >&2
  echo "[stop-sut] SUT_DIR at your home_service_qa_demo checkout." >&2
  exit 1
fi

cd "$SUT_DIR"
docker compose down
