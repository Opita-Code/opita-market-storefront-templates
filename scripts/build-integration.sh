#!/usr/bin/env bash
# scripts/build-integration.sh — builds + tests the integration package
# Called by:
#   - GitHub Actions integration-test.yml on every push + PR
#   - Local dev: bash scripts/build-integration.sh

set -euo pipefail

INTEGRATION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../integration" && pwd)"

cd "$INTEGRATION_DIR"

echo "[1/3] pnpm install"
pnpm install --frozen-lockfile 2>&1 || pnpm install

echo ""
echo "[2/3] pnpm typecheck"
pnpm typecheck

echo ""
echo "[3/3] pnpm test"
pnpm test

echo ""
echo "[4/4] pnpm build"
pnpm build

echo ""
echo "OK — integration package built + tested"