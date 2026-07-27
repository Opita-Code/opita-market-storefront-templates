# API Cookbook — common workflows

This guide shows how to do common e-commerce workflows using the integration package. **All examples use the typed `Result<T, ApiError>` API** — never raw fetch.

## Workflow 1: List products for the storefront

```typescript
import { createClient, type Client } from '@opita/market-integration'

const client: Client = createClient({
  baseUrl: process.env.OPITA_API_URL!,
  tenantId: process.env.OPITA_TENANT_ID! as any
})

const result = await client.catalog.listProducts({ status: 'active', limit: 20 })

if (!result.ok) {
  // handle error
  return
}

const products = result.value.items
// render ProductCard for each
```

## Workflow 2: Customer adds item to cart + reserves stock

```typescript
// 1. Create cart
const cartResult = await client.cart.create({ branchId: 'branch_001' })
if (!cartResult.ok) return
const cart = cartResult.value

// 2. Add item (with optimistic concurrency)
const addResult = await client.cart.addItem(cart.id, {
  variantId: 'var_001',
  quantity: 2,
  expectedStockVersion: 1
})
if (!addResult.ok) {
  if (addResult.error.code === 'conflict') {
    // Stock was updated by another user — refetch and retry
    const fresh = await client.stock.list({ variantId: 'var_001', branchId: 'branch_001' })
    if (fresh.ok && fresh.value.items[0]) {
      await client.cart.addItem(cart.id, {
        variantId: 'var_001',
        quantity: 2,
        expectedStockVersion: fresh.value.items[0].version
      })
    }
  }
  return
}

// 3. Reserve stock (15-min TTL)
const reserveResult = await client.cart.reserve(cart.id)
if (!reserveResult.ok) return
// Now show "Proceed to checkout" button
```

## Workflow 3: Habeas Data consent capture

The Ley 1581/2012 banner comes from the backend (operator-controlled). The frontend renders it + captures consent.

```typescript
// On checkout page load
const configResult = await client.checkout.getConfig()
if (!configResult.ok) return
const config = configResult.value

// Render banner
import { getHabeasDataBanner } from '@opita/market-integration/text'
const banner = getHabeasDataBanner(config.consentTexts, 'es-CO')

// User clicks "Accept"
async function handleAccept() {
  const result = await client.cart.captureHabeasDataConsent(cart.id, {
    accepted: true,
    policyVersion: config.habeasDataPolicyVersion
  })
  if (!result.ok) {
    if (result.error.code === 'conflict') {
      // Policy version mismatch — refetch config and re-display banner
      const fresh = await client.checkout.getConfig()
      // ...
    }
  }
}
```

See `integration/docs/usage.md` for framework-specific patterns (React, Vue, Svelte, plain HTML).

## Workflow 4: Checkout + Wompi redirect

```typescript
import { canRefund, saleNextStates } from '@opita/market-integration/fsm'

const checkoutResult = await client.checkout.create({
  cartId: cart.id,
  customerEmail: 'jane@example.co',
  customerFullName: 'Jane Doe',
  customerPhone: '+57 1 234 5678'
})

if (!checkoutResult.ok) {
  if (checkoutResult.error.code === 'precondition_failed') {
    // Habeas Data consent missing or policy version mismatch
    showConsentBanner()
  }
  return
}

const order = checkoutResult.value
// Redirect to Wompi widget
window.location.href = order.checkoutUrl!
```

## Workflow 5: Order status tracking

Wompi sends webhook → backend updates Order status → frontend polls or uses SSE.

```typescript
// Polling pattern (every 5s while on order page)
const pollOrder = async (orderId: string) => {
  const result = await client.orders.get(orderId)
  if (!result.ok) return
  const order = result.value

  switch (order.status) {
    case 'pending-payment':
      // keep polling
      break
    case 'paid':
      // show success page
      break
    case 'cancelled':
      // show retry UI
      break
    case 'refunded':
      // show refund receipt
      break
  }
}

setInterval(() => pollOrder(orderId), 5000)
```

## Workflow 6: Customer-initiated refund

