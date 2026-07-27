# Backend Template — opita-market-templates API

Reference template for the multi-tenant retail commerce backend deployed on AWS Lambda + DynamoDB.

## What's here

This template is a **contract surface** for the backend. The actual code lives in [`Opita-Code/opita-market-templates`](https://github.com/Opita-Code/opita-market-templates) (a separate repo).

- `SKILL.md` — what + when + how (read first)
- `api-spec.json` — OpenAPI 3.1 snapshot, 47 endpoints
- `examples/` — curl scripts for every endpoint family
- `docs/auth.md` — OCAIS token flow, X-Tenant-Id header, role matrix
- `docs/errors.md` — error code table (40+ codes)
- `docs/rate-limits.md` — per-tenant throttle limits
- `docs/fsm.md` — Sale FSM (4 states) + Order FSM (7 states)

## How AI agents use it

```typescript
// 1. Read the OpenAPI spec
import spec from './api-spec.json'

// 2. Find the endpoint you need
const getProduct = spec.paths['/tenants/{tenantId}/catalog/products/{productId}'].get

// 3. Validate request/response shapes in your integration layer
import { z } from 'zod'
import { productSchema } from '../integration/src/schemas/product'

// 4. Or just install the typed client (preferred)
import { createClient } from '@opita/market-integration'
const client = createClient({ baseUrl: 'https://market.opitacode.com', tenantId: 'pasiones' })
const product = await client.catalog.getProduct('prod_001')  // typed Result<Product, ApiError>
```

## Versioning

This template is regenerated whenever a new backend sprint ships. Version is pinned to the highest sprint number that introduced changes:

- **v6 (current)** — Sprints 1-6 (catalog, branches, stock, cart, orders, POS, refunds, audit, Habeas Data)
- **v5** — Sprints 1-5 (no refund/audit/Habeas Data endpoints)
- **v4** — Sprints 1-4 (no POS or refund)

The OpenAPI snapshot always reflects the **latest** sprint. If you need to lock to a specific version, check out the git tag for that sprint in this repo.

## See also

- `../integration/` — TypeScript framework-agnostic package that wraps this contract
- `../frontend-visual/` — visual templates that consume the integration package
- `../../../packages/functions/src/app.ts` — the actual route definitions (source repo)