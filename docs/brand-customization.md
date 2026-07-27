# Brand customization — tokens, theming, multi-tenant branding

> Cómo personalizar las plantillas para que cada tenant tenga su propia
> identidad visual, sin perder la consistencia del sistema de diseño.

## 1. Tokens mínimos viables (Tailwind CSS)

Todas las plantillas usan **Tailwind CSS v3+**. La forma estándar de customizar branding es extender la paleta `brand` en `tailwind.config.ts`:

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // PRIMARY — color de marca del tenant
        brand: {
          50:  "#fef3f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",  // primary
          600: "#dc2626",  // primary-hover
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        // ACCENT — color secundario para CTAs, highlights
        accent: {
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      fontFamily: {
        // CUSTOM — fuentes del tenant (descargar vía @fontsource si self-hosting)
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],  // títulos
      },
      borderRadius: {
        // CUSTOM — esquinas más o menos redondeadas
        card: "0.75rem",
        button: "0.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
```

**Reemplazar**:
- Paleta `brand.500` y `brand.600` por el primary color del cliente.
- `fontFamily.sans` por la fuente principal (Inter, Roboto, system-ui, etc.).
- `fontFamily.display` por la fuente de títulos (opcional).

## 2. Logo + favicon

```bash
# Reemplazar en src/ o app/:
public/favicon.ico
public/logo.svg          # primary logo
public/logo-dark.svg     # dark mode variant
src/components/Logo.tsx # componente que carga el SVG correcto según el tema
```

```tsx
// src/components/Logo.tsx
export function Logo({ className }: { className?: string }) {
  return (
    <picture>
      <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
      <img src="/logo.svg" alt="Pasiones" className={className} />
    </picture>
  );
}
```

## 3. Hero image + OG image

Cada tenant necesita:

- `/public/og-image.png` (1200×630, formato OG) — para compartir en redes sociales.
- `/public/hero-bg.jpg` — opcional, para hero del storefront.
- `/public/favicon.ico` + `/public/apple-touch-icon.png`.

Recomendación: usar Vercel OG (`@vercel/og`) para generar dinámicamente según el tenant.

## 4. Dark mode

TailAdmin (y las otras plantillas) traen dark mode por defecto (`darkMode: "class"`). Para customizar la paleta dark:

```ts
// tailwind.config.ts (continuación)
theme: {
  extend: {
    colors: {
      // ...
    },
  },
},
// Plugin para swap de variables según el modo
plugins: [
  function ({ addVariant }) {
    addVariant("dark", "&:where(.dark, .dark *)");
  },
],
```

Las plantillas usan clase `.dark` en `<html>` (gestion via `useTheme` hook).

## 5. Multi-tenant dinámico (Sprint 7+)

Cuando `opita-market-templates` añada soporte multi-tenant en el branding (extender `/checkout/config` con `brand.primaryColor`, `brand.fontFamily`, etc.):

```tsx
// src/lib/apply-branding.ts
import { useEffect } from "react";

export function useApplyBranding() {
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenants/${process.env.NEXT_PUBLIC_TENANT_ID}/checkout/config`)
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.brand?.primaryColor) {
          document.documentElement.style.setProperty("--brand-500", cfg.brand.primaryColor);
        }
        // ... aplicar cada token como CSS variable
      });
  }, []);
}
```

```css
/* tailwind.config.ts */
colors: {
  brand: {
    500: "var(--brand-500, #ef4444)",  // fallback al default si no hay token
  },
}
```

CSS variables permiten que el tenant configure sus colores desde el backend sin rebuild del frontend.

## 6. Tenant-specific copy

Para textos que cambian por tenant pero no son parte del branding visual (e.g., "Bienvenido a Pasiones" vs "Welcome to Pasiones"):

**Sprint 1 (manual)**: hardcodear en cada plantilla:
```tsx
<h1>Bienvenido a {process.env.NEXT_PUBLIC_TENANT_DISPLAY_NAME}</h1>
```

**Sprint 7+ (dinámico)**: añadir endpoint `GET /tenants/:id/copy` que devuelve textos localizados por locale, similar a `/checkout/config`.

## 7. Fuentes tipográficas

Recomendación: self-hosting con `@fontsource`.

```bash
npm install @fontsource/inter @fontsource/playfair-display
```

```ts
// src/app/layout.tsx (or _app.tsx)
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/playfair-display/700.css";
```

Alternativa: Google Fonts via `<link>` (más rápido pero menos privado).

## 8. Iconografía

Las plantillas usan **lucide-react** o **heroicons** (TailAdmin). Cambiar es solo importar el set diferente.

```bash
npm install @heroicons/react
# o
npm install lucide-react
```

```tsx
// antes
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
// después
import { ShoppingCart } from "lucide-react";
```

## 9. Auditoría de accesibilidad

Después de customizar branding, validar con:

- **Lighthouse CI** (Lighthouse accessibility score ≥ 95).
- **axe DevTools** (browser extension) — pasa por cada página customizada.
- **Color contrast** — el nuevo `brand.500` debe tener ratio ≥ 4.5:1 contra el background.
- **Keyboard navigation** — Tab por toda la página, verificar que todos los botones son accesibles.

```bash
# Lighthouse CI en el workflow de deploy
npx @lhci/cli autorun --collect.url=http://localhost:3000
```

## 10. Smoke test por tenant

Para validar que un cambio de branding no rompió nada:

```bash
# 1. Build + test del template customizado
npm run build
npm run test

# 2. Deploy a staging
vercel --target staging

# 3. Smoke test manual con checklist:
#    - [ ] Logo carga correctamente
#    - [ ] Color primario se aplica en botones primary
#    - [ ] Dark mode toggle funciona
#    - [ ] Fuentes cargan sin FOIT
#    - [ ] OG image aparece al compartir link
#    - [ ] Hero copy + imagen correctos
#    - [ ] Footer con datos legales del tenant
```

## Reference

- Tailwind docs: https://tailwindcss.com/docs/theme
- shadcn/ui theming: https://ui.shadcn.com/docs/theming
- OCAIS auth flow: ver `admin-tailadmin/INTEGRATION.md §2`
- Multi-tenant design tokens: [Tailwind CSS Variables pattern](https://tailwindcss.com/docs/customizing-colors#using-css-variables)