```typescript
import { canRefundOrder, orderNextStates } from '@opita/market-integration/fsm'

const order = (await client.orders.get(orderId)).value!

// UI decision: show refund button?
if (!canRefundOrder(order)) {
  hideRefundButton()
  return
}

// User picks reason + submits
const refundResult = await client.orders.refund(order.id, {
  reason: 'damaged',  // or 'customerRequest' | 'defectiveProduct' | 'wrongItem' | 'other'
  notes: 'Box was crushed during shipping',
  // refundLines omitted → full refund
  // refundLines: [{ variantId: 'var_001', quantity: 1 }] → partial
})

if (!refundResult.ok) {
  if (refundResult.error.code === 'state_conflict') {
    // Order moved to a non-refundable state (e.g. cancelled)
    // Refresh + re-check
  }
  return
}

// Show refund confirmation
const refunded = refundResult.value
// Backend emits `order.refund` audit log + counter JournalEntry automatically
```

## Workflow 7: POS sale (vendedor)

```typescript
import { canRefundSale, saleNextStates } from '@opita/market-integration/fsm'

const saleResult = await client.pos.createSale({
  branchId: 'branch_001',
  paymentMethod: 'cash',  // 'cash' | 'card' | 'transfer'
  lines: [
    { variantId: 'var_001', quantity: 2 },
    { variantId: 'var_002', quantity: 1 }
  ]
})

if (!saleResult.ok) return
const sale = saleResult.value

// Print receipt
import { getReceiptText } from '@opita/market-integration/text'
import { formatCurrency } from '@opita/market-integration/currency'

const receipt = getReceiptText(sale, 'es-CO')
console.log(receipt.header)
for (const line of sale.lines) {
  console.log(receipt.lineItemLabel(
    line.variantId,
    line.quantity,
    formatCurrency(line.unitPriceAmount * line.quantity, sale.currency, 'es-CO')
  ))
}
console.log(receipt.totalLabel + ': ' + formatCurrency(sale.totalAmount, sale.currency, 'es-CO'))
console.log(receipt.footer)
```

## Workflow 8: Audit log query (auditor/admin)

```typescript
const auditResult = await client.admin.audit.list({
  actorEmail: 'vendedor@pasiones.co',
  limit: 50
})

if (!auditResult.ok) return
const logs = auditResult.value.items

for (const log of logs) {
  console.log(`${log.createdAt} ${log.actorEmail} ${log.action} ${log.targetType ?? '-'}:${log.targetId ?? '-'}`)
}
```

**Note**: querying audit logs emits its own `audit.list` log entry for Ley 1581 PII-access traceability.

## Workflow 9: Habeas Data compliance check

```typescript
// As auditor/admin, check if a customer's consent is current
const result = await client.admin.compliance.getHabeasData(customerId)

if (!result.ok) return

if (!result.value.policyVersionMatched) {
  // Customer needs to re-consent on next reservation
  // Backend will re-capture automatically — flag for manual follow-up
  console.warn(`Customer ${customerId} on old policy version ${result.value.habeasDataConsent?.policyVersion}`)
}
```

## Workflow 10: Daily report (admin)

```typescript
const today = new Date().toISOString().slice(0, 10)  // YYYY-MM-DD
const reportResult = await client.admin.reports.daily(today)

if (!reportResult.ok) {
  if (reportResult.error.code === 'validation_failed') {
    // Future date rejected
  }
  return
}

const report = reportResult.value
console.log(`Sales: ${report.sales.total} (POS: ${report.sales.byChannel.pos}, Online: ${report.sales.byChannel.online})`)
console.log(`Refunds: ${report.refunds.count} (total: ${formatCurrency(report.refunds.total, 'COP', 'es-CO')})`)
```

## Mock backend for testing these workflows

```typescript
import { createMockClient, resetMockState } from '@opita/market-integration/mock'

resetMockState()
const client = createMockClient({ tenantId: 'pasiones' as any })

// Now run any of the above workflows — same interface, in-memory state
```

The mock ships with Pasiones fixtures (3 products, 2 branches, 50 stock per variant). Reset between tests with `resetMockState()`.

## Reference

- `integration/src/types/` — all domain types
- `integration/src/fsm/` — FSM helpers
- `backend/docs/fsm.md` — FSM source of truth
- `backend/docs/errors.md` — error code reference