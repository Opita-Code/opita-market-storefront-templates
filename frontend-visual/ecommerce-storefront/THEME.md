# Theme Customization — ecommerce-storefront

How to override the upstream's default palette + typography + images to match a client brand (Pasiones, Peluquería XYZ, etc.) WITHOUT modifying the git submodule source.

## Per-client override structure

```
frontend-visual/ecommerce-storefront/
├── source/                    ← git submodule (DO NOT MODIFY)
└── theme-overrides/
    ├── pasiones/
    │   ├── tokens.css         ← CSS variables (colors, fonts, spacing)
    │   ├── tailwind.config.js ← Tailwind theme extensions
    │   ├── logo.svg           ← Pasiones wordmark
    │   ├── og-image.png       ← Open Graph image
    │   ├── favicon-32.png     ← Favicon
    │   └── pwa-manifest.json  ← PWA manifest
    └── peluqueria-xyz/        ← future client
```

## 1. CSS variables

The upstream uses Tailwind's default palette. Override via CSS custom properties:

```css
/* theme-overrides/pasiones/tokens.css */
:root {
  /* Brand */
  --brand-primary: #C2185B;       /* Pasiones magenta */
  --brand-secondary: #FFC107;     /* Pasiones gold */
  --brand-accent: #F8BBD0;        /* Pasiones soft pink */
  --brand-on-primary: #FFFFFF;

  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;

  /* Surfaces (light mode) */
  --color-bg: #FFF8F1;
  --color-surface: #FFFFFF;
  --color-text: #2D2D2D;
  --color-text-muted: #6B6B6B;

  /* Semantic */
  --color-success: #2E7D32;
  --color-warning: #F57C00;
  --color-error: #C62828;
}

[data-theme="dark"] {
  --color-bg: #1A0F12;
  --color-surface: #2A1A1E;
  --color-text: #F5F5F5;
  --color-text-muted: #B0B0B0;
}
```

Import in `app/globals.css`:

```css
@import '../theme-overrides/pasiones/tokens.css';
```

## 2. Tailwind config extensions

```js
// tailwind.config.js
const pasionesTokens = require('./theme-overrides/pasiones/tokens.json')

module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: pasionesTokens.colors.primary,
          secondary: pasionesTokens.colors.secondary,
          accent: pasionesTokens.colors.accent
        }
      },
      fontFamily: {
        display: [pasionesTokens.fonts.display, 'serif'],
        body: [pasionesTokens.fonts.body, 'sans-serif']
      }
    }
  }
}
```

## 3. Logo + favicon

Replace `public/logo.svg` and `public/favicon.ico` with the client's assets. For Pasiones:

```svg
<!-- theme-overrides/pasiones/logo.svg -->
<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="40" font-family="Playfair Display, serif" font-size="32" fill="#C2185B">
    Pasiones
  </text>
</svg>
```

## 4. OG image

```bash
# Generate from logo
npx --yes sharp-cli resize \
  -i theme-overrides/pasiones/logo.svg \
  -o theme-overrides/pasiones/og-image.png \
  --width 1200 --height 630
```

Update `app/layout.tsx` metadata:

```typescript
export const metadata = {
  openGraph: {
    images: ['/theme-overrides/pasiones/og-image.png']
  }
}
```

## 5. Fonts

Use Google Fonts CDN:

```html
<!-- app/layout.tsx -->
import { Playfair_Display, Inter } from 'next/font/google'

const display = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'] })
const body = Inter({ subsets: ['latin'], weight: ['400', '600'] })
```

## 6. Dark mode

Most Next.js ecommerce templates ship with `next-themes`. Configure brand-specific dark mode tokens as shown in step 1.

## Smoke test checklist

After customization:

- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 90
- [ ] Lighthouse SEO ≥ 90
- [ ] axe DevTools: 0 critical/serious issues
- [ ] Color contrast ratio ≥ 4.5:1 (body text), ≥ 3:1 (large text)
- [ ] Habeas Data banner renders in es-CO from `/checkout/config`
- [ ] Currency formatted as `$ 1.234.567` for COP
- [ ] Mobile responsive (test 375px, 768px, 1024px)
- [ ] Dark mode toggle works with brand overrides

## See also

- `INSTALL.md` — wire-up with `@opita/market-integration`
- `../../docs/brand-customization.md` — repo-wide brand guide