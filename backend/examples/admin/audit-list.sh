#!/usr/bin/env bash
# backend/examples/admin/audit-list.sh
# Sprint 6 — auditor or admin role
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
TOKEN="${OCAIS_ADMIN_TOKEN:?OCAIS_ADMIN_TOKEN env var required}"
ACTOR_EMAIL="${ACTOR_EMAIL:-vendedor@pasiones.co}"
LIMIT="${LIMIT:-50}"

curl -sS "$BASE/tenants/$TENANT/admin/audit?actorEmail=$ACTOR_EMAIL&limit=$LIMIT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT" \
  | jq '.items[] | {createdAt, actorEmail, action, targetType, targetId}'