"use client";

/**
 * CategoryNav — navegación de categorías con identidad sex-shop Pasiones.
 *
 * Layout:
 *   - Grid de category cards (4 columnas desktop, 2 tablet, 1 mobile)
 *   - Cada card: icono + label + subcategorías preview
 *   - Categoría "Curvy" con badge gold (línea premium)
 *
 * Datos:
 *   - Lee de tenant.yml (catalog.categories)
 *   - El SDK @opita/market-integration expone getTenantCategories()
 *     pero aquí usamos la lista inline para que el demo funcione standalone
 */

import { pasion } from "../../lib/brand";

export interface CategoryNavProps {
  locale?: "es-CO" | "en-US" | "pt-BR";
}

// Iconos emoji minimalistas (placeholder hasta tener iconos SVG propios)
const CATEGORY_ICONS: Record<string, string> = {
  lenceria: "👙",
  juguetes: "💫",
  cuidado_personal: "💧",
  bondage: "⛓️",
  wellness: "🌿",
  libros_peliculas: "📚",
  regalos: "🎁",
};

// Categorías top-level con subcategorías para preview
const CATEGORIES = [
  {
    key: "lenceria",
    label: pasion.copy.categories.lenceria,
    icon: CATEGORY_ICONS.lenceria,
    subcategories: [
      pasion.copy.categories.lenceria_ella,
      pasion.copy.categories.lenceria_el,
      pasion.copy.categories.lenceria_parejas,
    ],
    featured: "lenceria_curvy",
  },
  {
    key: "juguetes",
    label: pasion.copy.categories.juguetes,
    icon: CATEGORY_ICONS.juguetes,
    subcategories: [
      pasion.copy.categories.juguetes_vibradores,
      pasion.copy.categories.juguetes_dildos,
      pasion.copy.categories.juguetes_anal,
      pasion.copy.categories.juguetes_parejas,
    ],
  },
  {
    key: "cuidado_personal",
    label: pasion.copy.categories.cuidado_personal,
    icon: CATEGORY_ICONS.cuidado_personal,
    subcategories: [
      pasion.copy.categories.lubricantes,
      pasion.copy.categories.masajes,
      pasion.copy.categories.higiene,
    ],
  },
  {
    key: "bondage",
    label: pasion.copy.categories.bondage,
    icon: CATEGORY_ICONS.bondage,
    subcategories: [
      pasion.copy.categories.bondage_basico,
      pasion.copy.categories.bondage_avanzado,
    ],
  },
  {
    key: "wellness",
    label: pasion.copy.categories.wellness,
    icon: CATEGORY_ICONS.wellness,
    subcategories: [],
  },
  {
    key: "regalos",
    label: pasion.copy.categories.regalos,
    icon: CATEGORY_ICONS.regalos,
    subcategories: [
      pasion.copy.categories.regalos_kit_iniciacion,
      pasion.copy.categories.regalos_aniversario,
    ],
  },
];

export function CategoryNav({ locale = "es-CO" }: CategoryNavProps) {
  return (
    <section
      aria-label="Categorías"
      style={{
        maxWidth: 1400,
        margin: "3rem auto",
        padding: "0 1.5rem",
      }}
    >
      <header
        style={{
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontFamily: pasion.font.display,
            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
            color: pasion.color.wine,
            margin: "0 0 0.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          Explora por categoría
        </h2>
        <p
          style={{
            fontFamily: pasion.font.script,
            fontSize: "1.25rem",
            color: pasion.color.hot,
            margin: 0,
          }}
        >
          Encuentra lo que te enciende
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {CATEGORIES.map((cat) => {
          const isCurvy = cat.featured === "lenceria_curvy";
          return (
            <a
              key={cat.key}
              href={`/catalogo/${cat.key}`}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1.5rem 1rem",
                borderRadius: pasion.radius.lg,
                backgroundColor: pasion.color.white,
                border: `1px solid ${pasion.color.pinkPastel}`,
                textDecoration: "none",
                color: pasion.color.textDark,
                transition: `transform ${pasion.motion.durationBase} ${pasion.motion.easeOut}, box-shadow ${pasion.motion.durationBase}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = pasion.shadow.medium;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isCurvy && (
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    padding: "0.125rem 0.5rem",
                    borderRadius: pasion.radius.pill,
                    backgroundColor: pasion.color.gold,
                    color: pasion.color.textDark,
                    fontFamily: pasion.font.body,
                    fontSize: "0.625rem",
                    fontWeight: pasion.weight.bodyBold,
                    textTransform: "uppercase",
                  }}
                >
                  ✨ Curvy
                </span>
              )}

              <span
                aria-hidden
                style={{
                  fontSize: "3rem",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {cat.icon}
              </span>

              <h3
                style={{
                  fontFamily: pasion.font.body,
                  fontSize: "1.125rem",
                  fontWeight: pasion.weight.bodyBold,
                  margin: "0 0 0.5rem",
                  color: pasion.color.wine,
                }}
              >
                {cat.label}
              </h3>

              {cat.subcategories.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {cat.subcategories.slice(0, 3).map((sub) => (
                    <li
                      key={sub}
                      style={{
                        fontFamily: pasion.font.body,
                        fontSize: "0.75rem",
                        color: pasion.color.textMuted,
                        marginBottom: 2,
                      }}
                    >
                      {sub}
                    </li>
                  ))}
                </ul>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryNav;