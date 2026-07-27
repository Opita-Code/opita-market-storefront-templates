"use client";

/**
 * HeroBanner — hero principal de la home con identidad Pasiones.
 *
 * Inspirado en la imagen 2 del brief: tipografía display gigante + modelo
 * + fondo degradado con acento cyan. Editorial, body-positive.
 *
 * Variantes:
 *   - default: hero full-width con copy + imagen + CTA
 *   - compact: solo texto + CTA (mobile-first)
 *   - editorial: layout asimétrico, copy a la izquierda, imagen a la derecha
 *
 * NOTA: la imagen es placeholder. En producción usar foto real del catálogo
 * (modelos成年, lace lingerie, iluminación editorial).
 */

import { pasion } from "../../lib/brand";

export type HeroVariant = "default" | "compact" | "editorial";

export interface HeroBannerProps {
  variant?: HeroVariant;
  /** Línea principal (display) */
  headline: string;
  /** Línea secundaria (script) */
  subheadline?: string;
  /** Copy de soporte */
  body?: string;
  /** Texto del CTA principal */
  ctaLabel: string;
  /** URL del CTA principal */
  ctaHref: string;
  /** Texto del CTA secundario (opcional) */
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  /** URL de la imagen (placeholder si vacío) */
  imageUrl?: string;
  /** Alt text de la imagen (a11y) */
  imageAlt?: string;
}

export function HeroBanner({
  variant = "default",
  headline,
  subheadline,
  body,
  ctaLabel,
  ctaHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
  imageUrl,
  imageAlt = "Modelo Pasiones Boutique Sensual",
}: HeroBannerProps) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundImage: `linear-gradient(135deg, ${pasion.color.pinkPastel} 0%, ${pasion.color.cyanPastel} 100%)`,
        padding: variant === "compact" ? "3rem 1rem" : "5rem 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: variant === "editorial" ? "1fr 1fr" : "1fr",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {/* Copy column */}
        <div
          style={{
            textAlign: variant === "default" ? "center" : "left",
            maxWidth: 720,
            margin: variant === "default" ? "0 auto" : undefined,
          }}
        >
          {subheadline && (
            <p
              style={{
                fontFamily: pasion.font.script,
                fontSize: "1.5rem",
                color: pasion.color.hot,
                margin: "0 0 0.5rem",
              }}
            >
              {subheadline}
            </p>
          )}

          <h1
            style={{
              fontFamily: pasion.font.display,
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
              color: pasion.color.wine,
              margin: "0 0 1rem",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            {headline}
          </h1>

          {body && (
            <p
              style={{
                fontFamily: pasion.font.body,
                fontSize: "1.125rem",
                color: pasion.color.textDark,
                margin: "0 0 1.5rem",
                lineHeight: 1.5,
                maxWidth: 560,
              }}
            >
              {body}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: variant === "default" ? "center" : "flex-start",
            }}
          >
            <a
              href={ctaHref}
              style={{
                display: "inline-block",
                fontFamily: pasion.font.body,
                fontSize: "1rem",
                fontWeight: pasion.weight.bodyBold,
                padding: "0.875rem 2rem",
                borderRadius: pasion.radius.pill,
                backgroundColor: pasion.color.hot,
                color: pasion.color.white,
                textDecoration: "none",
                boxShadow: pasion.shadow.medium,
                transition: `transform ${pasion.motion.durationFast} ${pasion.motion.easeOut}`,
              }}
            >
              {ctaLabel} →
            </a>

            {ctaSecondaryLabel && ctaSecondaryHref && (
              <a
                href={ctaSecondaryHref}
                style={{
                  display: "inline-block",
                  fontFamily: pasion.font.body,
                  fontSize: "1rem",
                  fontWeight: pasion.weight.bodyMedium,
                  padding: "0.875rem 2rem",
                  borderRadius: pasion.radius.pill,
                  backgroundColor: "transparent",
                  color: pasion.color.wine,
                  textDecoration: "none",
                  border: `2px solid ${pasion.color.wine}`,
                }}
              >
                {ctaSecondaryLabel}
              </a>
            )}
          </div>
        </div>

        {/* Image column (only editorial) */}
        {variant === "editorial" && (
          <div
            style={{
              position: "relative",
              aspectRatio: "4 / 5",
              maxWidth: 480,
              marginLeft: "auto",
              borderRadius: pasion.radius.lg,
              overflow: "hidden",
              backgroundImage: `linear-gradient(135deg, ${pasion.color.hot} 0%, ${pasion.color.wine} 100%)`,
              boxShadow: pasion.shadow.strong,
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={imageAlt}
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
                  fontSize: "5rem",
                  color: pasion.color.white,
                  opacity: 0.5,
                }}
              >
                📸
              </div>
            )}

            {/* Gold badge "Curvy" línea premium */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: "0.5rem 1rem",
                borderRadius: pasion.radius.pill,
                backgroundColor: pasion.color.gold,
                color: pasion.color.textDark,
                fontFamily: pasion.font.body,
                fontSize: "0.875rem",
                fontWeight: pasion.weight.bodyBold,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                boxShadow: pasion.shadow.soft,
              }}
            >
              ✨ Línea Curvy
            </div>
          </div>
        )}
      </div>

      {/* Decorative element — bunny decorativo en la esquina */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -40,
          right: -40,
          fontSize: "8rem",
          opacity: 0.15,
          filter: `drop-shadow(0 0 30px ${pasion.color.cyan})`,
          pointerEvents: "none",
        }}
      >
        🐰
      </div>
    </section>
  );
}

export default HeroBanner;