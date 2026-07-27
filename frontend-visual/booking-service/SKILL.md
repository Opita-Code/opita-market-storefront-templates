---
name: booking-service
description: Services-with-reservation visual base — Next.js 15 + Tailwind v4 + HAAR Salon variant. Calendar picker, service list, staff picker. Use when an AI agent needs to render a salon/spa/consultorio booking flow. SKELETON — full integration with @opita/market-integration ships in Sprint 7+ when the backend adds services + bookings endpoints. NOT for retail (use ecommerce-storefront) or pure admin (use admin-tailadmin).
license: open-source
source_repo: https://github.com/letsopencals/template-haar
integration_target: @opita/market-integration (planned — Sprint 7+)
template_type: visual
status: skeleton
---

# booking-service — Services with Reservations (SKELETON)

Visual base for a salon/spa/consultorio booking flow. The upstream is [HAAR Salon](https://github.com/letsopencals/template-haar) (open-source).

**This template is currently a SKELETON.** The upstream uses the Opencals SDK for bookings, which needs stripping before we can wire it to `@opita/market-integration`. The skeleton ships the visual base; full integration lands in Sprint 7+ when the backend adds `services` + `bookings` + `staff` endpoints.

## When to use

An AI agent should use this template when:
- Building a salon/spa/consultorio booking flow with calendar + service selection + staff picker
- Need a calm, image-heavy aesthetic (vs the dense admin-tailadmin or the catalog-heavy ecommerce-storefront)

An AI agent should **NOT** use this template when:
- The client is retail (clothing, electronics, etc.) → use `ecommerce-storefront`
- The client needs admin/backoffice → use `admin-tailadmin`
- The client needs a static marketing landing → use `landing-marketing`

## What this template contains (skeleton state)

```
booking-service/
├── SKILL.md              ← this file
├── THEME.md              ← (TODO — write brand customization guide)
├── INSTALL.md            ← (TODO — write wire-up guide)
├── source/               ← git submodule (HAAR upstream — DO NOT MODIFY until stripped)
└── repomix.txt           ← compressed source (~365KB)
```

## Pages the upstream renders

| Page | Route | What it does |
|------|-------|--------------|
| Home | `/` | Hero, services overview |
| Services | `/services` | List of services with prices, durations |
| Service detail | `/services/[id]` | Description + "Book now" CTA |
| Booking | `/book` | Date picker + time slot picker + staff picker |
| Confirmation | `/book/confirm` | Booking summary + payment |
| My bookings | `/bookings` | Customer's upcoming + past bookings |
| Staff | `/staff` | (Staff view) Today's bookings |

## What needs to happen before this is "ready"

Sprint 7+ backend work needed:

1. **Strip Opencals SDK**: remove the upstream's `lib/opencals.ts` references, replace with `@opita/market-integration` calls
2. **Add backend endpoints** (Sprint 7+ scope):
   - `services` entity (name, durationMinutes, priceAmount, currency, imageUrl, staffIds[])
   - `bookings` entity (customerId, serviceId, staffId, branchId, startAt, endAt, status FSM)
   - `staff` entity (name, services[], availability windows)
3. **Integration SDK additions**:
   - New types in `integration/src/types/`: `Service`, `Booking`, `Staff`
   - New client methods: `client.services.list()`, `client.bookings.create()`, `client.bookings.listForCustomer()`
   - FSM helpers for booking FSM (pending → confirmed → completed → cancelled/no-show)
4. **Wire-up code** (INSTALL.md):
   - Replace `<BookingWidget />` from Opencals with a custom component using the SDK
   - Calendar grid component
   - Time slot picker (respects staff availability)
   - Confirmation page

Until then, this template renders the upstream's demo content with Opencals stub data.

## Contributing

To help land Sprint 7+ faster:
1. Open an issue with "booking-service: full integration"
2. Tag the sprint planning meeting
3. AI agent picks up the issue + writes a spec for backend + integration
4. Drift_judge evaluates
5. Operator approves
6. Build + test

## License

Upstream HAAR is open-source (per repository LICENSE). Our wrapper is MIT.

## See also

- `THEME.md` (TODO)
- `INSTALL.md` (TODO)
- `../../integration/SKILL.md` — the SDK this template will consume (Sprint 7+)
- `../../docs/choosing-template.md` — when to pick this vs alternatives