# Usage — integration layer

The `@opita/market-integration` package wraps the backend contract in a typed, framework-agnostic SDK. This guide shows the common patterns.

## Install

This package is part of the `opita-market-storefront-templates` monorepo (OCAIS workspace). For now, install via path:

```json
{
  "dependencies": {
    "@opita/market-integration": "file:./integration"
  }
}
```

After v0.1.0 ships, we'll publish to a private npm registry accessible from OCAIS workspaces.

## Configure the client

```typescript
import { createClient, type Client } from '@opita/market-integration'

const client: Client = createClient({
  baseUrl: process.env.OPITA_API_URL!,  // e.g. 'https://market.opitacode.com'
  tenantId: process.env.OPITA_TENANT_ID! as any,
  authToken: getOcaIsToken()  // see below
})
```

### Getting the OCAIS token

In OCAIS-backed frontends, the cookie unsealer middleware returns the JWT automatically. For SSR, read from the cookie:

```typescript
import { cookies } from 'next/headers'

const token = cookies().get('opita_session')?.value
const client = createClient({ ..., authToken: token })
```

In client components, use the browser-side fetch (cookies travel automatically):

```typescript
const response = await fetch('/api/proxy/catalog/products', { credentials: 'include' })
```

## Pattern: handle Result<T, E>

The integration layer uses `Result<T, ApiError>` instead of throwing. This forces explicit error handling:

```typescript
const result = await client.cart.addItem(cartId, { variantId, quantity: 2 })

if (result.ok) {
  // Success — result.value is the updated Cart
  setCart(result.value)
} else {
  // Typed error — result.error is an ApiError
  switch (result.error.code) {
    case 'unauthorized':
    case 'token_expired':
      // Refresh token + retry
      await refreshOcaIsToken()
      return retry()
    case 'rate_limited':
      // Wait + retry
      const retryAfter = Number(result.error.details?.retryAfter ?? 5)
      await sleep(retryAfter * 1000)
      return retry()
    case 'insufficient_stock':
      // Show "low stock" UI
      showLowStockToast()
      break
    case 'conflict':
      // Optimistic concurrency — refetch + retry
      const fresh = await client.cart.get(cartId)
      if (fresh.ok) setCart(fresh.value)
      break
    default:
      // Generic error toast
      showErrorToast(result.error.message)
  }
}
```

## Pattern: Habeas Data banner

The Ley 1581/2012 banner text comes from the backend (operator-controlled). The integration layer renders it as HTML for any framework:

```typescript
import { getHabeasDataBanner } from '@opita/market-integration/text'

// On checkout page load:
const configResult = await client.checkout.getConfig()
if (!configResult.ok) { showError(configResult.error); return }
const config = configResult.value

const banner = getHabeasDataBanner(config.consentTexts, getLocale())

// Then in your JSX/Vue template/Svelte component:
```

### React

```tsx
function CheckoutPage() {
  const [config, setConfig] = useState<CheckoutConfig | null>(null)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    client.checkout.getConfig().then((r) => r.ok && setConfig(r.value))
  }, [])

  if (!config) return <Spinner />

  const banner = getHabeasDataBanner(config.consentTexts, 'es-CO')

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: banner.html }} />
      <label>
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
        {t('cart.consent.accept')}
      </label>
      <button disabled={!accepted} onClick={handleCheckout}>
        {t('checkout.acceptAndPay')}
      </button>
    </div>
  )
}
```

### Vue 3

```vue
<template>
  <div>
    <div v-html="banner.html"></div>
    <label>
      <input type="checkbox" v-model="accepted" />
      {{ t('cart.consent.accept') }}
    </label>
    <button :disabled="!accepted" @click="handleCheckout">{{ t('checkout.acceptAndPay') }}</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@opita/market-integration'
import { getHabeasDataBanner } from '@opita/market-integration/text'
import { setLocale, t } from '@opita/market-integration/i18n'

setLocale('es-CO')
const client = createClient({ baseUrl: import.meta.env.OPITA_API_URL, tenantId: import.meta.env.OPITA_TENANT_ID })
const config = ref(null)
const banner = ref(null)
const accepted = ref(false)

onMounted(async () => {
  const result = await client.checkout.getConfig()
  if (result.ok) {
    config.value = result.value
    banner.value = getHabeasDataBanner(result.value.consentTexts, 'es-CO')
  }
})
</script>
```

### Svelte 5

```svelte
<script>
  import { createClient } from '@opita/market-integration'
  import { getHabeasDataBanner } from '@opita/market-integration/text'
  import { setLocale, t } from '@opita/market-integration/i18n'

  setLocale('es-CO')
  const client = createClient({ baseUrl: ..., tenantId: ... })
  let accepted = $state(false)
  let banner = $state(null)

  $effect(() => {
    client.checkout.getConfig().then((r) => {
      if (r.ok) banner = getHabeasDataBanner(r.value.consentTexts, 'es-CO')
    })
  })
</script>

<div>{@html banner?.html}</div>
<label><input type="checkbox" bind:checked={accepted} /> {t('cart.consent.accept')}</label>
<button disabled={!accepted}>{t('checkout.acceptAndPay')}</button>
```

### Plain HTML (no framework)

```html
<!DOCTYPE html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8">
  <title>Checkout — Pasiones</title>
</head>
<body>
  <div id="habeas-banner"></div>
  <label><input type="checkbox" id="consent"> Acepto la política</label>
  <button id="pay" disabled>Pagar</button>

  <script type="module">
    import { createClient, getHabeasDataBanner, t } from './dist/index.js'
    const client = createClient({ baseUrl: '/api', tenantId: 'pasiones' })
    const config = (await client.checkout.getConfig()).value
    document.getElementById('habeas-banner').innerHTML = getHabeasDataBanner(config.consentTexts, 'es-CO').html
    document.getElementById('consent').addEventListener('change', (e) => {
      document.getElementById('pay').disabled = !e.target.checked
    })
  </script>
</body>
</html>
```

## Pattern: FSM helpers

```typescript
import { canRefund, saleNextStates, orderNextStates } from '@opita/market-integration/fsm'

// Single button
{sale && canRefund(sale) && <button>Refund</button>}

// Full transition list (for admin/POS UI)
const transitions = orderNextStates(order)
return transitions.map((t) => (
  <button key={t.to} disabled={!hasPermission(t.permission)} onClick={() => transition(t)}>
    {t.label}
  </button>
))
```

## Pattern: Wompi webhook (server-side)

If you run a custom webhook receiver (instead of the backend's default), use the parser:

```typescript
import { parseWompiWebhook, mapWompiStatusToOrderStatus } from '@opita/market-integration/webhooks'

app.post('/webhooks/wompi', async (req, res) => {
  const result = await parseWompiWebhook(req.body, process.env.WOMPI_EVENTS_KEY!)
  if (!result.ok) return res.status(result.error.status ?? 400).json({ error: result.error })

  const newStatus = mapWompiStatusToOrderStatus(result.value.transaction.status)
  if (newStatus) {
    await updateOrderStatus(result.value.transaction.reference, newStatus)
  }
  res.status(200).end()
})
```

## Mock backend for dev/tests

```typescript
import { createMockClient, resetMockState } from '@opita/market-integration/mock'

// In your storybook story / test / local dev server:
resetMockState()  // clear between stories
const client = createMockClient({ tenantId: 'pasiones' })
// Same interface as createClient — no code changes needed
```

The mock ships with Pasiones fixtures (3 products, 2 branches, 50 stock units per variant). For custom fixtures, extend the mock state directly (advanced — see `src/mock/server.ts`).