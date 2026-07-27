---
name: landing-marketing
description: |
  Minimal Next.js landing page template for marketing / product launch / ad
  campaigns, based on ixartz Next.js Landing Page Starter Template (MIT).

  Use when: building a static marketing site with hero, features, pricing,
  FAQ, CTA. No backend required — link to the storefront or app.

  Don't use for: ecommerce with cart (use ecommerce-storefront), admin
  backoffice (use admin-tailadmin), booking flows (use booking-service).

  Stack: Next.js + Tailwind CSS + TypeScript + ESLint + Prettier + Husky
  License: MIT
  Source: https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template
  Integration target: none (static marketing site)
---

# landing-marketing — ixartz Next.js Landing Page variant

## ⚠️ Status: Sprint 2 (scaffold)

This template's SKILL.md is a **scaffold**. The ixartz template is a clean
starter — minimal sections + Tailwind setup. The integration work for Sprint
2 includes:

1. Customize the homepage sections (Hero, Features, Pricing, FAQ, CTA).
2. Add a `<Link>` to the tenant's actual storefront (`opita-market-storefront-templates/ecommerce-storefront`).
3. Optional: add a `/admin` link if the tenant also has backoffice needs.
4. Re-run `scripts/repack.sh` after customizing.

## Cuándo activar este skill (cuando esté completo)

Activa cuando el operador necesita:
- **Landing page** para anuncio de producto / servicio.
- **Sitio estático** linked desde campañas de marketing (Google Ads, Meta Ads).
- **Hero + Features + Pricing + FAQ + CTA** pattern.
- **Multi-idioma** es-CO / en-US / pt-BR (si el operador lo requiere).

Stack técnico:
- Next.js + App Router
- Tailwind CSS + TypeScript
- ESLint + Prettier + Husky pre-configurados
- Sin backend — todo estático o client-side fetch

## NO usar este skill cuando:

- El cliente vende **productos físicos** → `ecommerce-storefront`.
- El cliente necesita **POS / inventario** → `admin-tailadmin`.
- El cliente quiere **reservas** → `booking-service`.

## Customization típica

| Tarea | Tiempo |
|---|---|
| Branding (logo, colores) | 1-2h |
| Hero copy + imagen | 2-4h |
| Features section | 2-4h |
| Pricing table | 1-2h |
| FAQ accordion | 1-2h |
| CTA → storefront link | 30min |
| SEO meta tags + OG image | 1h |
| Deploy a Vercel + custom domain | 1-2h |
| **Total → producción** | **~1 día** |

## Multi-tenant strategy

Para soportar múltiples tenants en un mismo repo:
- Crear `app/[tenantId]/page.tsx` con switch dinámico.
- El tenantId viene del subdominio (`pasiones.opitacode.com` → `pasiones`).
- Mapear subdomain → tenant via `middleware.ts`.
- Cada tenant tiene sus propias secciones (configurable via tenant.yml o archivo JSON).

Sprint 7+ — multi-tenant real con tokens dinámicos desde backend.

## Reference

- Upstream: https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template
- ixartz demo: https://next-landing-page-template.vercel.app/
- Standard: https://agentskills.io/home