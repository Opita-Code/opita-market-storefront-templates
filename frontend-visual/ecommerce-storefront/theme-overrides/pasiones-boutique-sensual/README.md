# Pasiones Boutique Sensual — Theme Override

Customización visual de **ecommerce-storefront** (Epic-Design-Labs/nextjs-ecommerce-starter) para el tenant `pasiones`. **No** incluye código de backend ni llamadas HTTP; consume el SDK `@opita/market-integration` vía props.

## Identidad visual (extraída de logo + flyer, julio 2026)

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#FF1493` (hot pink / magenta) | Wordmark "Pasiones", CTAs principales, badges de venta, wishlist activo |
| `accent` | `#1FE0E0` (cyan / turquesa) | Bunny logo, links secundarios, badges de "nuevo", focus rings |
| `surface-pink` | `#FCE4EC` (soft pastel) | Superficies decorativas, hover states en CTAs claros |
| `surface-cyan` | `#E0F7FA` (cyan pastel) | Highlight blocks, category cards |
| `gold` | `#D4AF37` (champagne) | Líneas premium (Curvy, aniversario), "Edición especial" |
| `text-dark` | `#1A1A1A` | Texto principal sobre fondos claros |
| `wine-dark` | `#6B1A3A` | Background modo oscuro, headlines editoriales |

**Tipografía**:
- Wordmark: **Pacifico** (Google Fonts) — script cursivo del logo
- Display: **Anton** (Google Fonts) — para titulares editoriales ("LA SENSUALIDAD NO TIENE TALLA")
- Body: **Montserrat** (Google Fonts) — texto, navegación, botones

**Voz**: bold, body-positive, playful, sensual-sin-ser-cruda. Español colombiano directo, segunda persona.

## Instalación

```bash
# 1. Clona el template base
git clone --recursive https://github.com/Opita-Code/opita-market-storefront-templates
cd opita-market-storefront-templates/frontend-visual/ecommerce-storefront/source

# 2. Instala dependencias
npm install

# 3. Instala el SDK de integración (no es dependencia de runtime del visual,
#    pero los tipos importan de él si quieres consumir el cliente HTTP)
npm install @opita/market-integration

# 4. Copia los archivos de este theme override
#    (todos van a sus rutas canónicas en el proyecto Next.js)
cp ../theme-overrides/pasiones-boutique-sensual/globals.css src/app/globals.css
cp -r ../theme-overrides/pasiones-boutique-sensual/components/* src/components/
cp -r ../theme-overrides/pasiones-boutique-sensual/lib/* src/lib/

# 5. (Opcional) Carga el script de fuentes en src/app/layout.tsx
#    Ver "Google Fonts" más abajo.

# 6. Levanta dev server
npm run dev
```

## Estructura

```
theme-overrides/pasiones-boutique-sensual/
├── README.md                  ← este archivo
├── globals.css                ← reemplazo completo de src/app/globals.css
├── tokens.css                 ← tokens como CSS custom properties + dark mode
├── lib/
│   ├── brand.ts               ← constantes de marca (colors, fonts, copy)
│   └── pasiones-tokens.ts     ← objeto TS con los mismos tokens (para componentes)
├── components/
│   ├── icons/                 ← BunnyLogo, PasionesWordmark, LipsIcon (SVG)
│   ├── compliance/            ← AgeGate, HabeasDataBanner, LegalDisclaimer, DiscreteBillingNotice
│   ├── layout/                ← PasionesHeader, PasionesFooter, HeroBanner
│   └── products/              ← CategoryNav (sex-shop taxonomy), ProductCard
├── pages/                     ← home-demo.tsx (opcional, sustituye src/app/page.tsx)
└── public/
    └── og-pasiones.svg        ← Open Graph image (placeholder 1200x630)
```

## Google Fonts (Tailwind v4)

Añade esto en `src/app/layout.tsx` (sustituye la importación Inter default):

```tsx
import { Pacifico, Anton, Montserrat } from "next/font/google";

const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-script" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400","500","700","800"], variable: "--font-body" });

// ... en el <html> aplica las 3 variables + lang="es-CO"
<html lang="es-CO" className={`${pacifico.variable} ${anton.variable} ${montserrat.variable}`}>
```

Y en `globals.css` (ya incluido), el theme override referencia `--font-script`, `--font-display` y `--font-body`.

## Compliance — lo que **DEBE** quedar visible

| Componente | Norma | Dónde se monta |
|---|---|---|
| `AgeGate` | **Ley 679/2001** + Decreto 1524/1996 | `src/app/layout.tsx` (raíz, antes de cualquier contenido) |
| `HabeasDataBanner` | Ley 1581/2012 | Header inferior + página `/habeas-data` |
| `LegalDisclaimer` | Ley 1336/2009 | Footer (todas las páginas) |
| `DiscreteBillingNotice` | Wompi / card networks | Página de checkout, antes del botón "Pagar" |

Si cualquiera de estos falta, **NO desplegar a producción**. El owner de la marca debe validar con abogada antes del primer go-live.

## Estructura del catálogo (sex-shop)

Categorías definidas en `tenant.yml → catalog.categories`. La nav las lee vía `getTenantCategories()` del SDK (`@opita/market-integration`). Jerarquía:

```
Lencería
  ├── Para Ella (lenceria_ella)
  ├── Para Él (lenceria_el)
  ├── Para Parejas (lenceria_parejas)
  └── Línea Curvy (lenceria_curvy)        ← destacado visual con acento gold

Juguetes
  ├── Vibradores (juguetes_vibradores)
  ├── Dildos (juguetes_dildos)
  ├── Anal (juguetes_anal)
  ├── Para Parejas (juguetes_parejas)
  └── Bullets & Egg (juguetes_bullet)

Cuidado Personal
  ├── Lubricantes (lubricantes)
  ├── Aceites & Masajes (masajes)
  └── Higiene (higiene)

Bondage
  ├── Básico (bondage_basico)
  └── Avanzado (bondage_avanzado)

Wellness & CBD
Libros & Películas
Regalos & Kits
  ├── Kit de Iniciación (regalos_kit_iniciacion)
  └── Aniversario (regalos_aniversario)
```

Sprint 7+ extiende el modelo con per-category variant schemas (ej. bondage solo se vende en sucursal en algunas jurisdicciones; toys no se envían a domicilio en zonas rurales).

## Modo oscuro

Activado por defecto en la imagen 1 del brief (interior oscuro del local con acento magenta). El theme override define un dark mode coherente con la marca: vino profundo (`#6B1A3A`) como fondo, hot pink con glow neón para CTAs, cyan como acento secundario.

Toggle: `PasionesHeader` lee `prefers-color-scheme` y permite override manual (botón sol/luna en el header). Persiste en `localStorage` bajo la key `pasiones-theme`.

## Próximos pasos

1. **Logo real** — subir SVG + PNG a `assets.pasiones` y actualizar `branding.logo_url` en `tenant.yml`
2. **Fotografía de producto** — sustituir placeholders con fotos reales de inventario (resolución ≥1200×1500, fondo neutro)
3. **Política de Habeas Data** — subir PDF firmado a `assets.pasiones/habeas-data.pdf`
4. **Descriptor Wompi** — configurar `"PB*PASIONES SAS"` en Wompi dashboard
5. **Revisión legal** — textos de consentimiento + age gate copy con abogada

Ver `docs/pasiones-boutique-sensual/compliance-checklist.md` para el checklist completo de go-live.