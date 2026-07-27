# admin-tailadmin — INTEGRATION.md

> Cómo conectar la plantilla **TailAdmin Next.js** (submodule `source/`) al backend `opita-market-templates`.

**Audiencia**: desarrollador que va a personalizar TailAdmin para un tenant específico (Pasiones, o cualquier futuro cliente admin/POS).

**Asume**: backend `opita-market-templates` v0.1.0+ desplegado (Sprint 6+) en Lambda; OCAIS IdP emite cookies firmadas que el backend acepta.

---

## 1. Requisitos previos

```bash
# Clonar el repo de templates con submodules
git clone --recursive https://github.com/Opita-Code/opita-market-storefront-templates.git
cd opita-market-storefront-templates/templates/admin-tailadmin/source

# Instalar dependencias de TailAdmin
npm install
# o pnpm install / bun install (TailAdmin trae package-lock.json)
```

Variables de entorno que necesita TailAdmin para hablar con el backend:

```bash
# .env.local (NO commitear)
NEXT_PUBLIC_API_BASE_URL=https://api.opitacode.com      # o https://api.example.com para staging
NEXT_PUBLIC_TENANT_ID=pasiones                          # el tenant para el que estamos configurando
NEXT_PUBLIC_OCAIS_COOKIE_NAME=opita_session             # nombre de la cookie OCAIS
NEXT_PUBLIC_DEFAULT_LOCALE=es-CO
NEXT_PUBLIC_CURRENCY=COP
```

---

## 2. Auth — OCAIS cookie integration

TailAdmin trae páginas de auth demo (`/login`, `/register`, `/forgot-password`) que NO vamos a usar — el IdP OCAIS emite la cookie al login. Configurar el middleware de Next.js para validar la cookie y redirigir al `opita-session` si falta.

### 2.1 Crear `src/middleware.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

const OCAIS_COOKIE = process.env.NEXT_PUBLIC_OCAIS_COOKIE_NAME ?? "opita_session";
const PUBLIC_PATHS = ["/login", "/api/auth/callback"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const session = req.cookies.get(OCAIS_COOKIE);

  // 1. Rutas públicas: siempre pasan
  if (isPublic) return NextResponse.next();

  // 2. Sin cookie: redirigir al login OCAIS
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Con cookie: validar contra el backend (opcional pero recomendado)
  //    El backend ya enforça permisos en cada endpoint; el frontend solo oculta UI.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pos/:path*", "/((?!_next|api/health).*)"],
};
```

### 2.2 Página `/login` — botón "Iniciar sesión con opita cuentas"

```tsx
"use client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const returnTo = new URLSearchParams(window.location.search).get("returnTo") ?? "/admin";
  const ocaisAuthUrl = `https://api.opitacode.com/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-body">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">Pasiones — Backoffice</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Inicia sesión con tu cuenta de opita cuentas.
        </p>
        <Button asChild>
          <a href={ocaisAuthUrl}>Iniciar sesión con opita cuentas</a>
        </Button>
      </div>
    </main>
  );
}
```

### 2.3 Callback `/api/auth/callback`

OCAIS redirige aquí después de login exitoso, con la cookie ya puesta. Esta ruta solo redirige al `returnTo`.

```ts
// src/app/api/auth/callback/route.ts
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/admin";
  redirect(returnTo);
}
```

---

## 3. Cliente HTTP — fetch wrapper con tenant + cookie

```ts
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID!;

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}/tenants/${TENANT}${path}`;
  const res = await fetch(url, {
    ...init,
    credentials: "include", // envía cookies OCAIS
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = body.error ?? {};
    throw new ApiError(res.status, err.code ?? "unknown", err.message ?? res.statusText);
  }
  return res.json();
}

// Helpers tipados
import type {
  AuditLog,
  DailyReport,
  Sale,
  Order,
  Product,
  Variant,
  Branch,
  Stock,
} from "@opita-market/core"; // idealmente compartido como types-only package

export const api = {
  audit: {
    list: (filters: { actorEmail?: string; action?: string; limit?: number }) =>
      apiFetch<{ items: AuditLog[]; nextCursor: string | null }>(`/admin/audit?${new URLSearchParams(filters)}`),
  },
  reports: {
    daily: (date: string) => apiFetch<DailyReport>(`/admin/reports/daily?date=${date}`),
  },
  pos: {
    openSale: (branchId: string, paymentMethod: string) =>
      apiFetch<Sale>(`/pos/sales`, {
        method: "POST",
        body: JSON.stringify({ branchId, paymentMethod }),
      }),
    scan: (saleId: string, body: { barcode: string; quantity: number; expectedVersion: number }) =>
      apiFetch<Sale>(`/pos/sales/${saleId}/lines/scan`, { method: "POST", body: JSON.stringify(body) }),
    complete: (saleId: string, expectedVersion: number, paymentRef?: { provider: string; transactionId: string }) =>
      apiFetch<{ sale: Sale; journalEntryIds: string[] }>(`/pos/sales/${saleId}/complete`, {
        method: "POST",
        body: JSON.stringify({ expectedVersion, paymentRef }),
      }),
    refund: (saleId: string, body: { reason: string; refundLines?: { variantId: string; quantity: number }[]; expectedVersion: number }) =>
      apiFetch<{ sale: Sale; refundJournalEntryId: string; refundAmount: { amount: number; currency: string } }>(
        `/pos/sales/${saleId}/refund`,
        { method: "POST", body: JSON.stringify(body) },
      ),
  },
  // ... orders, products, branches, stock, etc.
};
```

> Tip: para compartir tipos entre backend (`opita-market-templates/packages/core`) y frontend, crear un paquete `@opita-market/contracts` (TypeScript types-only, public) o publicar `@opita-market/core` con `tsc --emitDeclarationOnly`. Sprint 7+ housekeeping.

---

## 4. Pantallas a construir (mapeo 1-a-1 con endpoints)

### 4.1 POS terminal (`/pos/sales`)

Reemplazar el dashboard demo de TailAdmin con flujo POS. Componentes:
- `OpenSalePanel` — selector de sucursal + método de pago → POST /pos/sales.
- `ScanInput` — input autofocus que llama POST /pos/sales/:id/lines/scan en cada keystroke (debounced 200ms) o submit.
- `CartTable` — muestra las líneas con qty × unitPrice.
- `TotalBar` — subtotal, tax, total, descuento.
- `CompleteButton` — abre modal de cobro → POST /pos/sales/:id/complete con paymentRef.

Optimizaciones:
- Sonido + vibración en scan exitoso (vibración API).
- Scanner físico (HID keyboard) → el `ScanInput` solo necesita focus; no requiere cámara.
- Modo offline → queue de scans en localStorage, sync cuando vuelve la conexión (Sprint 7+).

### 4.2 Admin → Auditoría (`/admin/audit`)

Tabla con filtros (actorEmail, action dropdown, targetType dropdown, date range). Usa el `Table` primitive de TailAdmin + paginación cursor-based.

```tsx
import { api } from "@/lib/api";
import { useState } from "react";

