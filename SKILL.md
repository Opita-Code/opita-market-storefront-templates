---
name: opita-market-storefront-templates
description: |
  Catálogo de plantillas frontend open-source, pre-empaquetadas como Agent Skills
  (formato Anthropic/agentskills.io), listas para personalizar e integrar con
  el backend opita-market-templates. Cubre 4 verticales: e-commerce B2C,
  admin/POS, servicios con booking, landing pages de marketing.

  Use when: un cliente nuevo de opita-market necesita un frontend funcional
  rápido; el operador quiere elegir entre plantillas probadas (TailAdmin,
  Next.js ecommerce starter, HAAR Salon, ixartz) sin empezar desde cero.

  Don't use when: el cliente quiere un diseño 100% a medida (mejor contratar
  un diseñador); el vertical no está en el catálogo (futuro); necesitas una
  PWA móvil nativa (estas son web responsive, no React Native).
license: MIT
source_repos:
  - https://github.com/TailAdmin/free-nextjs-admin-dashboard
  - https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter
  - https://github.com/letsopencals/template-haar
  - https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template
integration_target: opita-market-templates v0.1.0+ (Sprint 6+)
---

# opita-market-storefront-templates — catálogo de plantillas frontend

## Cuándo activar este skill

Activa este skill cuando:
- Un cliente nuevo de `opita-market` necesita un frontend funcional y rápido.
- El operador pregunta "¿qué plantilla uso para mi cliente X?".
- Necesitas estimar tiempo de integración de un frontend nuevo (4-8h con una plantilla vs 4-6 semanas desde cero).
- Quieres comparar 2 plantillas candidatas (e.g., TailAdmin vs NextAdmin) antes de elegir.

## NO activar este skill cuando:

- El cliente quiere diseño 100% a medida (contratar diseñador; usar plantillas solo como referencia visual).
- El vertical no está en el catálogo (futuro: marketplace multi-tenant, food delivery, servicios profesionales con calendario).
- Necesitas PWA móvil nativa (React Native / Expo) — esto es web responsive.

## Estructura del catálogo

```
opita-market-storefront-templates/
├── templates/
│   ├── admin-tailadmin/           POS tablet + backoffice (Sprint 1 ✅)
│   ├── ecommerce-storefront/      B2C tienda online (Sprint 1 ✅)
│   ├── booking-service/           Servicios con reserva (Sprint 2 🟡)
│   └── landing-marketing/         Landing pages marketing (Sprint 2 🟡)
├── docs/                          guías + cookbook
└── scripts/                       tooling (repack, scaffold, validate)
```

Cada subcarpeta `templates/<name>/` contiene:
- `SKILL.md` — metadata estándar (este mismo formato) + integración con backend
- `INTEGRATION.md` — pasos concretos para conectar al backend `opita-market-templates`
- `repomix.txt` — código fuente completo comprimido (formato Repomix plain text)
- `source/` — git submodule con el código real del repo MIT original

## Decision tree (qué plantilla usar)

```
¿El cliente quiere…
│
├── POS terminal / admin / dashboards / RBAC / charts?
│   └── admin-tailadmin ✅
│       Stack: Next.js + Tailwind CSS (TailAdmin)
│       MIT licensed, 2.5k stars, actively maintained
│       Backend: consume /admin/* + /pos/* routes
│
├── Tienda online B2C con pickup + pago Wompi?
│   └── ecommerce-storefront ✅
│       Stack: Next.js + Tailwind + shadcn/ui (Epic-Design-Labs starter)
│       "Pluggable checkout, i18n ready, fully accessible, SEO optimized"
│       Backend: consume /catalog/* /cart/* /orders/* + Wompi widget iframe
│
├── Servicios con reserva (salon, spa, consultorio)?
│   └── booking-service 🟡
│       Stack: Next.js 15 + Tailwind v4 (HAAR Salon)
│       Open-source, requires adaptation (Opencals SDK → custom backend)
│       Backend: requiere Sprint 7+ vertical "services-with-bookings"
│
└── Landing page de marketing / anuncio?
    └── landing-marketing 🟡
        Stack: Next.js + Tailwind (ixartz starter)
        MIT licensed, minimal starter
        Backend: ninguno (estático puro, link al storefront o app)
```

Ver [`docs/choosing-template.md`](docs/choosing-template.md) para la matriz completa con criterios de selección (license, stack, customization cost, integration time).

## Activation triggers (palabras clave que disparan este skill)

Cuando el operador dice:
- "necesito un frontend para X cliente"
- "qué plantilla me recomiendas para Y"
- "TailAdmin vs [otra cosa]"
- "storefront para tienda"
- "POS para vendedor"
- "admin panel"
- "cliente quiere reservar"
- "landing page de anuncio"
- "integra esto con opita-market-templates"

## Workflow de selección

1. **Identificar el vertical del cliente** (e-commerce / admin-POS / servicios / marketing).
2. **Leer SKILL.md de la plantilla candidata** (este formato + descripción).
3. **Leer INTEGRATION.md** para estimar tiempo de integración contra el backend.
4. **Si hay duda entre 2 plantillas**, leer ambas `repomix.txt` y comparar.
5. **Clonar el submodule** y customizar in-place (`cd templates/<name>/source`).
6. **Reempaquetar como zip o push a Vercel/similar** para deploy.

## Backend integration

Todas las plantillas consumen el backend `opita-market-templates` corriendo en Lambda. Endpoints principales por plantilla:

| Plantilla | Endpoints | Auth |
|---|---|---|
| admin-tailadmin | /admin/*, /pos/*, /audit, /reports/daily | OCAIS cookie (admin role) |
| ecommerce-storefront | /catalog/*, /cart/*, /orders/*, /checkout/config (público) | OCAIS cookie (cliente role) |
| booking-service | (futuro) /services/*, /bookings/* | OCAIS cookie |
| landing-marketing | ninguno — link estático al storefront | n/a |

Ver [`docs/api-cookbook.md`](docs/api-cookbook.md) para detalles de cada endpoint.

## Multi-tenant branding

Cada plantilla lee del endpoint público `/tenants/:tenantId/checkout/config` (configurado en el backend Sprint 6) para:
- Moneda (COP, USD, etc.)
- Textos de consentimiento (Habeas Data Ley 1581/2012)
- TTL del carrito

Ver [`docs/brand-customization.md`](docs/brand-customization.md) para temas tokens + Tailwind config.

## Customization típico por plantilla

| Tarea | Tiempo estimado |
|---|---|
| Branding (logo, colores, fuentes) | 2-4h |
| i18n es-CO/en-US/pt-BR | 4-8h (ecommerce) |
| Wompi widget integration | 2-4h (ecommerce) |
| OCAIS cookie auth | 2-4h (todas) |
| Deployment a Vercel + custom domain | 1-2h |
| **Total ecommerce storefront → produccion** | **~1-2 días** |
| **Total admin/POS → produccion** | **~1 día** |

vs 4-6 semanas desde cero.

## Reference

- Estructura del catálogo: este archivo + cada `templates/<name>/SKILL.md`
- Estándar del formato: https://agentskills.io/home
- Herramienta de compresión: https://github.com/yamadashy/repomix
- Backend a integrar: [`opita-market-templates`](../opita-market-templates) — `docs/runbooks/` por endpoint
- Runbooks operativos: cada plantilla tiene `INTEGRATION.md` con pasos concretos