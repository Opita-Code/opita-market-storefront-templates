---
name: ecommerce-storefront
description: B2C ecommerce storefront visual base — Next.js 14 + Tailwind + shadcn/ui. Pluggable checkout, i18n-ready, WCAG accessible, SEO-optimized. Use when an AI agent needs to render an online store with product catalog, cart drawer, checkout flow, and order history. Consumes `@opita/market-integration` for all backend access. NOT for POS (use admin-tailadmin) or services with reservations (use booking-service).
license: open-source
source_repo: https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter
integration_target: @opita/market-integration (TS SDK)
template_type: visual
---

# ecommerce-storefront — B2C Online Store

Visual base for a customer-facing online store. The upstream is [Epic-Design-Labs Next.js Ecommerce Starter](https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter) (open-source). This folder wraps the upstream in the standard template contract.

## When to use

An AI agent should use this template when:
- Building a customer-facing storefront with catalog browsing + product detail + cart + checkout
- Need a mobile-first responsive layout (Tailwind + shadcn/ui)
- Need WCAG 2.1 AA accessibility (Radix primitives)
- Need multi-language support (es-CO / en-US / pt-BR via the integration package's i18n)
- Need SEO-optimized pages (Next.js metadata API)

An AI agent should **NOT** use this template when:
- The client needs a POS terminal / backoffice → use `admin-tailadmin`
- The client needs services with reservations (salon, spa) → use `booking-service`
- The client needs a static marketing landing → use `landing-marketing`
- The project is marketplace multi-vendor (multiple sellers) → not in MVP-6 scope

## What this template contains

```
ecommerce-storefront/
├── SKILL.md              ← this file (visual skill — no backend details)
├── THEME.md              ← how to customize for Pasiones / Peluquería XYZ
├── INSTALL.md            ← how to wire with @opita/market-integration
├── source/               ← git submodule (upstream Next.js code)
├── theme-overrides/      ← per-client brand tokens (CSS variables, fonts, logos)
└── repomix.txt           ← compressed source for AI agent context (~382KB)
```

## Pages the template renders

| Page | Route (Next.js App Router) | What it does |
|------|---------------------------|--------------|
| Home | `/` | Hero, featured products, category grid |
| Catalog | `/products` | Product grid with filters (category, price, branch availability) |
| Product detail | `/products/[id]` | Gallery, variant selector (size/color), stock badge per branch, add-to-cart |
| Cart drawer | `/cart` (drawer overlay) | Line items, quantity controls, subtotal in formatted currency, "Checkout" CTA |
| Checkout | `/checkout` | Habeas Data banner (from `/checkout/config`), Wompi widget iframe, contact form |
| Order result | `/orders/[id]/result` | Polls order status until paid/cancelled/refunded |
| Order history | `/orders` | List of customer orders with status badges |
| Account | `/account` | Customer profile + Habeas Data consent status |
| About / Contact | `/about`, `/contact` | Static CMS pages |

## Default theme

The upstream's default palette is neutral (white + grays + 1 accent). Override per client:

```css
/* theme-overrides/pasiones/tokens.css */
:root {
  --brand-primary: #C2185B;     /* Pasiones magenta */
  --brand-secondary: #FFC107;   /* Pasiones gold */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
}
```

See `THEME.md` for full customization guide.

## Props the components accept

```typescript
// All component types come from @opita/market-integration
import type { Product, Variant, Cart, Order, CheckoutConfig } from '@opita/market-integration'
import type { Locale } from '@opita/market-integration'

interface ProductCardProps {
  product: Product
  onAddToCart: (variantId: string, quantity: number) => Promise<Result<void, ApiError>>
  locale: Locale
  branchId?: string  // show stock badge for this branch
}

interface ProductDetailProps {
  product: Product
  variants: readonly Variant[]
  stockByBranch: Record<branchId, StockEntry[]>
  onAddToCart: (variantId: string, quantity: number) => Promise<Result<Cart, ApiError>>
  locale: Locale
}

interface HabeasDataBannerProps {
  config: CheckoutConfig          // from client.checkout.getConfig()
  locale: Locale
  accepted: boolean
  onAccept: () => void
  onReject: () => void
}

interface CartDrawerProps {
  cart: Cart
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<Result<Cart, ApiError>>
  onRemoveItem: (itemId: string) => Promise<Result<Cart, ApiError>>
  onCheckout: () => void
  locale: Locale
}
```

The components are agnostic — they don't know HTTP. All backend access happens through the SDK passed via props or context.

## Installation

```bash
# 1. Install the template (as a fresh client app)
npx create-next-app@latest pasiones-storefront --typescript --tailwind --app
cp -r frontend-visual/ecommerce-storefront/source/* pasiones-storefront/

# 2. Install the integration SDK
cd pasiones-storefront
pnpm add @opita/market-integration

# 3. Wire it up
echo 'OPITA_API_URL=https://market.opitacode.com' > .env.local
echo 'OPITA_TENANT_ID=pasiones' >> .env.local

# 4. Replace demo checkout with Wompi widget (see INSTALL.md for full code)

# 5. Apply Pasiones branding
cp -r ../frontend-visual/ecommerce-storefront/theme-overrides/pasiones/* .
```

See `INSTALL.md` for the full wire-up (client config, SDK context provider, page-by-page mapping).

## Performance

The upstream ships with:
- Next.js 14 App Router + RSC
- Image optimization via `next/image`
- Code splitting per route
- Lighthouse Performance ≥ 90 baseline (verify after customization)

## Accessibility

The upstream uses Radix primitives (via shadcn/ui) for all interactive elements:
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Screen reader announcements (aria-live for cart updates)
- Focus trap in modals
- Form labels + error messages

After customization, run [axe DevTools](https://www.deque.com/axe/devtools/) to verify.

## Pitfalls

- **Wompi widget sandbox vs production**: use `WompiEnvironment=sandbox` in dev. The widget shows "Test mode" banner.
- **Habeas Data policy version bump**: if the operator bumps `consent_text_version` in `tenant.yml`, the banner text changes. The frontend re-fetches `/checkout/config` on page load — no code change needed.
- **Cart abandonment**: 15-min TTL on cart, 30-min on checkout. Sweeper Lambda runs every 1 min. UI should show "your reservation expires in X" countdown.
- **Stock oversell**: the upstream renders "Add to cart" optimistically. Always revalidate on the PDP at least every 60s (more often near checkout).

## License

Upstream is open-source (per Epic-Design-Labs license). Our wrapper is MIT.

## See also

- `THEME.md` — full brand customization
- `INSTALL.md` — wire-up guide with `@opita/market-integration`
- `../../integration/SKILL.md` — the SDK this template consumes
- `../../backend/SKILL.md` — the contract reference (for the SDK, not directly)
- `../../docs/choosing-template.md` — when to pick this vs alternatives