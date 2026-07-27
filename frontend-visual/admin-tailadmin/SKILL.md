---
name: admin-tailadmin
description: Admin dashboard + POS visual base — Next.js 15 + Tailwind + TypeScript + ApexCharts + jsvectormap. Dense table views, charts, sidebars, dark mode. Use when an AI agent needs to render a backoffice (catalog admin, audit log viewer, daily reports) or in-store POS terminal. Consumes `@opita/market-integration` for all backend access. NOT for customer-facing B2C (use ecommerce-storefront) or services with reservations (use booking-service).
license: MIT
source_repo: https://github.com/TailAdmin/free-nextjs-admin-dashboard
integration_target: @opita/market-integration (TS SDK)
template_type: visual
---

# admin-tailadmin — Admin Dashboard + POS

Visual base for an admin/POS interface. The upstream is [TailAdmin Free Next.js Admin Dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard) (MIT, 2.5k stars).

## When to use

An AI agent should use this template when:
- Building a backoffice (product admin, branch admin, stock admin, audit log, daily reports, Habeas Data compliance viewer)
- Building an in-store POS terminal (vendedor role, scan → cart → payment → receipt)
- Need a dense, table-heavy layout with charts
- Need dark mode by default (admin tools usually want it)

An AI agent should **NOT** use this template when:
- The client needs a customer-facing B2C storefront → use `ecommerce-storefront`
- The client needs services with reservations → use `booking-service`
- The project is a marketing landing page → use `landing-marketing`

## What this template contains

```
admin-tailadmin/
├── SKILL.md              ← this file (visual skill)
├── THEME.md              ← brand customization
├── INSTALL.md            ← wire-up with @opita/market-integration
├── source/               ← git submodule (TailAdmin upstream)
├── theme-overrides/      ← per-client brand tokens
└── repomix.txt           ← compressed source for AI context (~531KB)
```

## Pages the template renders

| Page | Route | What it does |
|------|-------|--------------|
| Dashboard | `/` | Sales overview, recent orders, stock levels (ApexCharts) |
| Products | `/catalog/products` | Table of products + variants, filters, inline edit |
| Branches | `/catalog/branches` | Table of branches + per-branch stock summary |
| Stock | `/stock` | Per-variant/per-branch stock levels, adjust + transfer |
| Cart (POS scan mode) | `/pos/cart` | Barcode scan, line items, customer lookup, payment method |
| Sales history | `/pos/sales` | Table of in-store sales, filters by date/branch/status |
| Sale detail | `/pos/sales/[id]` | Sale line items + refund button (gated by `canRefundSale`) |
| Refund modal | (overlay) | Reason picker (es/en/pt labels from `text/refund-modal.ts`) |
| Orders | `/orders` | Online order table, status badges, refund button |
| Audit log | `/admin/audit` | AuditLog rows with filter by actor/action/target |
| Reports | `/admin/reports` | Daily report selector + chart |
| Compliance | `/admin/compliance` | Habeas Data status per customer |
| Settings | `/settings` | Tenant config viewer |

## Default theme

The upstream uses dark mode by default with a blue/cyan accent. Override per client:

```css
/* theme-overrides/pasiones/tokens.css */
:root {
  --brand-primary: #C2185B;       /* Pasiones magenta */
  --brand-secondary: #FFC107;
  --color-bg: #1A0F12;            /* dark mode default */
  --color-surface: #2A1A1E;
  --color-text: #F5F5F5;
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
}
```

## Props the components accept

```typescript
import type { Product, Variant, Branch, StockEntry, Cart, Sale, Order, AuditLog, DailyReport } from '@opita/market-integration'
import type { Locale } from '@opita/market-integration'

interface ProductTableProps {
  products: readonly Product[]
  onEdit: (id: string) => void
  onDeactivate: (id: string) => Promise<Result<void, ApiError>>
  locale: Locale
}

interface PosCartProps {
  cart: Cart
  scannedLine: { variant: Variant; quantity: number } | null
  onScan: (barcode: string) => Promise<Result<Variant, ApiError>>
  onCompleteSale: (paymentMethod: 'cash' | 'card' | 'transfer') => Promise<Result<Sale, ApiError>>
  locale: Locale
}

interface AuditLogTableProps {
  logs: readonly AuditLog[]
  onFilter: (filter: AuditListFilter) => void
  locale: Locale
}

interface RefundModalProps {
  sale: Pick<Sale, 'id' | 'lines' | 'currency'>
  onRefund: (input: RefundInput) => Promise<Result<Sale, ApiError>>
  onClose: () => void
  locale: Locale
}
```

## POS-specific patterns

The POS terminal needs:
- **Barcode scanner input**: usually a USB HID device that emits keystrokes. The frontend listens for Enter after a sequence of digits.
- **Fast keyboard navigation**: vendedor should never need the mouse. Tab through line items, Space to add, Esc to clear.
- **Large touch targets** (when on tablet): buttons ≥ 60×60px.
- **Offline tolerance** (Sprint 7+): cache the catalog in IndexedDB for slow connections.

```tsx
// Example: POS scan listener
'use client'
import { useEffect, useRef } from 'react'
import { getOpitaClient } from '@/lib/opita-client'

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const buffer = useRef('')
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        if (buffer.current.length >= 8) {
          onScan(buffer.current)
        }
        buffer.current = ''
      } else if (/^\d$/.test(e.key)) {
        buffer.current += e.key
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onScan])
}
```

## Installation

```bash
# 1. Clone the upstream
npx create-next-app@latest pasiones-admin --typescript --tailwind --app
cp -r ../frontend-visual/admin-tailadmin/source/* pasiones-admin/
cd pasiones-admin

# 2. Install the SDK
pnpm add @opita/market-integration

# 3. Configure
echo 'OPITA_API_URL=https://market.opitacode.com' > .env.local
echo 'OPITA_TENANT_ID=pasiones' >> .env.local
echo 'OPITA_ADMIN_TOKEN=' >> .env.local  # for admin-only endpoints

# 4. Apply Pasiones branding
cp -r ../frontend-visual/admin-tailadmin/theme-overrides/pasiones/* .
```

See `INSTALL.md` for the full wire-up (admin auth, role-gated routes, audit log component).

## Performance

- Next.js 15 + App Router + RSC
- Virtualized tables (for 1000+ product lists)
- ApexCharts for sales charts (lazy-loaded)
- jsvectormap (only on dashboard)

Lighthouse Performance baseline: ≥ 85 (lower than B2C storefront because admin tools prioritize density over speed).

## Pitfalls

- **Admin auth + role gating**: every admin endpoint requires `audit.read` or `report.read` permission. The SDK surfaces this as `forbidden` / `missing_permission`. UI should redirect to login + show a clear "you don't have access" message.
- **Optimistic concurrency**: stock adjusts require `expectedVersion`. The upstream renders a "save" button — clicking it should re-fetch on `conflict` (409) and retry.
- **Refund audit trail**: every refund emits 1-2 audit logs (`sale.refund` + possibly `wompi.refund.external_handled_outside_platform`). The admin should see these in the audit log immediately after.
- **Habeas Data policy mismatch**: when a customer's policy version is outdated, the compliance endpoint returns `policyVersionMatched: false`. UI should show "needs re-consent" badge.

## License

Upstream TailAdmin is MIT. Our wrapper is MIT.

## See also

- `THEME.md` — brand customization
- `INSTALL.md` — wire-up with `@opita/market-integration`
- `../../integration/SKILL.md` — the SDK this template consumes
- `../../backend/SKILL.md` — the contract reference
- `../../docs/choosing-template.md` — when to pick this vs alternatives