# Choosing a Template (3-layer decision tree)

This repo has 3 layers. Each client picks **one visual template** + uses the **integration package** + consumes the **backend reference** (which points to the actual deployed API).

## Step 1 — Which visual template fits the use case?

| Need | Visual template | Source repo |
|------|-----------------|-------------|
| **POS + backoffice** (vendedor, auditor, admin roles) | `frontend-visual/admin-tailadmin` | [TailAdmin](https://github.com/TailAdmin/free-nextjs-admin-dashboard) |
| **B2C tienda online** (carrito, checkout, Wompi, Habeas Data) | `frontend-visual/ecommerce-storefront` | [Next-ecommerce](https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter) |
| **Servicios con reserva** (salon, spa, consultorio) | `frontend-visual/booking-service` (skeleton — Sprint 7+) | [HAAR](https://github.com/letsopencals/template-haar) |
| **Landing estática** (marketing, lead capture) | `frontend-visual/landing-marketing` (skeleton — Sprint 7+) | [ixartz](https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template) |

**For Pasiones** (first client, retail clothing):
- **Primary**: `ecommerce-storefront` (B2C tienda online with Wompi + Habeas Data)
- **POS layer**: `admin-tailadmin` (for the in-store tablet at branch_001)
- **NOT booking-service** (Pasiones is retail, not services)

**For Peluquería XYZ** (hypothetical second client, salon):
- **Primary**: `booking-service` (services with reservation)
- **Admin**: `admin-tailadmin` (backoffice for staff)
- **NOT ecommerce-storefront** (no online shop yet)

**For a SaaS B2B** (hypothetical third client):
- **Primary**: `admin-tailadmin` (full dashboard)
- **Marketing**: `landing-marketing` (lead capture)
- **NOT ecommerce-storefront` (different model)

## Step 2 — How does the visual layer talk to the backend?

**Always via `integration/`.** Never directly.

```
frontend-visual/<x>/
        │ imports
        ▼
integration/  (@opita/market-integration)
        │ HTTP over
        ▼
backend/  (contract reference)
        │ mapped to
        ▼
opita-market-templates (the actual deployed API)
```

The visual layer imports `createClient`, `canRefund`, `formatCurrency`, `getHabeasDataBanner`, etc. from the integration package. It never sees HTTP. It never sees backend URLs.

```tsx
// In ecommerce-storefront/pages/checkout.tsx
import { createClient, formatCurrency, getHabeasDataBanner, t, setLocale } from '@opita/market-integration'
import { useEffect, useState } from 'react'

const client = createClient({ baseUrl: process.env.OPITA_API_URL!, tenantId: process.env.OPITA_TENANT_ID! as any })

export default function CheckoutPage() {
  const [config, setConfig] = useState(null)
  useEffect(() => {
    setLocale('es-CO')
    client.checkout.getConfig().then((r) => r.ok && setConfig(r.value))
  }, [])
  if (!config) return null

  const banner = getHabeasDataBanner(config.consentTexts, 'es-CO')
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: banner.html }} />
      <button>{t('checkout.acceptAndPay')}</button>
    </div>
  )
}
```

## Step 3 — Which backend reference do you read?

Read `backend/api-spec.json` for the OpenAPI contract. Cross-reference with `backend/examples/` for curl invocations. For permission/role details, read `backend/docs/auth.md`.

You almost never need to read `backend/api-spec.json` in full — the integration types in `integration/src/types/` mirror it. If you need to add a new endpoint, update both.

## Scoring matrix (visual template selection)

| Criterion | admin-tailadmin | ecommerce-storefront | booking-service | landing-marketing |
|-----------|----------------|---------------------|-----------------|-------------------|
| POS-friendly layout | ★★★★★ | ★ | ★ | ★ |
| B2C storefront | ★★ | ★★★★★ | ★★ | ★★★ |
| Services / appointments | ★★ | ★ | ★★★★★ | ★★ |
| Marketing landing | ★ | ★★ | ★ | ★★★★★ |
| Multi-language (es/en/pt) | ★★★★ | ★★★ | ★★★★ | ★★★ |
| WCAG a11y baseline | ★★★★ | ★★★★ | ★★★ | ★★★ |
| Customization flexibility | ★★★★ | ★★★★★ | ★★★ | ★★★★★ |
| Maintenance burden (lower=better) | ★★★ | ★★★ | ★★★★ | ★★ |

## Multi-tenant deployment strategy

When you onboard a new client (e.g. Peluquería XYZ):
1. Deploy a new SST stack: `sst deploy --stage peluqueria-xyz-prod`
2. Same backend code, different tenant config (`tenants/peluqueria-xyz/tenant.yml`)
3. New frontend repo: `git clone frontend-visual/booking-service/ → peluqueria-xyz-storefront/`
4. Configure: `OPITA_TENANT_ID=peluqueria-xyz`
5. Custom branding via `frontend-visual/booking-service/theme-overrides/peluqueria-xyz/`

Each client gets its own deployment, but shares the same integration package + backend reference.

## Cost estimates (rough)

| Layer | Human time | Integration time | Deploy |
|-------|-----------|------------------|--------|
| Visual template clone | 4-8 hours | 4-8 hours | 1 hour |
| Branding customization | 8-16 hours | 4-8 hours | 1 hour |
| Integration wiring | 16-24 hours | 8-16 hours | 2 hours |
| **Total per client** | **28-48h** | **16-32h** | **4h** |

Compare to: building from scratch → 200-400 hours + ongoing maintenance.

## What if no visual template fits?

If the use case doesn't match any of the 4 templates (e.g. food delivery, marketplace, B2B SaaS):

1. Add a new visual template: `bash scripts/new-template.sh visual food-delivery https://github.com/user/repo.git`
2. Write a SKILL.md focused on what it does visually (pages, palette, props)
3. Update this decision tree

Don't modify an existing template — the strength of this monorepo is that each template is independent.