---
name: backend
description: Reference template for opita-market-templates backend API (multi-tenant retail commerce on AWS Lambda + DynamoDB). Use when an AI agent needs to call, consume, or integrate with the backend — exposes OpenAPI 3.1 snapshot + curl examples + auth docs. Backend code lives in the separate Opita-Code/opita-market-templates repo; this template is the contract surface only.
license: MIT
source_repo: https://github.com/Opita-Code/opita-market-templates
integration_target: TypeScript SDK in `../integration/` + any HTTP client (curl, fetch, axios)
template_type: reference (no code, only contract)
sprint_range: 1-6
endpoint_count: 47
---

# Backend Template — opita-market-templates API

This template is a **reference**, not a code dependency. The actual backend lives in its own repository and is deployed per-tenant on AWS Lambda. This template gives AI agents (and human engineers) everything needed to call, consume, and integrate with that backend without pulling the code.

## When to use this template

An AI agent should reach for this template when:
- Building a frontend (Next.js, Vue, Svelte, plain HTML) that needs to call the backend
- Building an integration layer that wraps the backend (see `../integration/` — that's what we ship)
- Writing tests that need realistic API fixtures
- Debugging an issue that traces to a backend endpoint
- Generating typed clients from the OpenAPI spec

An AI agent should **NOT** use this template when:
- It needs to *modify* the backend (use the source repo directly)
- It needs to deploy the backend (use the source repo + SST)
- It needs to understand the FSM rules — the backend template exposes the API surface; FSM transitions and validation rules live in `../integration/src/fsm/` (the typed source of truth)

## What this template contains

```
backend/
├── SKILL.md             ← this file (what + when + how)
├── README.md            ← overview + version mapping
├── api-spec.json        ← OpenAPI 3.1 snapshot (47 endpoints)
├── examples/            ← curl scripts for each endpoint family
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── pos/
│   ├── admin/
│   └── webhooks/
└── docs/
    ├── auth.md          ← OCAIS token, X-Tenant-Id, role matrix
    ├── errors.md        ← error code table (40+ codes)
    ├── rate-limits.md   ← per-tenant throttle limits
    └── fsm.md           ← Sale FSM (4 states) + Order FSM (7 states)
```

## Endpoint families (47 total)

| Family | Auth | Endpoints | Sprint |
|--------|------|-----------|--------|
| **Health** | public | 1 (`GET /health`) | 1 |
| **Catalog** (products, variants) | public read | 7 | 1 |
| **Branches** | public read | 4 | 1 |
| **Stock** | public read + admin write | 5 | 2 |
| **Cart** (reservations + Habeas Data) | cliente | 7 | 3, 6 |
| **Checkout + Orders** | cliente + admin | 6 | 4 |
| **POS Sales** | vendedor | 5 | 5 |
| **Refunds** | cliente (orders) + vendedor (sales) | 2 | 6 |
| **Audit** | auditor/admin | 1 | 6 |
| **Compliance** | auditor/admin | 1 | 6 |
| **Reports** | admin | 1 | 6 |
| **Checkout config** (PUBLIC) | public | 1 | 6 |
| **Wompi webhook** | HMAC verify | 1 | 4 |
| **Me + Refresh** | session | 2 | 5 |
| **Admin catalog write** | admin | 4 | 1 |

## Quick reference

### Catalog (public)
```bash
curl https://market.opitacode.com/tenants/pasiones/catalog/products
curl https://market.opitacode.com/tenants/pasiones/catalog/products/prod_001
curl https://market.opitacode.com/tenants/pasiones/catalog/products/prod_001/variants
```

### Cart (cliente)
```bash
curl -X POST https://market.opitacode.com/tenants/pasiones/cart \
  -H "Authorization: Bearer $OCAIS_TOKEN" \
  -H "X-Tenant-Id: pasiones" \
  -d '{"branchId":"branch_001"}'
```

### Checkout (cliente)
```bash
curl -X POST https://market.opitacode.com/tenants/pasiones/checkout \
  -H "Authorization: Bearer $OCAIS_TOKEN" \
  -H "X-Tenant-Id: pasiones" \
  -d '{"cartId":"cart_001","customerEmail":"jane@example.co"}'
```

### POS Sale (vendedor)
```bash
curl -X POST https://market.opitacode.com/tenants/pasiones/pos/sales \
  -H "Authorization: Bearer $OCAIS_TOKEN" \
  -H "X-Tenant-Id: pasiones" \
  -d '{"branchId":"branch_001","paymentMethod":"cash","lines":[{"variantId":"var_001","quantity":2}]}'
```

See `examples/` for the full set. See `docs/auth.md` for the OCAIS token flow.

## Version mapping

| Sprint | Date | What shipped |
|--------|------|--------------|
| 1 | 2026-07-20 | Catalog + branches + admin catalog write |
| 1.1 | 2026-07-20 | Hardening (P0/P1 QA fixes) |
| 2 | 2026-07-21 | Stock + movements data layer |
| 3 | 2026-07-22 | Cart reservations + sweepers |
| 4 | 2026-07-24 | Orders + Wompi webhook |
| 5 | 2026-07-26 | POS + JournalEntry + Sale emission |
| 6 | 2026-07-27 | Refunds + Audit + Habeas Data |
| 7+ | TBD | DIAN invoicing, GSI promotions, multi-partial refunds |

## What this template does NOT contain

- ❌ The actual Lambda handler code — that's in the source repo
- ❌ DDB table schemas — see source repo `packages/db/src/`
- ❌ Wompi integration internals — see source repo `packages/functions/src/wompi-client.ts`
- ❌ Deployment manifests — see source repo `platform/sst.config.ts`
- ❌ React/Vue/Svelte components — see `../frontend-visual/`

For those, use the integration layer (`../integration/`) which gives typed access to all of this in a framework-agnostic way.

## How to consume this template

1. **As an AI agent**: read `api-spec.json` to get the OpenAPI 3.1 contract, then map your code calls to those shapes. For typed code generation, use the `../integration/` package instead — it wraps this contract in TypeScript.
2. **As a human engineer**: read `README.md` first, then `examples/` for the endpoint you care about, then `docs/auth.md` for the auth flow, then `docs/errors.md` for error handling.
3. **As a CI pipeline**: parse `api-spec.json` to validate your client's request/response shapes against the contract.