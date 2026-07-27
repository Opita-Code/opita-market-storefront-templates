#!/usr/bin/env bash
# backend/examples/cart/capture-habeas-data.sh
# Sprint 6 — Ley 1581/2012 compliance
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
TOKEN="${OCAIS_TOKEN:?OCAIS_TOKEN env var required}"
CART_ID="${1:?usage: $0 <cart-id>}"
POLICY_VERSION="${POLICY_VERSION:-$(date -u +%Y-%m-%d).1}"

curl -sS -X POST "$BASE/tenants/$TENANT/cart/$CART_ID/habeas-data" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"accepted\":true,\"policyVersion\":\"$POLICY_VERSION\"}" \
  | jq '.'