export function AuditPage() {
  const [filters, setFilters] = useState({ actorEmail: "", action: "" });
  const { data, loading } = useSWR(["audit", filters], () => api.audit.list(filters));
  return (
    <Table
      data={data?.items ?? []}
      columns={[
        { key: "createdAt", label: "Fecha" },
        { key: "actorEmail", label: "Actor" },
        { key: "action", label: "Acción" },
        { key: "targetType", label: "Tipo" },
        { key: "targetId", label: "ID" },
      ]}
    />
  );
}
```

### 4.3 Admin → Reportes (`/admin/reports/daily`)

Date picker (default = hoy) + cards de KPIs (sales.count, sales.total, refunds.total) + chart ApexCharts de `byChannel` + tabla de `byStatus`.

### 4.4 Admin → Cumplimiento (`/admin/customers/:id/habeas-data`)

Página de detalle por cliente que muestra:
- `consent.consentedAt`
- `consent.policyVersion`
- `consent.policyUrl`
- `policyVersionMatched` (badge verde si matched, rojo si no)

Para auditores que necesitan responder solicitudes de Ley 1581/2012 (derecho de acceso / rectificación / supresión).

---

## 5. Customización de Tailwind (tokens + dark mode)

Ver [`../docs/brand-customization.md`](../docs/brand-customization.md) para el setup completo. Mínimo viable:

```ts
// tailwind.config.ts
const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // tokens leídos del tenant (Sprint 7+)
        brand: {
          50: "#fef3f2",
          500: "#ef4444",
          600: "#dc2626",
          900: "#7f1d1d",
        },
      },
    },
  },
};
```

Para Sprint 7+ multi-tenant dinámico: aplicar CSS variables desde `GET /tenants/:tenantId/checkout/config` (que el operador deberá extender para devolver `brand.primaryColor`).

---

## 6. Deploy

### Opción A: Vercel (recomendado para admin/POS)

```bash
vercel --prod
```

Configurar env vars en Vercel dashboard (`NEXT_PUBLIC_*`).

### Opción B: CloudFront + S3 (estático pre-renderizado)

```bash
npm run build
# output: .next/
# usar @cloudflare/next-on-pages para Cloudflare Pages, o
# aws s3 sync .next/ s3://opita-market-admin-pasiones-prod/ --delete
```

### Opción C: Self-hosted en contenedor

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY source/ ./
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 7. Verificación end-to-end

```bash
# Local
npm run dev
# → http://localhost:3000/login

# 1. Click "Iniciar sesión con opita cuentas"
#    (si OCAIS está en sandbox, sigue el flow de sandbox user)

# 2. Verificar cookie OCAIS en DevTools → Application → Cookies

# 3. Navegar a /admin/audit — debe cargar audit logs reales
#    (curl con la cookie: curl -b opita_session=... /admin/audit)

# 4. POS flow:
#    - /pos/sales → POST /pos/sales → saleId
#    - /pos/sales/:id/lines/scan con barcode → línea agregada
#    - /pos/sales/:id/complete → sale completed + 2 JEs

# 5. Refund:
#    - /pos/sales/:id/refund → sale refunded + refunds JE + audit log
#    - verificar audit log con `wompi.refund.external_handled_outside_platform`
#      si la venta tenía paymentRef.provider="wompi"
```

---

## 8. Limitaciones conocidas (Sprint 6 baseline)

- **Sin POS offline**: requiere conexión constante. Sprint 7+ añade IndexedDB queue.
- **Sin optimistic UI en stock dashboard**: refetch cada 30s. Riesgo de oversell visible.
- **Sin 2FA**: OCAIS ya soporta 2FA upstream pero no expuesto aquí.
- **Dark mode hardcoded**: requiere nuevo Tenant config (`theme.darkMode: boolean`).

---

## Reference

- [`../docs/api-cookbook.md`](../docs/api-cookbook.md) — todos los endpoints con request/response examples
- [`../docs/brand-customization.md`](../docs/brand-customization.md) — theming detallado
- [`../docs/agent-skills.md`](../docs/agent-skills.md) — cómo los AI agents descubren este INTEGRATION.md
- `repomix.txt` — código fuente completo comprimido para AI context
- `source/` — git submodule del repo TailAdmin upstream