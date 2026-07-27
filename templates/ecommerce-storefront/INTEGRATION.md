# ecommerce-storefront — INTEGRATION.md

> Cómo conectar la plantilla **Epic-Design-Labs Next.js Ecommerce Starter** (submodule `source/`) al backend `opita-market-templates` con Wompi widget + Habeas Data + multi-idioma.

**Audiencia**: desarrollador que va a personalizar la tienda para un tenant (Pasiones o futuro cliente B2C).

**Asume**: backend `opita-market-templates` v0.1.0+ desplegado; OCAIS IdP emite cookies firmadas; Wompi keys en AWS Secrets Manager (configuradas en el backend).

---

## 1. Requisitos previos

```bash
git clone --recursive https://github.com/Opita-Code/opita-market-storefront-templates.git
cd opita-market-storefront-templates/templates/ecommerce-storefront/source

npm install   # o pnpm install / bun install
```

Variables de entorno:

```bash
# .env.local (NO commitear)
NEXT_PUBLIC_API_BASE_URL=https://api.opitacode.com
NEXT_PUBLIC_TENANT_ID=pasiones
NEXT_PUBLIC_OCAIS_COOKIE_NAME=opita_session
NEXT_PUBLIC_DEFAULT_LOCALE=es-CO
NEXT_PUBLIC_CURRENCY=COP
# Wompi NO se necesita client-side; el backend lo inyecta en el widgetUrl
```

---

## 2. Auth — OCAIS cookie integration

Igual que `admin-tailadmin/INTEGRATION.md` §2 — crear `middleware.ts`, página `/login` con redirect a OCAIS, `/api/auth/callback`.

Diferencia: este storefront usa el rol `cliente` (no `vendedor`/`administrador`). El Membership del tenant debe tener `cliente` con permisos `product.read`, `variant.read`, `stock.read`, `cart.*`, `order.read`, `order.create`, `order.cancel`.

```ts
// src/middleware.ts (mismo patrón que admin-tailadmin)
const OCAIS_COOKIE = "opita_session";
const PUBLIC_PATHS = [
  "/",
  "/productos",
  "/productos/**",
  "/sucursales",
  "/checkout/config",
  "/login",
  "/api/auth/callback",
];
```

---

## 3. Carga del config público (Habeas Data + currency + TTLs)

Al montar la app, llamar `/checkout/config` una sola vez y cachear en React Context.

```tsx
// src/lib/checkout-config.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface CheckoutConfig {
  currency: string;
  reservationTtlMinutes: number;
  checkoutTtlMinutes: number;
  habeasDataPolicyUrl: string | null;
  habeasDataPolicyVersion: string | null;
  consentTexts: {
    es: string;
    en?: string;
    pt?: string;
    version: string;
  } | null;
  wompiRefundPolicy: "external" | "automatic";
}

const Ctx = createContext<CheckoutConfig | null>(null);

export function CheckoutConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  useEffect(() => {
    const tenant = process.env.NEXT_PUBLIC_TENANT_ID!;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
    fetch(`${base}/tenants/${tenant}/checkout/config`)
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);
  return <Ctx.Provider value={config}>{children}</Ctx.Provider>;
}

export function useCheckoutConfig() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCheckoutConfig outside provider");
  return c;
}
```

Wrap en `app/layout.tsx`:

```tsx
import { CheckoutConfigProvider } from "@/lib/checkout-config";

export default function RootLayout({ children }) {
  return (
    <html lang="es-CO">
      <body>
        <CheckoutConfigProvider>{children}</CheckoutConfigProvider>
      </body>
    </html>
  );
}
```

---

## 4. Banner de Habeas Data (Ley 1581/2012)

Componente que aparece antes del primer cart action si el cliente no ha aceptado.

