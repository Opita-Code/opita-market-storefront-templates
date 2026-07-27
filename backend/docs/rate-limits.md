# Rate Limits

Per-tenant rate limits are enforced by API Gateway + Lambda reserved concurrency. Limits are tunable per tenant in `tenants/<tenant>/tenant.yml`.

## Current limits (Pasiones tenant)

| Endpoint family | Burst | Steady | Notes |
|-----------------|-------|--------|-------|
| **Public catalog** (catalog, branches, stock list, checkout/config) | 200 rps | 100 rps | High — for storefront browsing |
| **Public health** | 50 rps | 25 rps | For k8s/load balancer probes |
| **Authenticated read** (orders, pos sales list) | 100 rps | 50 rps | |
| **Authenticated write** (cart, checkout, pos sale, refund, admin) | 50 rps | 20 rps | Lower to protect DDB write capacity |
| **Wompi webhook** | 100 rps | 50 rps | |

## Per-user limits (additional)

For authenticated endpoints, a secondary limit applies per OCAIS `sub`:

| User role | Write limit |
|-----------|-------------|
| `cliente` | 30 req/min (cart + checkout writes) |
| `vendedor` | 120 req/min (POS operations) |
| `auditor` / `admin` | 300 req/min (audit + reports) |

## Retry-After header

When rate-limited, the response includes:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 5
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1722115200
```

The integration client retries with exponential backoff + jitter, capped at the `Retry-After` value.

## Burst behavior

Lambda reserved concurrency is set to 50 per tenant. A burst over that limit returns 429 immediately (API Gateway throttles before reaching Lambda). The integration client surfaces this as `rate_limited` and retries.

## Configuring limits

Edit `tenants/<tenant>/tenant.yml`:

```yaml
rate_limits:
  public_catalog:
    burst: 200
    steady: 100
  authenticated_write:
    burst: 50
    steady: 20
  per_user:
    cliente_writes_per_min: 30
    vendedor_writes_per_min: 120
```

Then `sst deploy` — SST pushes the limits to API Gateway usage plans + Lambda reserved concurrency.

## See also

- `../integration/src/result.ts` — typed RateLimited error
- `../../../platform/sst.config.ts` — actual rate-limit binding