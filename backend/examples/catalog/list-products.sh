#!/usr/bin/env bash
# backend/examples/catalog/list-products.sh
# Sprint 1 — public catalog read
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
LIMIT="${LIMIT:-20}"
STATUS="${STATUS:-active}"

curl -sS "$BASE/tenants/$TENANT/catalog/products?status=$STATUS&limit=$LIMIT" \
  | jq '.items[] | {id, sku, name, priceAmount, currency, status}'