```tsx
// src/components/HabeasDataBanner.tsx
"use client";
import { useCheckoutConfig } from "@/lib/checkout-config";
import { useEffect, useState } from "react";

export function HabeasDataBanner({ onAccept }: { onAccept: () => void }) {
  const { consentTexts, habeasDataPolicyVersion, habeasDataPolicyUrl } = useCheckoutConfig();
  const [locale, setLocale] = useState<"es" | "en" | "pt">("es");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setAccepted(localStorage.getItem(`opita_consent_${process.env.NEXT_PUBLIC_TENANT_ID}`) === habeasDataPolicyVersion);
  }, [habeasDataPolicyVersion]);

  if (accepted || !consentTexts) return null;

  const text = consentTexts[locale] ?? consentTexts.es;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex gap-2">
          {(["es", "en", "pt"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={locale === l ? "rounded bg-brand-500 px-3 py-1 text-white" : "rounded bg-gray-100 px-3 py-1"}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="mb-6 whitespace-pre-line text-sm">{text}</p>
        {habeasDataPolicyUrl && (
          <a
            href={habeasDataPolicyUrl}
            target="_blank"
            rel="noopener"
            className="mb-4 block text-xs text-brand-500 underline"
          >
            Ver política completa
          </a>
        )}
        <button
          onClick={() => {
            localStorage.setItem(
              `opita_consent_${process.env.NEXT_PUBLIC_TENANT_ID}`,
              habeasDataPolicyVersion ?? "",
            );
            setAccepted(true);
            onAccept();
          }}
          className="w-full rounded bg-brand-500 py-3 font-semibold text-white"
        >
          Acepto
        </button>
      </div>
    </div>
  );
}
```

El cart handler del backend captura el consentimiento real en `Customer.habeasDataConsent` cuando se crea la primera reserva. El frontend solo muestra el banner; el backend persiste la verdad legal.

---

## 5. Cart — POST /cart/reservations

Reemplazar el cart store del repo upstream con:

```ts
// src/lib/cart.ts
import { apiFetch, ApiError } from "./api";

export interface CartItem {
  variantId: string;
  quantity: number;
  branchId: string;
  expectedStockVersion: number;
}

export async function addToCart(item: CartItem) {
  try {
    const reservation = await apiFetch<{
      id: string;
      variantId: string;
      quantity: number;
      expiresAt: string;
    }>("/cart/reservations", {
      method: "POST",
      body: JSON.stringify(item),
    });
    return { ok: true as const, reservation };
  } catch (e) {
    if (e instanceof ApiError) {
      switch (e.code) {
        case "insufficient_stock":
          return { ok: false as const, error: "stock" as const, message: e.message };
        case "variant_not_found":
          return { ok: false as const, error: "variant" as const, message: e.message };
        default:
          return { ok: false as const, error: "unknown" as const, message: e.message };
      }
    }
    throw e;
  }
}

export async function listCart() {
  return apiFetch<{ items: any[]; nextCursor: string | null }>("/cart/reservations?status=active");
}

export async function removeFromCart(reservationId: string) {
  return apiFetch(`/cart/reservations/${reservationId}`, { method: "DELETE" });
}
```

UX considerations:
- **Antes del primer POST**, verificar `localStorage.getItem(opita_consent_...)` === policyVersion. Si no, mostrar `HabeasDataBanner` y esperar aceptación.
- **Optimistic UI**: agregar al carrito inmediatamente, hacer POST, si falla revertir.
- **TTL visible**: mostrar "Tu reserva expira en 14:32" (cuenta regresiva del `expiresAt`).
- **Insufficient stock**: toast "Ya no hay stock suficiente" + re-fetch variant.

---

## 6. Checkout — Wompi widget iframe

```ts
// src/lib/checkout.ts
import { apiFetch } from "./api";

export async function checkout(branchId: string): Promise<{
  order: { id: string; total: { amount: number; currency: string } };
  wompiTransactionId: string;
  widgetUrl: string;
  expiresAt: string;
}> {
  return apiFetch("/orders/checkout", {
    method: "POST",
    body: JSON.stringify({ branchId }),
  });
}
```

```tsx
// src/app/checkout/page.tsx
"use client";
import { useEffect, useState } from "react";
import { checkout } from "@/lib/checkout";

export default function CheckoutPage() {
  const [widget, setWidget] = useState<{ url: string; txId: string; orderId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const branchId = localStorage.getItem("opita_pickup_branch");
    if (!branchId) {
      setError("Selecciona una sucursal de pickup primero");
      return;
    }
    checkout(branchId)
      .then((r) => setWidget({ url: r.widgetUrl, txId: r.wompiTransactionId, orderId: r.order.id }))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!widget) return <div className="p-8">Procesando checkout...</div>;

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Pago con Wompi</h1>
      <iframe
        src={widget.url}
        width="100%"
        height={650}
        frameBorder={0}
        title={`Pago Wompi — transacción ${widget.txId}`}
        className="rounded border"
      />
      <p className="mt-2 text-xs text-gray-500">
        Powered by Wompi — transacción {widget.txId} para orden {widget.orderId}
      </p>
    </main>
  );
}
```

