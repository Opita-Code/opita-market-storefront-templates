#!/usr/bin/env bash
# backend/examples/pos/refund-sale.sh
# Sprint 6 — partial + full refund (external Wompi handling for online orders)
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
TOKEN="${OCAIS_TOKEN:?OCAIS_TOKEN env var required}"
SALE_ID="${1:?usage: $0 <sale-id>}"

# Full refund (omit refundLines)
curl -sS -X POST "$BASE/tenants/$TENANT/pos/sales/$SALE_ID/refund" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Customer changed mind"}' \
  | jq '{id, status, refundedAt, refundReason}'

# Partial refund (example):
# -d '{"reason":"Defective item","refundLines":[{"variantId":"var_001","quantity":1}]}'