#!/usr/bin/env bash
# backend/examples/catalog/get-product.sh
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
PRODUCT_ID="${1:?usage: $0 <product-id>}"

curl -sS "$BASE/tenants/$TENANT/catalog/products/$PRODUCT_ID" \
  | jq '{id, sku, name, description, priceAmount, currency, status, version}'