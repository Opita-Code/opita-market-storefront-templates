---
name: integration
description: Framework-agnostic TypeScript package that wraps the opita-market backend in typed contracts + utilities (Result<T,E> SDK + zod schemas + in-memory mock + FSM helpers + Wompi webhook parsers + i18n ICU + currency formatters + Habeas Data text). Use when an AI agent needs to consume the backend from any frontend (Next.js, Vue, Svelte, plain HTML) without re-implementing the contract. v0.0.1-prototype — OCAIS workspace only, not public npm.
license: MIT
source_repo: https://github.com/Opita-Code/opita-market-storefront-templates (monorepo: integration/)
integration_target: any TypeScript / JavaScript frontend
template_type: code (installable npm package)
oca_integration: yes
---

# Integration Template — Framework-Agnostic TS Package

This template is a **code template** — an installable npm package that wraps the backend reference template (`../backend/`) in a typed, framework-agnostic SDK.

## When to use this template

An AI agent should reach for this template when:
- Building a frontend (any framework: Next.js, Vue, Svelte, Remix, plain HTML) that needs to call the backend
- Writing tests that need a realistic mock implementation
- Building a CLI or backend-for-frontend that wraps the backend
- Any time the agent would otherwise re-implement the contract in code

An AI agent should **NOT** use this template when:
- It needs to consume the backend directly with curl (use `../backend/` + curl examples)
- It needs to modify the backend (use the source repo directly)
- It's a non-JS project (Python, Go, etc.) — use `../backend/` and write your own typed client

## Architecture: framework-agnostic promise

The integration package exports **only pure functions and types**. No React, Vue, or Svelte components. No JSX. The frontend wraps the primitives in its own idiomatic way.

```typescript
// Pure utilities
import { createClient, type Client } from '@opita/market-integration'
import { canRefund, saleNextStates } from '@opita/market-integration/fsm'
import { formatCurrency } from '@opita/market-integration/currency'
import { getHabeasDataBanner } from '@opita/market-integration/text'
import { t, setLocale } from '@opita/market-integration/i18n'

// In a Next.js component:
export default function CheckoutPage() {
  const [config, setConfig] = useState(null)
  useEffect(() => {
    setLocale('es-CO')
    createClient({ baseUrl: '...', tenantId: 'pasiones' })
      .checkout.getConfig()
      .then(setConfig)
  }, [])
  
  if (!config) return null
  
  const banner = getHabeasDataBanner(config.consentTexts, 'es-CO')
  
  return (
    <div className="checkout">
      <h1>{t('checkout.title')}</h1>
      <div className="habeas-banner" dangerouslySetInnerHTML={{ __html: banner.html }} />
      <button>{t('checkout.acceptAndPay')}</button>
    </div>
  )
}
```

The frontend chooses how to render. The integration stays framework-agnostic.

## What this template contains

```
integration/
├── SKILL.md             ← this file
├── README.md
├── package.json         ← pnpm workspace, exports map
├── tsconfig.json        ← strict mode + ESM + Node 20
├── src/
│   ├── index.ts         ← main barrel (types + client + utilities)
│   ├── types/           ← all domain types (Product, Variant, Cart, Sale, Order, ...)
│   ├── schemas/         ← zod runtime validation (optional — types are primary)
│   ├── client/          ← Result<T,E> typed SDK + createClient factory
│   ├── mock/            ← in-memory mock server with Pasiones fixtures
│   ├── fsm/             ← pure FSM helpers (canRefund, saleNextStates, ...)
│   ├── webhooks/        ← Wompi webhook parser + status mapper
│   ├── i18n/            ← ICU message formatter + 3 locale bundles
│   ├── currency/        ← COP/USD/BRL formatters with locale awareness
│   └── text/            ← Habeas Data banner + receipt + refund modal strings
├── tests/               ← vitest
└── docs/                ← usage, mock-vs-real, adding-endpoint
```

## Public API surface

### Client
- `createClient(config)` → `Client`
- `Client.catalog.{listProducts, getProduct, listVariants, listBranches, getBranch}`
- `Client.stock.{list}`
- `Client.cart.{create, addItem, removeItem, reserve, captureHabeasDataConsent, get}`
- `Client.checkout.{getConfig, createOrder}` (public getConfig)
- `Client.orders.{list, get, refund}`
- `Client.pos.{listSales, getSale, createSale, refundSale}`
- `Client.admin.{audit.list, reports.daily, compliance.getHabeasData}`

All methods return `Result<T, ApiError>` (never throw).

### Types
- `Product`, `Variant`, `Branch`, `StockEntry`, `Cart`, `CartItem`, `CartStatus`
- `Sale`, `SaleLine`, `SaleStatus` (4-state FSM: draft|completed|voided|refunded)
- `Order`, `OrderStatus` (7-state FSM: pending-payment|paid|ready-for-pickup|completed|cancelled|refunded)
- `Customer`, `HabeasDataConsent`
- `AuditLog`, `AuditAction` (22 values), `AuditTargetType` (10 values)
- `JournalEntry`, `JournalEntryKind` (with `"reverse"` variant)
- `CheckoutConfig`, `DailyReport`
- `Result<T, E>`, `ApiError`, `Ok<T>`, `Err<E>`

### FSM helpers (pure functions)
- `canRefund(sale | order): boolean`
- `canCancel(order): boolean`
- `saleNextStates(sale): Transition[]`
- `orderNextStates(order): Transition[]`
- `cartNextStates(cart): Transition[]`

### Mock
- `createMockServer({ tenantId, fixtures? }): Client` — returns the same `Client` interface backed by in-memory data
- `setPasionesFixtures()` — preload Pasiones demo data

### Webhooks
- `parseWompiWebhook(body, signature, eventsKey): Result<WompiEvent, ApiError>`
- `mapWompiStatusToOrderStatus(wompiStatus): OrderStatus`

### i18n
- `t(key, vars?): string` (ICU format)
- `setLocale('es-CO' | 'en-US' | 'pt-BR')`
- `getLocale(): string`

### Currency
- `formatCurrency(amountMinor, currency, locale?): string` — `"$ 1.234.567"` (es-CO COP)
- `formatCurrencyParts(amountMinor, currency, locale?): { symbol, integer, decimals, formatted }`

### Text
- `getHabeasDataBanner(consentTexts, locale): { html, version }`
- `getReceiptText(sale, locale): { header, lineItems, total, footer }`
- `getRefundReasonLabels(locale): { damaged, customerRequest, defectiveProduct, wrongItem, other }`

## Version

- **v0.0.1-prototype** (current) — minimal surface for OCAIS update validation
- **v0.1.0** — full coverage of backend endpoints, all 22 audit actions, 3 locales complete
- **v1.0.0** — stable, semver-locked, public npm

This OCAIS update ships only v0.0.1. The integration layer's purpose is to validate that the 3-template architecture works end-to-end with AI agents before scaling to public consumption.

## What this template does NOT contain

- ❌ React/Vue/Svelte components — those are layered on top by the consuming frontend
- ❌ Visual templates (Tailwind, layout, hero, etc.) — see `../frontend-visual/`
- ❌ The backend code itself — see `../backend/` (reference) and the source repo
- ❌ Wompi SDK / production secrets — see source repo for `wompi-client.ts`

## See also

- `../backend/SKILL.md` — the contract this package wraps
- `../backend/api-spec.json` — OpenAPI 3.1 source of truth
- `../frontend-visual/*/SKILL.md` — visual templates that consume this package