---

## 7. Order result page (redirect from Wompi)

Wompi redirige a `{PUBLIC_BASE_URL}/tenants/:tenantId/orders/:orderId/result`. Esa página polling el backend:

```tsx
// src/app/[tenantId]/orders/[orderId]/result/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function OrderResultPage() {
  const { tenantId, orderId } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<string>("pending-payment");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (status !== "pending-payment") return;
    const id = setTimeout(async () => {
      try {
        const order = await apiFetch<{ status: string }>(`/orders/${orderId}`);
        setStatus(order.status);
        if (order.status === "paid") {
          // Éxito — redirigir a /orders/:id después de 2s
          setTimeout(() => router.push(`/${tenantId}/orders/${orderId}`), 2000);
        }
      } catch (e) {
        // retry silencioso
      }
      setAttempts((a) => a + 1);
    }, 3000);
    return () => clearTimeout(id);
  }, [status, attempts, orderId, tenantId, router]);

  if (status === "paid") return <Success orderId={orderId as string} />;
  if (status === "cancelled") return <Cancelled />;
  if (attempts > 20) return <Timeout />;
  return <Pending attempts={attempts} />;
}
```

---

## 8. Customización de Tailwind (tokens)

Ver [`../docs/brand-customization.md`](../docs/brand-customization.md). Mínimo:

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef3f2",
          500: "#ef4444",   // primary
          600: "#dc2626",
          900: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
};
```

---

## 9. Deploy

### Vercel (recomendado para storefront)

```bash
vercel --prod
```

Configurar env vars en Vercel dashboard.

### Cloudflare Pages (alternativa gratuita)

```bash
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static
```

### SEO considerations

- Cada PDP debe tener `<title>` + `<meta description>` + `<meta property="og:*">`.
- Usar `generateMetadata` de Next.js para SEO dinámico.
- Structured data (JSON-LD): `Product`, `BreadcrumbList`, `Organization`.
- Sitemap auto-generado con `app/sitemap.ts`.
- `robots.txt` en `app/robots.ts`.

---

## 10. Verificación end-to-end

```bash
npm run dev
# → http://localhost:3000

# 1. Navegar sin cookie — debe mostrar catálogo público
curl http://localhost:3000

# 2. Login (sandbox) → cookie OCAIS

# 3. Agregar producto al carrito
#    POST /api/cart → 201 + reservation con expiresAt

# 4. Checkout
#    POST /api/checkout → 201 + {order, widgetUrl, wompiTransactionId}

# 5. Pagar en Wompi sandbox
#    → Wompi redirige a /orders/:id/result
#    → polling → status=paid → redirige a /orders/:id

# 6. Verificar auditoría
#    GET /admin/audit?action=cart.checkout.create
#    → debe aparecer el evento con actorEmail del cliente
```

---

## 11. Limitaciones conocidas (Sprint 6 baseline)

- **Sin cart merge**: si el cliente agrega el mismo producto 2 veces, son 2 reservas separadas (Sprint 7+).
- **Sin recomendaciones**: sin ML / "otros clientes también compraron" (Sprint 7+ con Atlas o servicio externo).
- **Sin wishlist / favoritos**: Sprint 7+.
- **Sin cupones / descuentos complejos**: el backend soporta `discount` per SaleLine pero no cupones por código.
- **Single-branch per cart**: el cart no soporta múltiples sucursales en una sola orden (Sprint 7+ multi-branch).

---

## Reference

- [`../docs/api-cookbook.md`](../docs/api-cookbook.md) — todos los endpoints con request/response examples
- [`../docs/brand-customization.md`](../docs/brand-customization.md) — theming detallado
- [`../docs/agent-skills.md`](../docs/agent-skills.md) — cómo los AI agents descubren este INTEGRATION.md
- `repomix.txt` — código fuente completo comprimido para AI context
- `source/` — git submodule del repo Epic-Design-Labs upstream
- Backend Wompi runbook: [`../../opita-market-templates/docs/runbooks/mvp6-order-wompi.md`](../../opita-market-templates/docs/runbooks/mvp6-order-wompi.md)
- Backend Habeas Data: [`../../opita-market-templates/docs/runbooks/mvp6-refunds-audit.md`](../../opita-market-templates/docs/runbooks/mvp6-refunds-audit.md)