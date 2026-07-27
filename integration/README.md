# @opita/market-integration

Framework-agnostic TypeScript SDK for the opita-market-templates backend.

```
import { createClient, canRefund, formatCurrency, getHabeasDataBanner, t, setLocale } from '@opita/market-integration'
```

This package wraps the OpenAPI contract in typed `Result<T, ApiError>` methods + pure utility functions. It works with any framework (Next.js, Vue, Svelte, plain HTML) because it exports no UI components.

## Sub-path exports

| Path | Contents |
|------|----------|
| `@opita/market-integration` | main barrel — types + client + utilities |
| `@opita/market-integration/fsm` | FSM helpers (canRefund, saleNextStates, ...) |
| `@opita/market-integration/webhooks` | Wompi webhook parser + signature verify |
| `@opita/market-integration/i18n` | ICU messages + 3 locales |
| `@opita/market-integration/currency` | COP/USD/BRL formatters |
| `@opita/market-integration/text` | Habeas Data banner + receipt + refund modal strings |
| `@opita/market-integration/mock` | in-memory mock backend (dev + tests) |

## Quick start

```typescript
import { createClient, type Client, ok, err } from '@opita/market-integration'

const client: Client = createClient({
  baseUrl: 'https://market.opitacode.com',
  tenantId: 'pasiones' as any,  // branded type
  authToken: process.env.OCAIS_TOKEN
})

const result = await client.catalog.listProducts({ limit: 20 })
if (result.ok) {
  console.log(result.value.items)
} else {
  switch (result.error.code) {
    case 'unauthorized': /* refresh token */ break
    case 'rate_limited': /* retry with backoff */ break
    default: console.error(result.error)
  }
}
```

## Mock backend (for dev + tests)

```typescript
import { createMockClient, resetMockState } from '@opita/market-integration/mock'

resetMockState()  // optional: clear state between tests
const client = createMockClient({ tenantId: 'pasiones' as any })

// Same interface as createClient — just swap
const products = await client.catalog.listProducts()
// → 3 Pasiones fixtures (Camiseta, Pantalón, Zapatos)
```

## FSM helpers

```typescript
import { canRefund, saleNextStates, orderNextStates } from '@opita/market-integration/fsm'

if (canRefund(sale)) {
  // show "Refund" button
}

const nextStates = orderNextStates(order)
// → [{ to: 'ready-for-pickup', label: 'order.markReady', permission: 'order.update' }, ...]
```

## i18n + currency

```typescript
import { setLocale, t } from '@opita/market-integration/i18n'
import { formatCurrency } from '@opita/market-integration/currency'

setLocale('es-CO')
console.log(t('cart.title'))  // "Carrito"
console.log(formatCurrency(1234567, 'COP'))  // "$ 1.234.567"
```

## Habeas Data banner (framework-agnostic)

```typescript
import { getHabeasDataBanner } from '@opita/market-integration/text'

const config = (await client.checkout.getConfig()).value!
const banner = getHabeasDataBanner(config.consentTexts, 'es-CO')
// → { html: '<aside class="habeas-data-banner">...</aside>', version: '2026-07-27.1', locale: 'es-CO' }

// In React:
// <div dangerouslySetInnerHTML={{ __html: banner.html }} />
//
// In Vue:
// <div v-html="banner.html"></div>
//
// In Svelte:
// {@html banner.html}
```

## Wompi webhook

```typescript
import { parseWompiWebhook, mapWompiStatusToOrderStatus } from '@opita/market-integration/webhooks'

const result = await parseWompiWebhook(req.body, process.env.WOMPI_EVENTS_KEY!)
if (result.ok) {
  const newStatus = mapWompiStatusToOrderStatus(result.value.transaction.status)
  // → 'paid' | 'cancelled' | null (PENDING)
}
```

## Version

**v0.0.1-prototype** — minimal OCAIS update. The integration layer's purpose is to validate the 3-template architecture works end-to-end with AI agents before scaling to public consumption.

For version history and changelog, see `CHANGELOG.md` (TODO after v0.1.0).

## License

MIT — see root LICENSE file.

## See also

- `../backend/` — the OpenAPI contract this package wraps
- `../frontend-visual/*/SKILL.md` — visual templates that consume this package
- `../docs/oca-integration.md` — how OCAIS discovers and uses the 3 templates