# Error Codes

All errors return JSON in this shape:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Customer email is required",
    "details": { "field": "customerEmail" }
  }
}
```

The HTTP status code is on the response, not in the body.

## Auth errors (401, 403)

| Code | HTTP | When |
|------|------|------|
| `unauthorized` | 401 | Missing or malformed `Authorization: Bearer` header |
| `invalid_token` | 401 | JWT signature verification failed |
| `invalid_audience` | 401 | Token `aud` claim doesn't match tenant audience |
| `token_expired` | 401 | Token past `exp` — client should refresh |
| `tenant_mismatch` | 400 | `X-Tenant-Id` header doesn't match URL `:tenantId` |
| `forbidden` | 403 | Authenticated but role/permission denied |
| `missing_permission` | 403 | Required permission not in token |

## Validation errors (400)

| Code | When |
|------|------|
| `validation_failed` | Body or query params failed schema validation. `details.fields[]` lists the offending fields. |
| `invalid_format` | A field has the wrong type (e.g. date format) |
| `out_of_range` | A numeric field is below min or above max |
| `required_field_missing` | A required field is absent |

## Resource errors (404, 409, 412, 413)

| Code | HTTP | When |
|------|------|------|
| `not_found` | 404 | Resource ID doesn't exist or tenant mismatch |
| `conflict` | 409 | Optimistic concurrency CAS failed (`version` mismatch on Sale/Stock/Cart update) |
| `insufficient_stock` | 409 | Cart reserve or POS sale tried to reserve more than available |
| `state_conflict` | 409 | FSM transition not allowed (e.g. refund on `cancelled` order) |
| `precondition_failed` | 412 | Habeas Data consent missing or policy version mismatch on checkout |
| `payload_too_large` | 413 | Request body > 256KB (admin writes only) |
| `rate_limited` | 429 | Per-tenant throttle exceeded |

## Wompi webhook errors

| Code | HTTP | When |
|------|------|------|
| `invalid_signature` | 401 | HMAC-SHA256 verify failed |
| `invalid_event` | 400 | Event payload missing required fields |
| `duplicate_event` | 200 (idempotent) | Transaction id already processed — no-op |

## Server errors (5xx)

| Code | HTTP | When |
|------|------|------|
| `internal_error` | 500 | Unhandled exception — see CloudWatch logs for stack |
| `service_unavailable` | 503 | DDB throttling or Wompi API down — Lambda auto-retries |

## Mapping to integration Result

The TypeScript integration client maps each error to a typed `Result<T, ApiError>`:

```typescript
const result = await client.cart.reserveStock(cartId)
if (result.ok) {
  console.log('Reserved until', result.value.expiresAt)
} else {
  switch (result.error.code) {
    case 'insufficient_stock':
      // show "low stock" UI
      break
    case 'unauthorized':
    case 'token_expired':
      // refresh token + retry
      break
    default:
      // generic error toast
  }
}
```

See `../integration/src/result.ts` for the typed error union.