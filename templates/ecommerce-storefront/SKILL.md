---
name: ecommerce-storefront
description: |
  B2C ecommerce storefront based on Epic-Design-Labs Next.js Ecommerce Starter
  (open-source, pluggable checkout, i18n ready, fully accessible, SEO optimized).

  Use when: building a customer-facing online store with pickup + payment
  (Wompi in our case), product catalog browsing, search, cart, checkout,
  order history. Mobile-friendly responsive layout.

  Don't use for: POS terminal (use admin-tailadmin), services with booking
  (use booking-service), marketing landing pages (use landing-marketing).

  Stack: Next.js 14 + Tailwind CSS + shadcn/ui + TypeScript
  License: open-source (permissive)
  Source: https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter
  Integration target: opita-market-templates v0.1.0+ (Sprint 3+ cart, Sprint 4+ Wompi)
---

# ecommerce-storefront — Next.js Ecommerce Starter variant for opita-market-templates

## Cuándo activar este skill

Activa cuando el operador necesita:
- **Tienda online B2C** responsive (mobile-first) con catálogo, búsqueda, filtros.
- **Carrito de compras** con drawer lateral, cantidad, totales en tiempo real.
- **Checkout con Wompi widget iframe** (Sprint 4+ del backend).
- **Página de producto** con galería, selector de variante (size/color), stock badge.
- **Historial de pedidos** del cliente logueado (Order Read).
- **Multi-idioma es-CO / en-US / pt-BR** (Ley 1581 + trilingüe para Pasiones).

Stack técnico (lo que el agente debe asumir):
- Next.js 14 App Router + RSC
- Tailwind CSS + shadcn/ui (Radix primitives)
- TypeScript
- **Pluggable checkout** = el repo trae un stub de checkout que vamos a reemplazar con la integración Wompi del backend
- i18n-ready (locale switcher ya integrado)
- Fully accessible (WAI-ARIA via Radix)
- SEO-optimized (Next.js metadata API)

## NO usar este skill cuando:

- El cliente quiere **POS terminal / backoffice** → `admin-tailadmin`.
- El cliente quiere **reservas con calendario** → `booking-service`.
- El cliente quiere **landing estática** → `landing-marketing`.
- El cliente quiere **marketplace multi-vendor** (varios sellers en una plataforma) → no aplica MVP-6.

## Endpoints del backend que consume

Todos del backend `opita-market-templates`:

**Públicos (no requieren auth)**:

| Endpoint | Método | Para qué |
|---|---|---|
| `/health` | GET | Healthcheck |
| `/tenants/:tenantId/catalog/products` | GET | Lista productos (público) |
| `/tenants/:tenantId/catalog/products/:id` | GET | Detalle producto |
| `/tenants/:tenantId/catalog/branches` | GET | Selector de sucursal pickup |
| `/tenants/:tenantId/catalog/branches/:id/stock/:variantId` | GET | Stock por variant (live availability) |
| `/tenants/:tenantId/checkout/config` | GET | Currency, TTLs, **Habeas Data textos (es/en/pt)**, policy URL/version, wompiRefundPolicy |

**Cliente autenticado (cookie OCAIS)**:

| Endpoint | Método | Para qué |
|---|---|---|
| `/tenants/:tenantId/cart/reservations` | POST/GET/DELETE | Carrito (Sprint 3) |
| `/tenants/:tenantId/orders/checkout` | POST | Convierte carrito → Order + Wompi transaction (Sprint 4) |
| `/tenants/:tenantId/orders/:id` | GET | Detalle pedido |
| `/tenants/:tenantId/orders` | GET | Lista pedidos del cliente |
| `/tenants/:tenantId/orders/:id/cancel` | POST | Cancelar pedido propio |
| `/tenants/:tenantId/me` | GET | Datos del customer actual |

Ver `INTEGRATION.md` para el flujo completo (cómo cargar el widget de Wompi, cómo renderizar la banner de Habeas Data, etc.).

## Componentes clave a personalizar

| Componente | Upstream | Customización Pasiones |
|---|---|---|
| `Header` | Demo con logo placeholder | Logo Pasiones + nav (Catálogo, Sucursales, Mi Cuenta) |
| `ProductGrid` | Demo grid | Filtrar por categoría del tenant (blusa/pantalón/vestido/accesorio) |
| `ProductCard` | Demo card | Mostrar `branch.pickupEnabled` si aplica |
| `ProductDetail` | Demo con variants | Mostrar **stock disponible** live por branch |
| `CartDrawer` | Demo | Reemplazar store con `POST /cart/reservations` |
| `CheckoutForm` | Demo (sin backend) | Reemplazar con `/orders/checkout` + **Wompi widget iframe** |
| `OrderConfirmation` | Demo | Mostrar `widgetUrl` + redirección al widget |
| `OrderHistory` | Demo | Consumir `/orders` del backend |
| `HabeasDataBanner` | (no existe) | **Nuevo** — render desde `/checkout/config` |

