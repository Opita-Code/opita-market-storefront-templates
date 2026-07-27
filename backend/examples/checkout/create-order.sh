#!/usr/bin/env bash
# backend/examples/checkout/create-order.sh
# Sprint 4 — returns wompi checkoutUrl
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
TOKEN="${OCAIS_TOKEN:?OCAIS_TOKEN env var required}"
CART_ID="${1:?usage: $0 <cart-id> <email>}"
EMAIL="${2:-test@example.co}"

curl -sS -X POST "$BASE/tenants/$TENANT/checkout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"cartId\":\"$CART_ID\",\"customerEmail\":\"$EMAIL\"}" \
  | jq '{id, status, totalAmount, currency, checkoutUrl}'