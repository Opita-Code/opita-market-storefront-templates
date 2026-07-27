# Pasiones Boutique Sensual — Taxonomía de catálogo

Estructura jerárquica de categorías para el catálogo de Pasiones Boutique Sensual. Vive en `tenant.yml → catalog.categories` y se renderiza en el frontend visual vía `@opita/market-integration.getCategories()`.

## Árbol completo

```
Raíz
├── Lencería (lenceria)
│   ├── Para Ella (lenceria_ella)
│   ├── Para Él (lenceria_el)
│   ├── Para Parejas (lenceria_parejas)
│   └── Línea Curvy (lenceria_curvy) ⭐ PREMIUM (badge gold)
│
├── Juguetes (juguetes)
│   ├── Vibradores (juguetes_vibradores)
│   ├── Dildos (juguetes_dildos)
│   ├── Anal (juguetes_anal)
│   ├── Para Parejas (juguetes_parejas)
│   └── Bullets & Egg (juguetes_bullet)
│
├── Cuidado Personal (cuidado_personal)
│   ├── Lubricantes (lubricantes)
│   ├── Aceites & Masajes (masajes)
│   └── Higiene & Cuidado (higiene)
│
├── Bondage (bondage)
│   ├── Bondage Básico (bondage_basico)
│   └── Bondage Avanzado (bondage_avanzado)
│
├── Wellness & CBD (wellness)
├── Libros & Películas (libros_peliculas)
└── Regalos & Kits (regalos)
    ├── Kit de Iniciación (regalos_kit_iniciacion) ⭐ DESTACADO
    └── Aniversario (regalos_aniversario)
```

## Detalle por categoría

### Lencería (`lenceria`)

**Tipo**: ropa interior sensual y erótica para adultos.

**Variantes activas**:

- `size`: XS, S, M, L, XL, XXL (todas requeridas)
- `color`: Negro, Rojo, Vino, Rosado, Piel, Blanco, Azul, Morado
- `material`: Encaje, Satén, Microfibra, Lycra, Algodón, PVC, Cuero

**Subcategorías**:

| Key | Label | Audiencia | Notas |
|---|---|---|---|
| `lenceria_ella` | Para Ella | Mujeres que compran para sí | Colección femenina (básicos + atrevidos) |
| `lenceria_el` | Para Él | Hombres que compran para sí / mujeres que compran para parejas | Colección masculina (briefs, jockstraps) |
| `lenceria_parejas` | Para Parejas | Parejas | Sets coordinados, disfraces para 2 |
| `lenceria_curvy` | Línea Curvy | Mujeres tallas grandes | **Premium** — badge gold, destacada en home |

**Reglas de envío**: elegible para envío discreto.

### Juguetes (`juguetes`)

**Tipo**: juguetes eróticos (vibradores, dildos, anal, etc.) para adultos.

**Variantes activas**:

- `base_material`: Silicona, ABS, TPE, Vidrio, Acero (obligatorio para hygiene disclosure)
- `size`: aplicable a dildos (longitud + diámetro)

**Subcategorías**:

| Key | Label | Audiencia | Notas |
|---|---|---|---|
| `juguetes_vibradores` | Vibradores | Todos | Categoría más popular |
| `juguetes_dildos` | Dildos | Todos | Sin vibración, tradicionales |
| `juguetes_anal` | Anal | Todos | Incluye iniciación + avanzado |
| `juguetes_parejas` | Para Parejas | Parejas | Diseñados para uso conjunto |
| `juguetes_bullet` | Bullets & Egg | Todos | Pequeños, discretos, primera compra |

**Reglas de envío**: elegible para envío discreto (empaque sin logo).

**Compliance**: descripción debe incluir materiales explícitos (body-safe / hypoallergenic / etc.).

### Cuidado Personal (`cuidado_personal`)

**Tipo**: lubricantes, aceites de masaje, productos de higiene íntima.

**Variantes activas**:

- `flavor`: Neutro, Fresa, Chocolate, Vainilla, Menta, Cereza, Mango (lubricantes comestibles)
- Tamaño en ml para lubricantes / aceites

**Subcategorías**:

