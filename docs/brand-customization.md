# Brand Customization — per-client theming

Each client (Pasiones, Peluquería XYZ, etc.) has its own brand. The visual templates are MIT/open-source upstreams — we override their defaults to match the client's brand without modifying the upstream source.

## Why customize without forking?

Each visual template is a **git submodule**. If we modify `source/`, we'd lose the ability to pull upstream updates. So all customization happens in `theme-overrides/<client>/`.

```
frontend-visual/ecommerce-storefront/
├── source/                  ← git submodule (TailAdmin upstream — DON'T MODIFY)
├── SKILL.md                 ← visual skill (pages, palette, props)
├── THEME.md                 ← this customization guide
├── INSTALL.md
├── theme-overrides/         ← per-client theme tokens
│   ├── pasiones/            ← Pasiones brand
│   │   ├── tokens.css       ← CSS variables (colors, fonts, spacing)
│   │   ├── logo.svg         ← Logo
│   │   ├── og-image.png     ← Open Graph image
│   │   └── manifest.json    ← PWA manifest
│   └── peluqueria-xyz/      ← Peluquería brand (future)
└── repomix.txt
```

## Tokens (CSS variables)

The simplest way to customize is via CSS variables. Each visual template has its own variable names — check the template's docs. The integration package provides the brand-agnostic values (currency, dates) but the visual layer applies them.

For TailAdmin (used by `admin-tailadmin`), override the Tailwind theme:

```css
/* theme-overrides/pasiones/tokens.css */
:root {
  --brand-primary: #C2185B;       /* Pasiones magenta */
  --brand-secondary: #FFC107;     /* Pasiones gold */
  --brand-accent: #F8BBD0;
  --font-display: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --color-bg: #FFF8F1;
  --color-text: #2D2D2D;
  --color-success: #2E7D32;
  --color-warning: #F57C00;
  --color-error: #C62828;
}

[data-theme="dark"] {
  --color-bg: #1A1A1A;
  --color-text: #F5F5F5;
}
```

## Tailwind config (when applicable)

```js
// tailwind.config.js (in client app, not in source/)
import pasionesTokens from './theme-overrides/pasiones/tokens.json'

export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: pasionesTokens.colors.primary,
          secondary: pasionesTokens.colors.secondary,
          // ...
        },
        fontFamily: {
          display: [pasionesTokens.fonts.display, 'serif'],
          body: [pasionesTokens.fonts.body, 'sans-serif']
        }
      }
    }
  }
}
```

## Logo + favicon

Replace the upstream logo with the client's logo. For each visual template, the location varies:

| Template | Logo location |
|----------|---------------|
| `admin-tailadmin` | `source/src/components/Layout/Logo.tsx` (override) or via CSS background-image |
| `ecommerce-storefront` | `source/public/logo.svg` (replace) |
| `booking-service` | `source/components/Logo.tsx` (override) |
| `landing-marketing` | `source/public/logo.svg` (replace) |

For Pasiones: magenta + cursive "Pasiones" wordmark.

## i18n (es-CO, en-US, pt-BR)

The integration package has 3 locales baked in. Override the locale bundles if the client needs different copy:

```typescript
// lib/i18n-overrides.ts
import { setLocale, t } from '@opita/market-integration/i18n'

// Pasiones overrides
const pasionesOverrides = {
  'es-CO': {
    'cart.checkout': 'Ir a pagar en Pasiones',
    'checkout.acceptAndPay': 'Aceptar y pagar con Wompi',
  }
}

setLocale('es-CO')
// t() will use overridden value if present, else default
```

## Multi-tenant dynamic branding

For SaaS scenarios (multiple tenants in one app), generate CSS variables dynamically from the tenant config:

```typescript
// app/[tenant]/layout.tsx (Next.js)
import { createClient } from '@opita/market-integration'

export default async function TenantLayout({ children, params }) {
  const client = createClient({ baseUrl: process.env.OPITA_API_URL!, tenantId: params.tenant as any })
  const config = (await client.checkout.getConfig()).value!

  return (
    <>
      <style>{`
        :root {
          --brand-primary: ${config.brandPrimary};
          --brand-secondary: ${config.brandSecondary};
        }
      `}</style>
      {children}
    </>
  )
}
```

(Sprint 7+: extend `CheckoutConfig` to include `brandPrimary`/`brandSecondary` from `tenant.yml`.)

## Fonts

Use a CDN-loaded Google Font or self-host. For Pasiones:

```html
<!-- app/layout.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
```

## Dark mode

Most templates ship with a dark mode toggle. Override the dark mode tokens per client:

```css
[data-theme="dark"][data-brand="pasiones"] {
  --brand-primary: #F48FB1;
  --color-bg: #1A0F12;
}
```

## Accessibility (WCAG 2.1 AA)

After customization, run an a11y audit:
- [axe DevTools](https://www.deque.com/axe/devtools/) — browser extension
- [Lighthouse a11y score](https://developer.chrome.com/docs/lighthouse/accessibility/) — Chrome DevTools
- [Pa11y CI](https://github.com/pa11y/pa11y-ci) — automated CI check

Targets:
- Color contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text
- All interactive elements keyboard-accessible
- All images have alt text
- Forms have labels
- ARIA roles where needed

## Icons + illustrations

Default icon set varies per template. For Pasiones, we use [Heroicons](https://heroicons.com/) (MIT) or [Lucide](https://lucide.dev/) (ISC).

## OG image + favicon

```bash
# Generate from the logo
npx --yes sharp-cli resize \
  -i theme-overrides/pasiones/logo.svg \
  -o theme-overrides/pasiones/og-image.png \
  --width 1200 --height 630

# Favicons
npx --yes sharp-cli resize \
  -i theme-overrides/pasiones/logo.svg \
  -o theme-overrides/pasiones/favicon-32.png \
  --width 32 --height 32
```

## Smoke test checklist

After customization:

- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 90
- [ ] Lighthouse SEO ≥ 90
- [ ] axe DevTools: 0 critical/serious issues
- [ ] Habeas Data banner renders in es-CO
- [ ] Currency formatted correctly ($ 1.234.567 for COP)
- [ ] Wompi widget loads (test mode)
- [ ] Cart reservation + checkout flow works end-to-end
- [ ] POS refund flow works
- [ ] Mobile responsive (test 375px, 768px, 1024px)
- [ ] Dark mode toggle works

## See also

- `integration/src/i18n/` — 3 locales
- `integration/src/currency/` — COP/USD/BRL formatters
- `integration/src/text/` — Habeas Data + receipt templates
- `frontend-visual/<x>/THEME.md` — template-specific customization notes