#!/usr/bin/env bash
# backend/examples/admin/get-habeas-data.sh
# Sprint 6 — auditor or admin role
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"
TOKEN="${OCAIS_ADMIN_TOKEN:?OCAIS_ADMIN_TOKEN env var required}"
CUSTOMER_ID="${1:?usage: $0 <customer-id>}"

curl -sS "$BASE/tenants/$TENANT/admin/customers/$CUSTOMER_ID/habeas-data" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT" \
  | jq '{customerId, email, habeasDataConsent, currentPolicyVersion, policyVersionMatched}'