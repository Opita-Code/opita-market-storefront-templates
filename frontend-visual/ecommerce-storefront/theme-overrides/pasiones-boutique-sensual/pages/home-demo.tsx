// =============================================================================
// Pasiones Boutique Sensual — home-demo.tsx
// =============================================================================
// Página de inicio de demostración. Reemplaza src/app/(store)/page.tsx en el
// template base, o se monta como ruta /demo en el proyecto Next.js.
//
// Muestra todos los componentes compliance + layout + products en contexto.
// Datos de productos: fixtures hardcoded (en producción vienen del SDK
// @opita/market-integration → getProducts({ tenantId: "pasiones" })).

import { PasionesHeader } from "../components/layout/PasionesHeader";
import { PasionesFooter } from "../components/layout/PasionesFooter";
import { HeroBanner } from "../components/layout/HeroBanner";
import { CategoryNav } from "../components/products/CategoryNav";
import { ProductCard } from "../components/products/ProductCard";
import { AgeGate } from "../components/compliance/AgeGate";
import { HabeasDataBanner } from "../components/compliance/HabeasDataBanner";
import type { ProductCardData } from "../components/products/ProductCard";

// Datos demo — en runtime vienen del backend vía @opita/market-integration
const FEATURED_PRODUCTS: ProductCardData[] = [
  {
    id: "prod_curvy_001",
    title: "Conjunto Encaje Bordeaux — Línea Curvy",
    price: 189000, // COP cents (189.000 COP)
    currency: "COP",
    category: "lenceria_curvy",
    shippable: true,
    isCurvy: true,
    isNew: true,
    stock: 3,
    variants: {
      colors: ["Vino", "Negro"],
      sizes: ["M", "L", "XL", "XXL"],
    },
  },
  {
    id: "prod_vibrador_001",
    title: "Vibrador Recargable Silicona Médica — Rosa",
    price: 145000,
    currency: "COP",
    category: "juguetes_vibradores",
    shippable: true,
    isNew: false,
    stock: 12,
    variants: {
      colors: ["Rosado", "Vino", "Negro"],
    },
  },
  {
    id: "prod_lub_001",
    title: "Lubricante Base Agua — Fresa · 100ml",
    price: 42000,
    currency: "COP",
    category: "lubricantes",
    shippable: true,
    stock: 50,
    variants: {
      flavors: ["Fresa", "Chocolate", "Neutro"],
    },
  },
  {
    id: "prod_bondage_001",
    title: "Kit Bondage Principiantes — Velcro + vendas",
    price: 89000,
    currency: "COP",
    category: "bondage_basico",
    shippable: false, // pickup only — bondage en algunas jurisdicciones
    isNew: true,
    stock: 8,
  },
];

export default function PasionesHomeDemo() {
  return (
    <main>
      {/* Compliance — DEBE ir al principio del árbol */}
      <AgeGate locale="es-CO" />

      {/* Header */}
      <PasionesHeader locale="es-CO" cartItemCount={2} wishlistItemCount={5} />

      {/* Hero */}
      <HeroBanner
        variant="editorial"
        headline="La sensualidad no tiene talla"
        subheadline="Línea Curvy"
        body="Nueva colección encaje bordelés para celebrar cada curva. Diseños que realizan lo que ya te hace irresistible."
        ctaLabel="Descubrir Curvy"
        ctaHref="/catalogo/lenceria-curvy"
        ctaSecondaryLabel="Ver catálogo"
        ctaSecondaryHref="/catalogo"
      />

      {/* Categorías */}
      <CategoryNav locale="es-CO" />

      {/* Productos destacados */}
      <section
        style={{
          maxWidth: 1400,
          margin: "3rem auto",
          padding: "0 1.5rem",
        }}
        aria-label="Productos destacados"
      >
        <header style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display, Anton, sans-serif)",
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              color: "#6B1A3A",
              margin: "0 0 0.5rem",
              textTransform: "uppercase",
            }}
          >
            Lo más seductor
          </h2>
          <p
            style={{
              fontFamily: "var(--font-script, Pacifico, cursive)",
              fontSize: "1.25rem",
              color: "#FF1493",
              margin: 0,
            }}
          >
            Selección del equipo Pasiones
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {FEATURED_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} locale="es-CO" />
          ))}
        </div>
      </section>

      {/* Banner Línea Curvy — destacar con acento gold */}
      <section
        style={{
          maxWidth: 1400,
          margin: "3rem auto",
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{
            backgroundImage: "linear-gradient(135deg, #E0F7FA 0%, #FCE4EC 100%)",
            borderRadius: "1rem",
            padding: "3rem 2rem",
            textAlign: "center",
            border: "2px solid #D4AF37",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "0.25rem 1rem",
              borderRadius: "9999px",
              backgroundColor: "#D4AF37",
              color: "#1A1A1A",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            ✨ Edición Premium
          </span>
          <h2
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              color: "#6B1A3A",
              margin: "0 0 1rem",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            Porque ser sexy es una actitud
          </h2>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#1A1A1A",
              maxWidth: 560,
              margin: "0 auto 1.5rem",
            }}
          >
            Y la tuya lo merece todo. Descubre nuestra línea Curvy con diseños que realizan cada silueta.
          </p>
          <a
            href="/catalogo/lenceria-curvy"
            style={{
              display: "inline-block",
              padding: "0.875rem 2rem",
              borderRadius: "9999px",
              backgroundColor: "#FF1493",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(255, 20, 147, 0.4)",
            }}
          >
            Explorar Curvy →
          </a>
        </div>
      </section>

      {/* Footer */}
      <PasionesFooter locale="es-CO" />

      {/* Habeas Data — banner no bloqueante, aparece al final */}
      <HabeasDataBanner
        consentText="Bajo la Ley 1581 de 2012 (Colombia) y el Decreto 1377 de 2013, autorizo a Pasiones Boutique Sensual S.A.S. para tratar mis datos personales con la finalidad exclusiva de procesar mi pedido y cumplir obligaciones tributarias. Mis datos NO serán compartidos con terceros para fines comerciales ni de marketing, y serán conservados durante 5 años conforme al régimen tributario colombiano. Declaro bajo gravedad de juramento que soy mayor de 18 años (Ley 679 de 2001, art. 4). Como titular, tengo derecho a conocer, actualizar, suprimir y revocar mi autorización mediante solicitud a habeas_data@pasiones.example.co. Política completa: https://assets.pasiones.example/habeas-data.pdf"
        policyUrl="https://assets.pasiones.example/habeas-data.pdf"
        policyVersion="2026-07-27.2"
        locale="es-CO"
      />
    </main>
  );
}