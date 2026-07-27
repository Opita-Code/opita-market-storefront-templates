# opita-market-storefront-templates

> Catálogo de **plantillas frontend** open-source, pre-empaquetadas como [Agent Skills](https://agentskills.io/) (formato Anthropic), listas para personalizar e integrar con el backend [`opita-market-templates`](../opita-market-templates).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/agent--skills-standard-purple)](https://agentskills.io/)
[![Repomix](https://img.shields.io/badge/powered%20by-repomix-green)](https://repomix.com/)

## ¿Qué es esto?

Un repo que contiene **plantillas frontend completas**, pre-empaquetadas con el formato [Agent Skills](https://agentskills.io/):

- Cada plantilla trae el **código fuente real** (git submodule del repo MIT original).
- Cada plantilla trae el **contexto AI-friendly** comprimido vía [Repomix](https://github.com/yamadashy/repomix) en `repomix.txt`.
- Cada plantilla expone un `SKILL.md` con metadata + instrucciones de integración + cuándo usarla.
- Cada plantilla expone `INTEGRATION.md` con los pasos concretos para conectarla al backend `opita-market-templates`.

## ¿Cuándo usar cada plantilla?

| Cliente quiere… | Plantilla | Stack | Status |
|---|---|---|---|
| Tienda online + pickup + pago con Wompi | [`ecommerce-storefront`](templates/ecommerce-storefront/SKILL.md) | Next.js + Tailwind + shadcn/ui | ✅ Sprint 1 |
| POS tablet + backoffice admin | [`admin-tailadmin`](templates/admin-tailadmin/SKILL.md) | Next.js + Tailwind (TailAdmin) | ✅ Sprint 1 |
| Servicios con reserva (salon, spa, consultorio) | [`booking-service`](templates/booking-service/SKILL.md) | Next.js 15 + Tailwind v4 | 🟡 Sprint 2 |
| Landing page de marketing / anuncio | [`landing-marketing`](templates/landing-marketing/SKILL.md) | Next.js + Tailwind | 🟡 Sprint 2 |

Ver [`docs/choosing-template.md`](docs/choosing-template.md) para la matriz completa.

## Estructura

```
opita-market-storefront-templates/
├── README.md                          ← este archivo
├── SKILL.md                           ← root skill (catálogo + cuándo usar cada plantilla)
├── LICENSE                            ← MIT
├── templates/
│   ├── admin-tailadmin/
│   │   ├── SKILL.md                   ← metadata + integración (formato agentskills.io)
│   │   ├── INTEGRATION.md             ← pasos concretos contra opita-market-templates
│   │   ├── repomix.txt                ← Repomix output (compressed context)
│   │   └── source/                    ← git submodule del repo MIT original
│   ├── ecommerce-storefront/
│   │   ├── SKILL.md
│   │   ├── INTEGRATION.md
│   │   ├── repomix.txt
│   │   └── source/
│   ├── booking-service/
│   └── landing-marketing/
├── docs/
│   ├── choosing-template.md           ← "¿qué plantilla uso para mi cliente?"
│   ├── api-cookbook.md                ← endpoints del backend que consume cada plantilla
│   ├── brand-customization.md         ← tokens, theming, multi-tenant branding
│   └── agent-skills.md                ← cómo los AI agents descubren y consumen los SKILL.md
├── scripts/
│   ├── repack.sh                      ← regenera repomix.txt desde source/
│   ├── new-template.sh                ← scaffold para añadir nueva plantilla
│   └── validate-skills.sh             ← valida que cada SKILL.md cumple el estándar
└── .github/workflows/
    └── repack.yml                     ← weekly cron regenera repomix.txt si source cambió
```

## El patrón híbrido (repos como skills)

Cada plantilla expone su contexto a AI agents de **dos formas**:

1. **`SKILL.md`** + carpeta autocontenida — formato estándar [agentskills.io](https://agentskills.io/home). El agente lo lee **on-demand** cuando una tarea matchea su `description`.
2. **`repomix.txt`** — el código fuente completo comprimido en un solo archivo (formato plain text, ~500KB-1MB). El agente lo lee cuando necesita entender el codebase real **sin clonar el submodule**.

Plus el **`source/` submodule** para humanos y para usar `npm install` directamente.

```
AI agent prompt
     │
     ├── skill match? → lee SKILL.md (progressive disclosure, ~5KB)
     │
     ├── necesita ver código real? → lee repomix.txt (~600KB)
     │
     └── necesita instalar / build? → git submodule update → source/ (filesystem)
```

## Quick start

### Como humano (desarrollador)

```bash
# Clonar el repo con submodules
git clone --recursive https://github.com/Opita-Code/opita-market-storefront-templates.git
cd opita-market-storefront-templates

# Explorar una plantilla
ls templates/admin-tailadmin/source/   # código real de TailAdmin
cat templates/admin-tailadmin/SKILL.md  # metadata + cuándo usar
cat templates/admin-tailadmin/INTEGRATION.md  # cómo conectar al backend

# Instalar TailAdmin localmente (ejemplo)
cd templates/admin-tailadmin/source
npm install
npm run dev
```

### Como AI agent (Claude Code / Cursor / etc.)

El agente descubre los SKILL.md automáticamente. La `description` en el frontmatter le dice cuándo activar cada uno. Para forzar la activación:

```
@opita-market-storefront-templates/templates/admin-tailadmin/SKILL.md
```

Para entender el código de una plantilla sin clonar:

```
Lee templates/admin-tailadmin/repomix.txt y dame el plan para personalizarlo 
con los colores de marca del cliente XYZ.
```

## Cómo añadir una nueva plantilla

```bash
# 1. Clonar el repo MIT original como submodule
git submodule add https://github.com/<vendor>/<template>.git templates/<name>/source

# 2. Correr el scaffolder
./scripts/new-template.sh <name> "<description>" <source-repo-url>

# 3. Personalizar SKILL.md + INTEGRATION.md con info del tenant

# 4. Generar repomix.txt
./scripts/repack.sh templates/<name>

# 5. Validar que todo cumple el estándar
./scripts/validate-skills.sh

# 6. Commit
git add -A
git commit -m "feat(templates): add <name>"
```

## Repack automático (GitHub Action)

Cada lunes a las 03:00 UTC, [`repack.yml`](.github/workflows/repack.yml) corre `scripts/repack.sh` en cada plantilla. Si el `source/` cambió desde el último commit, regenera `repomix.txt` y abre un PR automático.

## Licencias

- **Este repo**: MIT (ver [LICENSE](LICENSE))
- **TailAdmin** (admin-tailadmin): MIT © 2023 TailAdmin — https://github.com/TailAdmin/free-nextjs-admin-dashboard
- **Next.js Ecommerce Starter** (ecommerce-storefront): open-source — https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter
- **HAAR Salon** (booking-service): open-source — https://github.com/letsopencals/template-haar
- **ixartz Next.js Landing Page** (landing-marketing): MIT — https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template

Todas las dependencias mantienen sus licencias originales (incluidas como `LICENSE.source` cuando difieren de MIT).

## Repos relacionados

- [`opita-market-templates`](../opita-market-templates) — backend (Lambdas Hono + DynamoDB + repositorios) que consumen estas plantillas.
- [`opita-account-ui`](https://github.com/Opita-Code/opita-account-ui) — IdP OCAIS que autentica a los usuarios que llegan a las plantillas.
- [`agentskills.io`](https://agentskills.io/) — estándar formal del formato `SKILL.md`.

## Status

Sprint 1 (2026-07-27): estructura + 2 plantillas prioritarias (admin-tailadmin + ecommerce-storefront) + tooling.
Sprint 2 (TBD): booking-service + landing-marketing + GitHub Action configurada.