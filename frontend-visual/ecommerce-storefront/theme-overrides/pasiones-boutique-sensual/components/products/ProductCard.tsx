"use client";

/**
 * ProductCard — card de producto con identidad Pasiones.
 *
 * Diferencias con cards genéricos:
 *   - Badge "+18" en todas las cards (no se puede vender a menores)
 *   - Badge "Empaque discreto" en productos elegibles para envío
 *   - Hover state con glow magenta sutil
 *   - Wishlist heart siempre visible (no solo hover)
 *   - Variantes (size, color, material) con colores visuales cuando aplique
 *
 * Datos:
 *   - Recibe un Product via props (consume @opita/market-integration)
 *   - Tipos exportados desde el SDK
 */

import { pasion } from "../../lib/brand";

// Interfaz mínima — el componente es visual, no conoce el modelo completo.
// En runtime, el componente recibe un Product del SDK o de la página.
export interface ProductCardData {
  id: string;
  title: string;
  price: number; // minor units (COP cents)
  currency: "COP" | "USD" | "BRL";
  imageUrl?: string;
  imageAlt?: string;
  category?: string;
  /** Indica si el producto es elegible para envío discreto */
  shippable?: boolean;
  /** Indica si el producto es de la línea Curvy (premium) */
  isCurvy?: boolean;
  /** Si el producto está marcado como nuevo */
  isNew?: boolean;
  /** Stock disponible (null = no se muestra) */
  stock?: number;
  /** Variantes para preview rápido */
  variants?: {
    colors?: string[]; // ["Negro", "Rojo", "Blanco"]
    sizes?: string[]; // ["S", "M", "L"]
  };
}

export interface ProductCardProps {
  product: ProductCardData;
  locale?: "es-CO" | "en-US" | "pt-BR";
  onAddToCart?: (product: ProductCardData) => void;
  onToggleWishlist?: (product: ProductCardData) => void;
  isWishlisted?: boolean;
}

export function ProductCard({
  product,
  locale = "es-CO",
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: ProductCardProps) {
  const priceFormatted = new Intl.NumberFormat(
    locale === "es-CO" ? "es-CO" : locale === "pt-BR" ? "pt-BR" : "en-US",
    {
      style: "currency",
      currency: product.currency,
      maximumFractionDigits: 0,
    }
  ).format(product.price / (product.currency === "COP" ? 1 : 100));

  return (
    <article
      style={{
        position: "relative",
        backgroundColor: pasion.color.white,
        borderRadius: pasion.radius.lg,
        overflow: "hidden",
        border: `1px solid ${pasion.color.pinkPastel}`,
        transition: `transform ${pasion.motion.durationBase} ${pasion.motion.easeOut}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 5",
          backgroundImage: `linear-gradient(135deg, ${pasion.color.pinkPastel} 0%, ${pasion.color.cyanPastel} 100%)`,
          overflow: "hidden",
        }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.imageAlt ?? product.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              opacity: 0.3,
            }}
          >
            📸
          </div>
        )}

        {/* Top-left badges */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span className="badge-pasion badge-pasion-hot">+18</span>
          {product.isCurvy && (
            <span className="badge-pasion badge-pasion-gold">✨ Curvy</span>
          )}
          {product.isNew && (
            <span className="badge-pasion badge-pasion-cyan">Nuevo</span>
          )}
        </div>

        {/* Top-right: wishlist + shippable */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist?.(product);
            }}
            aria-label={isWishlisted ? "Quitar de wishlist" : "Añadir a wishlist"}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              backgroundColor: pasion.color.white,
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: pasion.shadow.soft,
            }}
          >
            {isWishlisted ? "💕" : "🤍"}
          </button>

          {product.shippable && (
            <span
              title="Empaque discreto disponible"
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: pasion.radius.sm,
                backgroundColor: pasion.color.cyan,
                color: pasion.color.textDark,
                fontFamily: pasion.font.body,
                fontSize: "0.625rem",
                fontWeight: pasion.weight.bodyBold,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              📦 Discreto
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              padding: "0.25rem 0.5rem",
              borderRadius: pasion.radius.sm,
              backgroundColor: "rgba(255, 20, 147, 0.95)",
              color: pasion.color.white,
              fontFamily: pasion.font.body,
              fontSize: "0.6875rem",
              fontWeight: pasion.weight.bodyBold,
            }}
          >
            ¡Solo {product.stock}!
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "1rem" }}>
        <h3
          style={{
            fontFamily: pasion.font.body,
            fontSize: "0.9375rem",
            fontWeight: pasion.weight.bodyMedium,
            color: pasion.color.textDark,
            margin: "0 0 0.5rem",
            lineHeight: 1.3,
          }}
        >
          {product.title}
        </h3>

        {/* Variant colors preview */}
        {product.variants?.colors && product.variants.colors.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 8,
            }}
          >
            {product.variants.colors.slice(0, 5).map((color) => (
              <span
                key={color}
                title={color}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: getColorHex(color),
                  border: `1px solid ${pasion.color.pinkPastel}`,
                }}
              />
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: pasion.font.body,
              fontSize: "1.125rem",
              fontWeight: pasion.weight.bodyBold,
              color: pasion.color.hot,
            }}
          >
            {priceFormatted}
          </span>

          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            style={{
              padding: "0.5rem 0.875rem",
              borderRadius: pasion.radius.md,
              border: "none",
              backgroundColor: pasion.color.hot,
              color: pasion.color.white,
              fontFamily: pasion.font.body,
              fontSize: "0.8125rem",
              fontWeight: pasion.weight.bodyBold,
              cursor: "pointer",
            }}
          >
            {pasion.copy.cta.addToCart}
          </button>
        </div>
      </div>
    </article>
  );
}

function getColorHex(colorName: string): string {
  const map: Record<string, string> = {
    Negro: "#1A1A1A",
    Rojo: "#E53935",
    Vino: "#6B1A3A",
    Rosado: "#FCE4EC",
    Piel: "#D4A98C",
    Blanco: "#FFFFFF",
    Azul: "#1E88E5",
    Morado: "#8E24AA",
  };
  return map[colorName] ?? "#CCCCCC";
}

export default ProductCard;