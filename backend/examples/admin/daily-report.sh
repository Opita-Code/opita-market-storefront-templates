#!/usr/bin/env bash
# backend/examples/admin/daily-report.sh
# Sprint 6 — admin role
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
TOKEN="${OCAIS_ADMIN_TOKEN:?OCAIS_ADMIN_TOKEN env var required}"
DATE="${DATE:-$(date -u +%Y-%m-%d)}"

curl -sS "$BASE/tenants/$TENANT/admin/reports/daily?date=$DATE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT" \
  | jq '.'