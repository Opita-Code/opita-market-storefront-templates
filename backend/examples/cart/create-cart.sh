#!/usr/bin/env bash
# backend/examples/cart/create-cart.sh
# Sprint 3 — cliente role required
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
TOKEN="${OCAIS_TOKEN:?OCAIS_TOKEN env var required}"
BRANCH_ID="${BRANCH_ID:-branch_001}"

curl -sS -X POST "$BASE/tenants/$TENANT/cart" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"branchId\":\"$BRANCH_ID\"}" \
  | jq '{id, status, expiresAt}'