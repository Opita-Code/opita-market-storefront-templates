# Mock vs Real — how to toggle

The integration package ships a single `Client` interface. Whether the calls go to the real backend or the in-memory mock depends on how you construct the client.

## The two factories

```typescript
import { createClient } from '@opita/market-integration'           // real HTTP
import { createMockClient } from '@opita/market-integration/mock'   // in-memory
```

Both return the **same `Client` interface**. Your code doesn't branch.

## When to use which

| Use case | Factory |
|----------|---------|
| Production frontend | `createClient` |
| Staging / E2E tests against deployed env | `createClient` |
| Local dev without backend running | `createMockClient` |
| Unit tests | `createMockClient` |
| Storybook stories | `createMockClient` |
| AI agent sandbox runs | `createMockClient` |
| Visual regression tests | `createMockClient` |

## Configuration pattern

```typescript
// lib/client.ts
import { createClient, createMockClient, type Client } from '@opita/market-integration'
import { createMockClient as createMock } from '@opita/market-integration/mock'

const USE_MOCK = process.env.NODE_ENV !== 'production' && process.env.OPITA_USE_MOCK === 'true'

export const client: Client = USE_MOCK
  ? createMockClient({
      tenantId: (process.env.OPITA_TENANT_ID ?? 'pasiones') as any
    })
  : createClient({
      baseUrl: process.env.OPITA_API_URL!,
      tenantId: process.env.OPITA_TENANT_ID! as any,
      authToken: getOcaIsToken()
    })
```

## Mock state

The mock is **stateful** at the module level (Maps). All clients created in the same process share state. To isolate tests:

```typescript
import { resetMockState } from '@opita/market-integration/mock'

beforeEach(() => resetMockState())
```

The mock seeds Pasiones fixtures on first access (3 products, 2 branches, 50 stock per variant).

## Mock limitations

The mock does NOT implement:
- ❌ Wompi webhook HMAC verification (use `parseWompiWebhook` directly)
- ❌ OCAIS token rotation
- ❌ DynamoDB-native TTL (cart/checkout expiry)
- ❌ Audit log persistence (logs are kept in memory only)
- ❌ Optimistic concurrency CAS (versions are 1 forever)

For these, you need the real backend.

## Mock + Storybook

```typescript
// .storybook/main.ts
import { createMockClient } from '@opita/market-integration/mock'

export const decorators = [
  (Story) => {
    const client = createMockClient({ tenantId: 'pasiones' })
    return <ClientProvider client={client}><Story /></ClientProvider>
  }
]
```