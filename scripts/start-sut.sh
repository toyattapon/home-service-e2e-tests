#!/usr/bin/env bash
# Boots the System Under Test (home_service_qa_demo) for Playwright:
# starts Postgres via docker compose, applies migrations, reloads the
# deterministic seed data, then starts the API + web dev servers in the
# foreground. Playwright's `webServer` config runs this and polls
# WEB_BASE_URL until it responds.
#
# Safe to leave running between test runs; re-running just re-applies
# migrations/seed and reuses the existing Postgres container/volume.
set -euo pipefail

if [ -z "${SUT_DIR:-}" ]; then
  echo "[start-sut] SUT_DIR is not set. Copy .env.example to .env and point" >&2
  echo "[start-sut] SUT_DIR at your home_service_qa_demo checkout." >&2
  exit 1
fi

if [ ! -d "$SUT_DIR" ]; then
  echo "[start-sut] SUT_DIR ($SUT_DIR) does not exist." >&2
  exit 1
fi

cd "$SUT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "[start-sut] Docker is not installed or not on PATH." >&2
  exit 1
fi

echo "[start-sut] Starting PostgreSQL container..."
docker compose up -d db

echo "[start-sut] Waiting for PostgreSQL to report healthy..."
for _ in $(seq 1 30); do
  health="$(docker compose ps db --format '{{.Health}}' 2>/dev/null || true)"
  if [ "$health" = "healthy" ]; then
    break
  fi
  sleep 2
done
if [ "$health" != "healthy" ]; then
  echo "[start-sut] PostgreSQL did not become healthy in time." >&2
  exit 1
fi

echo "[start-sut] Applying migrations..."
npm run db:migrate

echo "[start-sut] Reloading deterministic seed data..."
npm run db:reset

echo "[start-sut] Starting API + web dev servers (npm run dev)..."
exec npm run dev