| Key | Label | Notas |
|---|---|---|
| `lubricantes` | Lubricantes | Base agua, silicona, aceite, híbrido |
| `masajes` | Aceites & Masajes | Cosmética sensual, velas de masaje |
| `higiene` | Higiene & Cuidado | Jabones íntimos, toallas, limpiadores |

**Reglas de envío**: elegible para envío discreto.

### Bondage (`bondage`)

**Tipo**: artículos de bondage suave a intermedio para principiantes y avanzados.

**Subcategorías**:

| Key | Label | Audiencia | Notas |
|---|---|---|---|
| `bondage_basico` | Bondage Básico | Principiantes | Velcro, vendas, esposas suaves |
| `bondage_avanzado` | Bondage Avanzado | Experimentados | Cuero, cuerdas, arneses |

**Reglas de envío**:

- Básico: elegible para envío discreto
- Avanzado: **pickup_only** en algunas jurisdicciones (Sprint 7+ restricción)

**Compliance**: descripción debe incluir advertencia "uso consensuado entre adultos".

### Wellness & CBD (`wellness`)

**Tipo**: productos de bienestar íntimo, incluyendo CBD y suplementos.

**Variantes activas**: según producto (volumen, concentración).

**Subcategorías**: actualmente categoría plana (sin subcategorías activas).

**Reglas de envío**: elegible para envío discreto. CBD requiere verificación de mayoría de edad adicional (Sprint 7+).

### Libros & Películas (`libros_peliculas`)

**Tipo**: literatura y audiovisual para adultos.

**Variantes**: formato (físico / digital), idioma.

**Reglas de envío**:

- Físico: elegible para envío discreto
- Digital: entrega inmediata por email, sin envío físico

**Compliance**: descripción debe evitar NUDES explícitos en la imagen de preview; el contenido se desbloquea tras compra.

### Regalos & Kits (`regalos`)

**Tipo**: kits temáticos y regalos para ocasiones especiales.

**Subcategorías**:

| Key | Label | Uso |
|---|---|---|
| `regalos_kit_iniciacion` | Kit de Iniciación | Primera compra de pareja / curioso |
| `regalos_aniversario` | Aniversario | Regalos para ocasiones |

**Reglas de envío**: elegible para envío discreto, opción de empaque de regalo (gift wrapping).

## Reglas transversales

### Reglas de variante

Las categorías actuales comparten `variant_attributes` globales definidas en `tenant.yml`. Sprint 7+ migra a **per-category variant schemas**:

```yaml
# Ejemplo futuro (Sprint 7+)
catalog:
  variant_schemas:
    lenceria:
      required: [size, color]
      optional: [material]
    juguetes:
      required: [base_material]
      optional: [size]
    lubricantes:
      required: [flavor]
      optional: [volume_ml]
```

### Reglas de envío

Sprint 7+ introduce `shipping_rules` per-category:

```yaml
catalog:
  shipping_rules:
    bondage_avanzado:
      pickup_only: true
      jurisdictions: [41001, 41551]  # Solo Neiva y Pitalito
    wellness:
      age_verification_required: true
      delivery_methods: [pickup, courier]
```

### Reglas de precio

- **COP** es la moneda por defecto
- **Price floor** sugerido: COP $15.000 (productos debajo no son rentables)
- **Price ceiling** sin restricción (hay productos de hasta $500.000+ en lencería premium)

### Categoría por defecto

`tenant.yml.catalog.default_category: lenceria`

Si un producto se crea sin categoría explícita, se le asigna `lenceria`. El operador puede cambiar la default después del primer deploy.

## Próximas tareas Sprint 7+

1. Per-category variant schemas (backend)
2. Per-category shipping rules (backend)
3. Per-category price floors / ceilings (backend)
4. Categoría "Para Discapacitados" — sugerencia del operador para boutique inclusiva
5. Categorías regionales (ej. "Línea Neiva" — productos exclusivos locales)

## Referencias

- `tenant.yml → catalog.categories` — fuente de verdad
- `integration/src/types/checkout.ts` — tipos de CheckoutConfig / DailyReport
- `theme-overrides/pasiones-boutique-sensual/components/products/CategoryNav.tsx` — render frontend
- `integration/src/i18n/locales.ts` — keys `category.*` con traducciones 3-locale