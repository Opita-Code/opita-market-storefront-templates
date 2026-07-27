# Agent Skills — cómo los AI agents descubren y consumen este repo

> Este repo está diseñado para ser consumido por AI coding agents (Claude
> Code, Cursor, Cline, Roo Code, etc.) que soporten el estándar
> [Agent Skills](https://agentskills.io/).

## Cómo descubre el agente las plantillas

### Modo 1: Progressive disclosure (estándar)

Cuando un agente carga skills al startup, hace:

1. **Discovery**: lee solo el `name` + `description` del frontmatter de cada SKILL.md (~100 tokens por skill). Decide cuáles son relevantes para la tarea.
2. **Activation**: cuando la tarea matchea una `description`, lee el SKILL.md completo (~5-15KB).
3. **Execution**: si el SKILL.md referencia INTEGRATION.md o repomix.txt, los lee on-demand.

```
SKILL.md (root)
  └─ description: "Catálogo de plantillas frontend..." (~300 tokens)
     ↓ match con la tarea
SKILL.md (root completo, ~12KB)
  └─ references templates/<name>/SKILL.md
     ↓ match con la subtarea
templates/admin-tailadmin/SKILL.md (~8KB)
  └─ references INTEGRATION.md + repomix.txt
     ↓ on-demand
templates/admin-tailadmin/INTEGRATION.md (~15KB)
templates/admin-tailadmin/repomix.txt (~600KB)
```

**Resultado**: el agente consume ~5KB para el SKILL.md metadata + ~15KB para INTEGRATION.md, **solo cuando la tarea matchea**.

### Modo 2: Inyección directa (forzada)

Si el operador quiere que el agente cargue una plantilla específica:

```
@opita-market-storefront-templates/templates/admin-tailadmin/SKILL.md
```

O en Cursor: arrastrar `templates/admin-tailadmin/SKILL.md` al composer.

### Modo 3: Compressed context (repomix.txt)

Si el agente necesita entender el código fuente completo (no solo metadata + integración):

```
Lee templates/admin-tailadmin/repomix.txt (~600KB) 
y explícame cómo customizar el dashboard para multi-branch.
```

El agente lee **solo el archivo comprimido**, no clona el submodule. Costo: ~150K tokens de input (dentro del context window de Claude Sonnet 4.x con 200K tokens).

## Frontmatter schema (YAML en cada SKILL.md)

```yaml
---
name: <kebab-case-id>             # requerido, único, lowercase + hyphens
description: |                    # requerido, multi-line
  <2-4 párrafos: qué hace, cuándo usar, cuándo NO usar, stack, license, source>
license: MIT | Apache-2.0 | ...   # opcional pero recomendado
source_repo: <URL upstream>       # opcional
integration_target: <backend version>   # opcional
allowed_tools: [Bash, Read, Edit, Write]   # opcional, para gating de tools
---
```

## Validación del estándar

`scripts/validate-skills.sh` corre las 4 validaciones que el estándar exige:

1. **YAML parseable** — el frontmatter es YAML válido.
2. **`name` kebab-case** — regex `^[a-z0-9]+(-[a-z0-9]+)*$`.
3. **`description` length** — entre 50 y 1024 caracteres (recomendado 100-500).
4. **`name` único en repo** — no hay duplicados entre SKILL.md files.

Si una validación falla, el script exit 1 + mensaje claro. CI bloquea el merge.

## Activación natural por keywords

Cada `description` debería incluir las keywords que el operador / usuario usaría naturalmente. Ejemplo para `admin-tailadmin`:

```yaml
description: |
  POS tablet + admin panel dashboard based on TailAdmin Next.js (MIT, 2.5k stars).
  Use when: building admin UI, POS terminal, dashboards with charts/tables,
  or any backoffice tool that needs auth pages, RBAC, and dark mode.
```

**Keywords que disparan este skill**:
- "POS terminal"
- "admin panel"
- "dashboard"
- "backoffice"
- "TailAdmin"
- "auth pages"
- "RBAC"

## Diferencia entre SKILL.md (estándar) e INTEGRATION.md (este repo)

| Aspecto | SKILL.md | INTEGRATION.md |
|---|---|---|
| **Audiencia** | AI agent | Desarrollador humano |
| **Tamaño** | Pequeño (~5-15KB) | Mediano (~10-30KB) |
| **Estilo** | Cuándo + decisiones | Cómo + comandos copy-paste |
| **Ejemplos de código** | Mínimos (referencias) | Completos (TypeScript completo) |
| **Cuándo se carga** | On-demand (progressive) | On-demand (cuando se necesita código) |
| **Validación** | Estándar agentskills.io | Convención interna |

Regla simple: **si lo lee el agente primero, va en SKILL.md. Si lo lee el humano cuando implementa, va en INTEGRATION.md**.

## Ejemplos de invocación por agente

### Claude Code

```
> /skill opita-market-storefront-templates

[el agente carga el root SKILL.md, ve la matriz choosing-template.md, 
y pregunta: "Tienes 4 plantillas — admin-tailadmin, ecommerce-storefront, 
booking-service, landing-marketing. ¿Cuál te interesa?"]

> Necesito un POS para una tienda en Colombia. ¿Qué plantilla recomiendas?

[el agente lee admin-tailadmin/SKILL.md, ve que cubre POS + checkout + refunds,
y responde con un plan detallado]
```

### Cursor

```
@opita-market-storefront-templates @templates/admin-tailadmin/SKILL.md

Dame el plan para customizar TailAdmin para Pasiones.
```

### Sin CLI específica

El agente tiene acceso filesystem al repo (clonado o copiado en `/`). Navega por las SKILL.md + INTEGRATION.md cuando el operador hace preguntas relevantes.

## Cómo mantener los SKILL.md actualizados

Después de cada cambio significativo al código fuente (submodule actualizado, nueva feature, breaking change):

1. Editar `templates/<name>/SKILL.md` — actualizar `description` si el caso de uso cambió.
2. Editar `templates/<name>/INTEGRATION.md` — reflejar el nuevo wiring.
3. Correr `./scripts/repack.sh templates/<name>` — regenerar `repomix.txt`.
4. Correr `./scripts/validate-skills.sh` — validar que el frontmatter sigue el estándar.
5. Commit + push.

## Cómo los agentes usan el patrón híbrido

| Si el agente necesita... | Lee |
|---|---|
| Saber si esta plantilla es la correcta para la tarea | SKILL.md (metadata) |
| Saber cómo integrar con el backend | INTEGRATION.md (on-demand) |
| Entender el código fuente completo de la plantilla | repomix.txt (compressed) |
| Modificar el código fuente real | source/ (submodule) — `cat`, `grep`, edit con herramientas |

**Beneficio clave**: el agente NO necesita clonar el submodule para entender el codebase. El `repomix.txt` le da contexto completo sin el costo de clonar + leer archivos uno a uno.

## Limitaciones del patrón

- **repomix.txt stale**: si el upstream cambia y no regeneramos, el agente tiene contexto viejo. Mitigación: GitHub Action semanal.
- **Tokens consumidos**: leer repomix.txt cuesta ~150K tokens. Solo hacerlo cuando el agente necesita entender el código (no para tareas triviales).
- **No es ejecutable**: SKILL.md + INTEGRATION.md son texto, no código. El agente sigue instrucciones, no las ejecuta. Si necesitas scripts, van en `scripts/`.
- **Submodule pain**: `git submodule update --init` puede ser lento. El operador debe recordar correrlo después de clonar.

## Reference

- Estándar Agent Skills: https://agentskills.io/home
- Anthropic official skills: https://github.com/anthropics/skills
- Repomix (herramienta de compresión): https://github.com/yamadashy/repomix
- Progressive disclosure pattern: https://agentskills.io/quickstart
- Open specification: https://github.com/agentskills/agentskills