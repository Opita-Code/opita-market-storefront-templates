---
name: booking-service
description: |
  Booking storefront for service businesses (salon, spa, consultorio) based on
  HAAR Salon Next.js template (open-source, Opencals SDK).

  Use when: building a customer-facing service booking site with calendar
  availability, staff scheduling, service catalog, booking confirmation,
  optional payments.

  Don't use for: ecommerce product sales (use ecommerce-storefront), POS
  terminal (use admin-tailadmin), marketing landing pages (use landing-marketing).

  Stack: Next.js 15 + Tailwind CSS v4 + TypeScript + Opencals SDK
  License: open-source (permissive)
  Source: https://github.com/letsopencals/template-haar
  Integration target: opita-market-templates Sprint 7+ (services vertical)
---

# booking-service — HAAR Salon Next.js variant for opita-market-templates

## ⚠️ Status: Sprint 2 (pending)

This template's SKILL.md is a **scaffold**. The HAAR Salon upstream uses the
**Opencals SDK** for bookings, which is a different backend than our
`opita-market-templates`. To use this template, you must:

1. Strip the Opencals SDK calls (`@opencals/storefront`).
2. Replace with direct calls to `opita-market-templates` (which requires a
   Sprint 7+ "services-with-bookings" vertical — not yet built).
3. Re-run `scripts/repack.sh` to refresh `repomix.txt`.

## Cuándo activar este skill (cuando esté completo)

Activa cuando el operador necesita:
- **Reserva de servicios** con calendario (haircut, masaje, consulta médica).
- **Catálogo de servicios** con duración, precio, staff asignado.
- **Disponibilidad por staff** (sábado solo stylist X, etc.).
- **Confirmación + recordatorio** de booking.

Stack técnico:
- Next.js 15 + App Router
- Tailwind CSS v4
- TypeScript
- Opencals SDK (a remover cuando integremos con opita-market)

## NO usar este skill cuando:

- El cliente vende **productos físicos** → `ecommerce-storefront`.
- El cliente necesita **POS / inventario** → `admin-tailadmin`.
- El cliente quiere **landing estática** → `landing-marketing`.

## Próximos pasos para activar este skill

1. **Backend**: añadir vertical `services-with-bookings` en
   `opita-market-templates/templates/`. Endpoints target:
   - `GET /tenants/:id/services` (lista servicios)
   - `GET /tenants/:id/services/:id/availability?date=YYYY-MM-DD` (slots libres)
   - `POST /tenants/:id/bookings` (crear reserva)
   - `GET /tenants/:id/bookings/:id` (detalle)
   - `POST /tenants/:id/bookings/:id/cancel` (cancelar)
   - `POST /webhooks/services/payment` (cobro si aplica)

2. **Frontend**: reemplazar `Opencals SDK` calls con `apiFetch` a los endpoints
   arriba. Mantener la UI de HAAR (servicios list, calendar picker, confirmation).

3. **Actualizar SKILL.md**: cambiar `Integration target: Sprint 7+` a `Sprint 7+
   ✅ shipped` cuando el backend vertical esté listo.

## Reference

- Upstream: https://github.com/letsopencals/template-haar
- HAAR demo: https://template-haar.opencals.com (preview)
- Standard: https://agentskills.io/home