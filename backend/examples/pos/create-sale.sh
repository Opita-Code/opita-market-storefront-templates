#!/usr/bin/env bash
# backend/examples/pos/create-sale.sh
# Sprint 5 — vendedor role required
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
TOKEN="${OCAIS_TOKEN:?OCAIS_TOKEN env var required}"
BRANCH_ID="${BRANCH_ID:-branch_001}"
PAYMENT_METHOD="${PAYMENT_METHOD:-cash}"

# Note: in production, the body is a JSON array of lines built by the POS app
LINES_JSON='[{"variantId":"var_001","quantity":2},{"variantId":"var_002","quantity":1}]'

curl -sS -X POST "$BASE/tenants/$TENANT/pos/sales" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"branchId\":\"$BRANCH_ID\",\"paymentMethod\":\"$PAYMENT_METHOD\",\"lines\":$LINES_JSON}" \
  | jq '{id, status, totalAmount, currency}'