## i18n strategy

`/checkout/config` devuelve `consentTexts.es/en/pt` + `currency` + `wompiRefundPolicy`. El storefront:
1. Lee `accept-language` del navegador → `es-CO` por default.
2. Usa `consentTexts[locale]` para la banner de Ley 1581.
3. Si el cliente cambia el locale manualmente, persiste en cookie `opita_locale`.
4. El header tiene un dropdown para cambiar idioma en tiempo real.

## Wompi integration

El backend devuelve `{ order, wompiTransactionId, widgetUrl }` en `/orders/checkout`. El widget de Wompi se renderiza como iframe:

```html
<iframe
  src="{widgetUrl}"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

El iframe redirige a `redirectUrl` cuando el cliente paga (configurado en el backend como `{PUBLIC_BASE_URL}/tenants/:tenantId/orders/:orderId/result`). Esa página:
1. Llama `/orders/:id` para refrescar status.
2. Si `status=paid` → muestra "Pago exitoso, te avisaremos cuando esté listo".
3. Si `status=cancelled` → muestra "Pago cancelado".
4. Si sigue `pending-payment` → muestra "Procesando..." (polling cada 3s).

El webhook real (Wompi → backend → APPROVED → consume reservations + emit Sale + 2 JournalEntries) sucede server-side; el cliente no necesita hacer nada.

Ver `INTEGRATION.md` para los detalles completos del widget + redirect handling.

## Ley 1581/2012 — Habeas Data

El cart handler captura el consentimiento en cada reserva. El banner de Ley 1581:
1. Aparece antes del primer cart action.
2. Renderiza `consentTexts[currentLocale]` desde `/checkout/config`.
3. El cliente debe hacer click en "Acepto" antes de poder agregar productos.
4. La aceptación se persiste como `Customer.habeasDataConsent.policyVersion`.
5. Si el operador bumpea `consent_text_version`, el cart handler re-captura automáticamente.

No enviar PII al backend hasta que el cliente haya aceptado.

## Cómo personalizar este skill

1. **Branding**: ver [`../docs/brand-customization.md`](../docs/brand-customization.md).
2. **Categorías del tenant**: el backend expone `catalog.categories[]` en `/catalog/products` — filtrar en el cliente.
3. **Multi-branch pickup**: el selector de sucursal debe llamar `/catalog/branches` y persistir la selección en el carrito (campo `branchId` en CartReservation).
4. **Stock badge**: cada ProductCard muestra `available` por branch. Para evitar oversell, revalidar cada 60s en PDP.
5. **Wompi public key** (si se necesita client-side): el backend ya envía `widgetUrl` que incluye la public key. Nunca hardcodear.
6. **Multi-tenant dinámico**: sustituir CSS variables desde `/checkout/config` cuando el operador extienda ese endpoint con `brand.*` tokens (Sprint 7+).

## Pitfalls comunes

- **Cliente agrega sin verificar stock**: validar `branchId` antes de POST /cart/reservations. Backend devuelve 422 si no hay stock.
- **Habeas Data no aceptado**: el cart handler crea Customer sin consentimiento si el operador olvidó configurar `consent_text_es`. El backend debe rechazar checkout si `consentText` es null y `audit_log_enabled=true`.
- **Wompi widget bloqueado por sandbox**: en dev, usar `WompiEnvironment=sandbox` y la public key de sandbox. El widget muestra "Test mode" banner.
- **Re-conectar widget al refrescar**: el `widgetUrl` es de un solo uso. Si el cliente refresca `/orders/:id/result`, NO recrear el widget — solo polling.
- **Cart abandonado**: el sweeper del backend libera stock después de 15 min. El cliente verá "ya no hay stock" al volver.

## Reference

- **Source real (submodule)**: `source/` (Epic-Design-Labs Next.js Ecommerce Starter, open-source)
- **Contexto AI-friendly**: `repomix.txt` (~800KB compressed)
- **Integración detallada**: `INTEGRATION.md`
- **Backend API cookbook**: [`../docs/api-cookbook.md`](../docs/api-cookbook.md)
- **Upstream**: https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter
- **Backend Wompi runbook**: [`../../opita-market-templates/docs/runbooks/mvp6-order-wompi.md`](../../opita-market-templates/docs/runbooks/mvp6-order-wompi.md)
- **Backend Habeas Data runbook**: [`../../opita-market-templates/docs/runbooks/mvp6-refunds-audit.md`](../../opita-market-templates/docs/runbooks/mvp6-refunds-audit.md)
- **Estándar del skill**: https://agentskills.io/home