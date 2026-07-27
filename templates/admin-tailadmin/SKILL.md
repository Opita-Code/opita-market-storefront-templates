---
name: admin-tailadmin
description: |
  POS tablet + admin panel dashboard based on TailAdmin Next.js (MIT, 2.5k stars).
  Use when: building admin UI, POS terminal, dashboards with charts/tables,
  or any backoffice tool that needs auth pages, RBAC, and dark mode.

  Don't use for: B2C storefront (use ecommerce-storefront), booking flows
  (use booking-service), marketing landing pages (use landing-marketing).

  Stack: Next.js 15 + Tailwind CSS + TypeScript + ApexCharts + jsvectormap
  License: MIT © 2023 TailAdmin
  Source: https://github.com/TailAdmin/free-nextjs-admin-dashboard
  Integration target: opita-market-templates v0.1.0+ (Sprint 5+ endpoints)
---

# admin-tailadmin — TailAdmin Next.js variant for opita-market-templates

## Cuándo activar este skill

Activa cuando el operador necesita:
- **POS terminal** (vendedor escanea productos, suma, cobra, emite refund).
- **Admin panel** (catálogo, stock, sucursales, auditoría, compliance, reportes).
- **Dashboard con charts** (ventas por día, top productos, alertas de stock bajo).
- **Páginas de auth** (login, register, forgot password, 2FA-ready).

Stack técnico (lo que el agente debe asumir):
- Next.js 15 + App Router
- Tailwind CSS v4
- TypeScript
- ApexCharts (gráficos)
- jsvectormap (mapas)
- Zustand o React Context (state — confirmar con `repomix.txt`)
- Auth UI pages (login/register/forgot) — **necesita integración con OCAIS**

## NO usar este skill cuando:

- El cliente quiere una **tienda online B2C** → `ecommerce-storefront`.
- El cliente quiere **reservas / calendario** → `booking-service`.
- El cliente quiere una **landing de marketing** → `landing-marketing`.
- El cliente quiere **React Native / Expo** → no aplica (TailAdmin es web).

## Endpoints del backend que consume

Todos del backend `opita-market-templates` (Sprint 5 + 6):

| Endpoint | Método | Para qué |
|---|---|---|
| `/tenants/:tenantId/admin/audit` | GET | Pantalla de auditoría con filtros |
| `/tenants/:tenantId/admin/reports/daily?date=...` | GET | Dashboard ventas del día |
| `/tenants/:tenantId/admin/customers/:customerId/habeas-data` | GET | Compliance officer |
| `/tenants/:tenantId/admin/products` | GET/POST/PUT | CRUD productos |
| `/tenants/:tenantId/admin/products/:id/variants` | GET/POST/PUT | CRUD variantes |
| `/tenants/:tenantId/admin/branches` | GET/POST | CRUD sucursales |
| `/tenants/:tenantId/admin/stock` | GET | Stock por branch/variant |
| `/tenants/:tenantId/admin/stock/adjust` | POST | Ajustes manuales de stock |
| `/tenants/:tenantId/admin/stock/transfer` | POST | Transferencias inter-sucursal |
| `/tenants/:tenantId/pos/sales` | POST/GET | Apertura + lista ventas |
| `/tenants/:tenantId/pos/sales/:saleId/lines/scan` | POST | Scanner barcode (POS) |
| `/tenants/:tenantId/pos/sales/:saleId/complete` | POST | Cobrar + emitir JournalEntries |
| `/tenants/:tenantId/pos/sales/:saleId/refund` | POST | Refund POS (Sprint 6) |
| `/tenants/:tenantId/pos/sales/:saleId` | GET | Detalle venta |
| `/tenants/:tenantId/orders` | GET | Lista órdenes online |
| `/tenants/:tenantId/orders/:orderId/refund` | POST | Refund orden online (admin only) |
| `/tenants/:tenantId/orders/:orderId/ready-for-pickup` | POST | Marcar listo para recoger |
| `/tenants/:tenantId/orders/:orderId/complete` | POST | Marcar recogido (POS pickupCode) |

Permisos relevantes (`tenant.yml → roles`):
- `administrador`: `*` (todo)
- `vendedor`: `branch.read`, `product.read`, `variant.read`, `stock.read`, `sale.create`, `sale.update`, `sale.read`, `sale.refund`, `order.update`, `customer.read` — acotado por `branchIds` claim
- `auditor`: `audit.read`, `report.read`, `journal.read`, `customer.read`, lectura pasiva

Ver `INTEGRATION.md` para el detalle de wiring.

## Cómo personalizar este skill

1. **Branding**: ver [`../docs/brand-customization.md`](../docs/brand-customization.md) — tokens Tailwind, logos, dark/light mode.
2. **Nuevas páginas admin**: extender `src/app/admin/` con carpetas por dominio. Reutilizar `Sidebar`, `Header`, `Table`, `Card` primitives de TailAdmin.
3. **Permisos por rol**: el backend ya enforça permisos (`*` vs listas). El frontend debe **ocultar botones** según `ctx.permissions` del auth context (nunca confiar solo en ocultar; el backend rechaza).
4. **Multi-tenant**: leer `tenantId` del URL `/tenants/:tenantId/admin/...` y propagarlo en cada fetch.
5. **Branding tokens multi-tenant** (Sprint 7+): sustituir `tailwind.config.ts` por una función que lee `GET /tenants/:tenantId/checkout/config` y aplica CSS variables.

## Pitfalls comunes

- **Confundir el rol en el cliente**: vendedor solo ve su branch. La pantalla "lista de sucursales" debe filtrarse por `ctx.branchIds`.
- **Stock display sin optimistic UI**: el dashboard debe usar `revalidate` cada 30s mínimo; stock stale = oversell.
- **Charts sin datos**: mostrar empty state ("Aún no hay ventas hoy") en lugar de ApexCharts vacío.
- **POS en tablets lentas**: deshabilitar animaciones Tailwind (TailAdmin las trae por defecto; añadir `prefers-reduced-motion: reduce`).
- **Refunds sin warning**: el botón de refund debe mostrar modal de confirmación con el monto (Sprint 6 `parseRefundRequest`).

## Reference

- **Source real (submodule)**: `source/` (TailAdmin Next.js, MIT)
- **Contexto AI-friendly**: `repomix.txt` (~600KB compressed)
- **Integración detallada**: `INTEGRATION.md`
- **Backend API cookbook**: [`../docs/api-cookbook.md`](../docs/api-cookbook.md)
- **TailAdmin upstream**: https://github.com/TailAdmin/free-nextjs-admin-dashboard
- **Estándar del skill**: https://agentskills.io/home