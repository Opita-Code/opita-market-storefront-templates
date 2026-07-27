# Install — ecommerce-storefront

How to wire the upstream Next.js ecommerce starter with `@opita/market-integration` for a real client (e.g. Pasiones).

## Prerequisites

- Node.js 20+
- pnpm 9+
- A deployed opita-market-templates backend (or use the mock for dev)

## Step 1 — Scaffold a new client app

```bash
# Use the upstream as the base
npx create-next-app@latest pasiones-storefront --typescript --tailwind --app
cd pasiones-storefront

# Or copy the upstream submodule directly:
cp -r ../frontend-visual/ecommerce-storefront/source/* .
```

## Step 2 — Install the integration SDK

```bash
pnpm add @opita/market-integration
```

## Step 3 — Configure environment

```bash
# .env.local
OPITA_API_URL=https://market.opitacode.com
OPITA_TENANT_ID=pasiones
# Optional: OCAIS token (in OCAIS workspaces, auto-injected)
OCAIS_SESSION_TOKEN=
```

## Step 4 — Create the SDK context

```typescript
// lib/opita-client.ts
import { createClient, type Client } from '@opita/market-integration'

let cachedClient: Client | null = null

export const getOpitaClient = (): Client => {
  if (cachedClient) return cachedClient
  cachedClient = createClient({
    baseUrl: process.env.OPITA_API_URL!,
    tenantId: process.env.OPITA_TENANT_ID! as any,
    authToken: process.env.OCAIS_SESSION_TOKEN
  })
  return cachedClient
}
```

For React Server Components (RSC), wrap in a Server Action:

```typescript
// lib/opita-server.ts
import 'server-only'
import { createClient, type Client } from '@opita/market-integration'
import { cookies } from 'next/headers'

export const getServerOpitaClient = async (): Promise<Client> => {
  const sessionToken = cookies().get('opita_session')?.value
  return createClient({
    baseUrl: process.env.OPITA_API_URL!,
    tenantId: process.env.OPITA_TENANT_ID! as any,
    authToken: sessionToken
  })
}
```

## Step 5 — Page-by-page wiring

| Page | Server Action / hook | SDK call |
|------|----------------------|----------|
| Home (`/`) | `getFeaturedProducts()` | `client.catalog.listProducts({ limit: 8 })` |
| Catalog (`/products`) | `getProducts(filters)` | `client.catalog.listProducts({ ...filters })` |
| Product detail (`/products/[id]`) | `getProductWithVariants(id)` | `client.catalog.getProduct(id)` + `client.catalog.listVariants(id)` + `client.stock.list({ variantId })` |
| Cart drawer | `useCart()` (custom hook) | `client.cart.{create, addItem, removeItem, reserve}` |
| Checkout (`/checkout`) | `getCheckoutConfig()` + `submitOrder()` | `client.checkout.getConfig()` + `client.checkout.create(input)` |
| Order result (`/orders/[id]/result`) | `pollOrderStatus(id)` | `client.orders.get(id)` (polling) |
| Order history (`/orders`) | `getOrders()` | `client.orders.list()` |
| Account (`/account`) | `getMe()` | `/tenants/:id/me` (raw endpoint for now) |

## Step 6 — Replace the demo checkout with Wompi widget

The upstream has a stub checkout. Replace with:

```tsx
// app/checkout/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getOpitaClient } from '@/lib/opita-client'
import { getHabeasDataBanner } from '@opita/market-integration/text'
import { setLocale, t } from '@opita/market-integration/i18n'
import type { CheckoutConfig } from '@opita/market-integration'

export default function CheckoutPage() {
  const [config, setConfig] = useState<CheckoutConfig | null>(null)
  const [accepted, setAccepted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setLocale('es-CO')
    getOpitaClient().checkout.getConfig().then((r) => {
      if (r.ok) setConfig(r.value)
    })
  }, [])

  if (!config) return <div>Loading…</div>

  const banner = getHabeasDataBanner(config.consentTexts, 'es-CO')

  async function handleCheckout() {
    const cartId = localStorage.getItem('cartId')
    if (!cartId) return
    const result = await getOpitaClient().checkout.create({
      cartId,
      customerEmail: 'jane@example.co'  // collect via form
    })
    if (result.ok) {
      window.location.href = result.value.checkoutUrl!
    }
  }

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

## Step 7 — Apply branding

Copy `theme-overrides/pasiones/*` to the project root, update import paths in `app/layout.tsx` + `tailwind.config.js` per `THEME.md`.

## Step 8 — Verify

```bash
pnpm build
pnpm test
pnpm dev

# In browser:
# 1. Browse to /
# 2. Click a product → /products/[id]
# 3. Add to cart → cart drawer opens
# 4. Click checkout → /checkout with Habeas Data banner
# 5. Accept → button enables → click → Wompi widget loads (test mode in dev)
```

For dev without a backend, swap `createClient` for `createMockClient`:

```typescript
// lib/opita-client.ts (dev mode)
import { createMockClient } from '@opita/market-integration/mock'

export const getOpitaClient = () => process.env.NODE_ENV === 'production'
  ? createClient({ baseUrl: process.env.OPITA_API_URL!, tenantId: process.env.OPITA_TENANT_ID! as any })
  : createMockClient({ tenantId: 'pasiones' as any })
```

## See also

- `THEME.md` — brand customization
- `../../integration/docs/usage.md` — framework-agnostic patterns
- `../../integration/docs/mock-vs-real.md` — toggle between mock and real
- `../../docs/api-cookbook.md` — common workflow recipes