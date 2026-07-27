# Choosing a template — decision matrix

> "¿Qué plantilla uso para mi cliente X?" Esta guía es la respuesta.

## TL;DR

| Cliente quiere… | Plantilla | Sprint status |
|---|---|---|
| Tienda online B2C con pickup + pago | **`ecommerce-storefront`** | ✅ Sprint 1 |
| POS terminal + backoffice admin | **`admin-tailadmin`** | ✅ Sprint 1 |
| Servicios con reserva | `booking-service` | 🟡 Sprint 2 |
| Landing de marketing / anuncio | `landing-marketing` | 🟡 Sprint 2 |

## Decision tree

```
¿El cliente tiene inventario físico que vender?
├── Sí → ¿necesita checkout online con pago?
│   ├── Sí → ecommerce-storefront ✅
│   └── No → admin-tailadmin ✅ (POS-only, sin B2C)
└── No → ¿El cliente vende tiempo / servicios?
    ├── Sí → booking-service 🟡
    └── No → ¿El cliente quiere anunciar?
        ├── Sí → landing-marketing 🟡 + link a storefront o app
        └── No → Caso edge (consultar)
```

## Per-template scoring matrix

Cuando hay duda entre 2 plantillas, evaluar cada dimensión 1-5 (5 = mejor):

| Dimensión | admin-tailadmin | ecommerce-storefront | booking-service | landing-marketing |
|---|---|---|---|---|
| **License** | MIT (5) | open-source (4) | open-source (4) | MIT (5) |
| **Maintenance activity** | 5 (TailAdmin activo) | 4 | 4 | 3 |
| **Documentation quality** | 5 | 4 | 3 | 4 |
| **Customization ease** | 5 (Tailwind + componentes claros) | 5 (shadcn/ui copy-paste) | 3 (Opencals SDK acoplado) | 5 (starter minimal) |
| **Integration time vs backend** | ~1 día | ~1-2 días | TBD (Sprint 7+) | ~1 día (no backend) |
| **i18n ready** | Sí (es/en/pt con copy) | Sí (es/en/pt con copy) | Sí | Sí (copy only) |
| **POS support** | ✅ nativo | ❌ | ❌ | ❌ |
| **B2C checkout (Wompi)** | ❌ | ✅ nativo | ❌ | ❌ |
| **Booking/calendar** | ❌ | ❌ | ✅ nativo (Opencals) | ❌ |
| **Static-only** | ❌ | ❌ | ❌ | ✅ nativo |
| **Mobile responsive** | ✅ | ✅ | ✅ | ✅ |
| **SEO optimized** | ⚠️ admin no necesita | ✅ (Next.js metadata) | ✅ | ✅ |

## Casos típicos

### Caso A: "Pasiones" (e-commerce + storage)

- Tienda online B2C con pickup → **`ecommerce-storefront`** ✅
- POS tablet para vendedores → **`admin-tailadmin`** ✅
- Backoffice admin (auditor, admin) → **`admin-tailadmin`** ✅
- Marketing landing para SEO → **`landing-marketing`** 🟡 (opcional Sprint 2)

**Setup time**: 2-3 días combinando ambos templates.

### Caso B: "Peluquería XYZ" (servicios con reserva)

- Web de reservas con calendario → **`booking-service`** 🟡
- Admin para gestionar staff/servicios → **`admin-tailadmin`** (adaptar para bookings)
- Marketing → **`landing-marketing`** 🟡

**Setup time**: bloqueado hasta Sprint 7+ vertical services-with-bookings.

### Caso C: "SaaS B2B con landing + app"

- Landing para captar leads → **`landing-marketing`** 🟡
- App autenticada → custom (no aplica ninguna plantilla)

## Costo total estimado (desarrollo + deploy)

| Plantilla | Customization | Integration | Deploy | Total |
|---|---|---|---|---|
| admin-tailadmin | 4h | 4h (OCAIS + API wrapper) | 2h | **~10h = 1.5 días** |
| ecommerce-storefront | 8h (Habeas Data + i18n) | 8h (Wompi + cart + checkout) | 2h | **~18h = 2-3 días** |
| booking-service | 8h (strip Opencals SDK) | 8h (custom backend) | 2h | **~18h** (cuando backend listo) |
| landing-marketing | 4h | 1h (sin backend) | 2h | **~7h = 1 día** |

## Multi-tenant strategy

Si un mismo operador maneja 5 clientes del mismo vertical (e.g., 5 tiendas online):

**Opción A**: Un deploy por tenant
- `pasiones.opitacode.com` → ecommerce-storefront deploy #1
- `otracliente.opitacode.com` → ecommerce-storefront deploy #2
- Costo: 5 deploys en Vercel (~ $5/mes cada uno para tier hobby).

**Opción B**: Un solo deploy multi-tenant
- `opitacode.com/[tenantId]/...` → un solo deploy lee el tenantId del URL.
- El branding tokens se aplica desde `/checkout/config` + `GET /tenants/:id/branding`.
- Costo: 1 deploy.
- Sprint 7+ — requiere `opita-market-templates` multi-tenant dinámico.

**Opción C**: Un deploy por vertical, multi-tenant dentro
- ecommerce-storefront serving todos los e-commerce tenants.
- admin-tailadmin serving todos los backoffice tenants.
- Misma instancia Next.js, distinto tenantId en el URL.
- **Recomendado** para operadores con > 3 clientes.

## Customization mínima viable

Para un demo rápido (1-2 días):

1. **Branding** (logo + colores) — ver `brand-customization.md`
2. **Homepage copy** — 3-4 secciones en español
3. **Login OCAIS** — copy-paste de `admin-tailadmin/INTEGRATION.md §2`
4. **Habeas Data banner** — copy-paste de `ecommerce-storefront/INTEGRATION.md §4`
5. **Deploy Vercel** — `vercel --prod`

## Próximas plantillas a considerar (Sprint 3+)

| Plantilla potencial | Vertical | Prioridad |
|---|---|---|
| **Marketplace multi-vendor** | Marketplace (varios sellers) | 🟡 Sprint 7+ |
| **Food delivery** | Restaurantes con delivery + tracking | 🟡 Sprint 8+ |
| **SaaS dashboard** | B2B SaaS con billing + Stripe | 🟡 Sprint 8+ |
| **POS-native (tablet)** | App nativa iPad/Android (no web) | 🔵 Sprint 9+ (React Native) |
| **Mobile PWA** | PWA instalable para clientes | 🔵 Sprint 9+ |

## Reference

- Standard: https://agentskills.io/home
- Catálogo completo: [`../SKILL.md`](../SKILL.md)
- API cookbook: [`api-cookbook.md`](api-cookbook.md)
- Brand tokens: [`brand-customization.md`](brand-customization.md)