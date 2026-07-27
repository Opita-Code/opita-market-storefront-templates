#!/usr/bin/env bash
# backend/examples/checkout/get-config.sh
# PUBLIC endpoint — renders the Habeas Data banner texts + TTLs + Wompi policy
set -euo pipefail
BASE="${BASE:-https://market.opitacode.com}"
TENANT="${TENANT:-pasiones}"

curl -sS "$BASE/tenants/$TENANT/checkout/config" \
  | jq '{currency, reservationTtlMinutes, checkoutTtlMinutes, habeasDataPolicyVersion, wompiRefundPolicy, hasEsText: (.consentTexts.es | length > 0), hasEnText: (.consentTexts.en != null), hasPtText: (.consentTexts.pt != null)}'