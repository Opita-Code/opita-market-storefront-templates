# Authentication & Authorization

The backend uses **OCAIS** (Opita Code AI System) for authentication. Every authenticated request requires:

1. An OCAIS-issued JWT in the `Authorization: Bearer` header
2. A `X-Tenant-Id` header that matches the path `:tenantId`
3. A role/permission claim that grants access to the endpoint

## OCAIS JWT structure

```json
{
  "iss": "https://auth.opitacode.com",
  "sub": "user_abc123",
  "aud": "opita-market-pasiones",
  "exp": 1722115200,
  "iat": 1722111600,
  "email": "vendedor@pasiones.co",
  "roles": ["vendedor"],
  "permissions": ["product.read", "pos.sale.create", "sale.refund"]
}
```

### Required claims

| Claim | Description |
|-------|-------------|
| `aud` | MUST equal the tenant's audience (e.g. `opita-market-pasiones`). Mismatched audience → 401 `invalid_audience`. |
| `sub` | The user subject (used in audit log as `actorSubject`) |
| `email` | Used in audit log as `actorEmail` |
| `roles` | Array of role names — `admin`, `auditor`, `vendedor`, `cliente` |
| `permissions` | Array of granular permissions — see role/permission matrix below |

## Tenant header

The `X-Tenant-Id` header MUST match the `:tenantId` URL path parameter. If they don't match, the request is rejected with 400 `tenant_mismatch` (fail-closed).

This guards against token reuse across tenants — a `cliente` token for `pasiones` cannot be used against the `peluqueria` tenant even if both share the same OIDC issuer.

## Role matrix (Pasiones tenant)

| Role | Permissions |
|------|-------------|
| **admin** | `*` (all permissions) |
| **auditor** | `audit.read`, `report.read`, `compliance.read`, `customer.read`, `product.read`, `variant.read`, `branch.read`, `stock.read`, `order.read`, `sale.read`, `cart.read` |
| **vendedor** | `product.read`, `variant.read`, `branch.read`, `stock.read`, `pos.sale.create`, `pos.sale.read`, `sale.refund`, `sale.read`, `cart.read` |
| **cliente** | `product.read`, `variant.read`, `branch.read`, `stock.read`, `cart.create`, `cart.update`, `cart.reserve`, `cart.habeas_data_consent`, `checkout.create`, `order.read`, `order.create`, `order.refund` |

## Permission → endpoint map (key endpoints)

| Endpoint family | Required permission |
|-----------------|---------------------|
| `GET /catalog/*` | none (public) |
| `GET /stock` | none (public) |
| `GET /checkout/config` | none (public) |
| `POST /cart`, `POST /cart/:id/items`, `DELETE /cart/:id/items/:itemId` | `cart.create` or `cart.update` |
| `POST /cart/:id/reserve` | `cart.reserve` |
| `POST /cart/:id/habeas-data` | `cart.habeas_data_consent` |
| `POST /checkout` | `checkout.create` + `cart.habeas_data_consent` already captured |
| `GET /orders`, `GET /orders/:id` | `order.read` |
| `POST /orders/:id/refund` | `order.refund` |
| `POST /pos/sales` | `pos.sale.create` |
| `GET /pos/sales` | `pos.sale.read` or `sale.read` |
| `POST /pos/sales/:id/refund` | `sale.refund` |
| `POST /admin/products` | `product.write` |
| `POST /admin/products/:id/variants` | `variant.write` |
| `POST /admin/branches` | `branch.write` |
| `GET /admin/audit` | `audit.read` |
| `GET /admin/reports/daily` | `report.read` |
| `GET /admin/customers/:id/habeas-data` | `compliance.read` or `customer.read` |

## Wompi webhook (no auth)

The webhook endpoint `POST /tenants/:tenantId/webhooks/wompi` is **not** JWT-authenticated. It's secured by HMAC-SHA256 signature verification:

```
Wompi signature header: x-signature (or body.signature.checksum)
Algorithm: HMAC-SHA256(body, WOMPI_EVENTS_KEY)
Verify via timingSafeEqual to prevent timing attacks
```

The backend deduplicates by `transaction.id` to handle Wompi retries.

## Local dev (no auth)

In `sst dev`, the auth middleware is replaced with a dev-mode unsealer that trusts whatever subject/role is in a `X-Dev-Subject` header. **NEVER use this mode in production.** Production bootstraps fail-closed if `OCAIS_COOKIE_SECRET` is missing.

## See also

- `errors.md` — error code table for auth failures
- `../integration/src/webhooks/wompi.ts` — webhook signature parser (typed)