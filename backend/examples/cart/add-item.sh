#!/usr/bin/env bash
# backend/examples/cart/add-item.sh
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
TOKEN="${OCAIS_TOKEN:?OCAIS_TOKEN env var required}"
CART_ID="${1:?usage: $0 <cart-id>}"
VARIANT_ID="${VARIANT_ID:-var_001}"
QTY="${QTY:-2}"
STOCK_VERSION="${STOCK_VERSION:-1}"

curl -sS -X POST "$BASE/tenants/$TENANT/cart/$CART_ID/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"variantId\":\"$VARIANT_ID\",\"quantity\":$QTY,\"expectedStockVersion\":$STOCK_VERSION}" \
  | jq '{id, status, subtotalAmount, items: .items | length}'