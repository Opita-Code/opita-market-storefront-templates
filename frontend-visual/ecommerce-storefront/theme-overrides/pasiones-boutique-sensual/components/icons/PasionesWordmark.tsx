"use client";

/**
 * PasionesWordmark — el logotipo textual oficial.
 *
 * "Pasiones" en script cursivo hot pink (#FF1493) con el detalle del bunny
 * mask integrado en la 'i' (lips icon debajo). Replica la imagen 1 del brief.
 *
 * Tamaños recomendados:
 *   - xs (24px): favicon-style header móvil
 *   - sm (32px): header desktop
 *   - md (48px): hero banners
 *   - lg (72px): landing principal, OG images
 *
 * Nota: el bunny/conejo es opcional vía `withBunny` (default true) —
 *       el bunny solo aparece si la altura lo permite.
 */

import { pasion } from "../../lib/brand";

export type PasionesWordmarkSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface PasionesWordmarkProps {
  size?: PasionesWordmarkSize;
  withBunny?: boolean;
  withTagline?: boolean;
  className?: string;
}

const SIZE_MAP: Record<PasionesWordmarkSize, { fontSize: number; taglineSize: number }> = {
  xs: { fontSize: 24, taglineSize: 8 },
  sm: { fontSize: 32, taglineSize: 10 },
  md: { fontSize: 48, taglineSize: 12 },
  lg: { fontSize: 72, taglineSize: 14 },
  xl: { fontSize: 96, taglineSize: 16 },
};

export function PasionesWordmark({
  size = "md",
  withBunny = true,
  withTagline = true,
  className,
}: PasionesWordmarkProps) {
  const { fontSize, taglineSize } = SIZE_MAP[size];

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span
        style={{
          position: "relative",
          display: "inline-block",
          fontFamily: pasion.font.script,
          fontSize,
          fontWeight: pasion.weight.scriptRegular,
          color: pasion.color.hot,
          letterSpacing: "0.01em",
          lineHeight: 1.05,
          textShadow: withBunny ? "0 0 12px rgba(255, 20, 147, 0.25)" : undefined,
        }}
      >
        {/* "Pasiones" — la 'i' lleva bunny encima */}
        <span style={{ position: "relative", display: "inline-block" }}>
          Pas
          <span style={{ position: "relative", display: "inline-block" }}>
            {/* i sin dot — el bunny lo reemplaza */}
            <span style={{ visibility: "hidden" }}>i</span>
            {withBunny && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  top: -fontSize * 0.6,
                  transform: "translateX(-50%)",
                  width: fontSize * 0.85,
                  height: fontSize * 0.85,
                  background: pasion.color.cyan,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  filter: `drop-shadow(0 0 6px ${pasion.color.cyan})`,
                }}
              >
                {/* Bunny silhouette mínima */}
                <span
                  style={{
                    fontSize: fontSize * 0.6,
                    lineHeight: 1,
                    color: "white",
                  }}
                >
                  🐰
                </span>
              </span>
            )}
          </span>
          ones
        </span>

        {/* Lips icon detalle debajo de la palabra — solo md+ */}
        {withBunny && fontSize >= 32 && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              bottom: -taglineSize * 0.5,
              transform: "translateX(-50%)",
              fontSize: taglineSize * 1.8,
              color: pasion.color.hot,
              lineHeight: 1,
            }}
          >
            💋
          </span>
        )}
      </span>

      {withTagline && (
        <span
          style={{
            fontFamily: pasion.font.body,
            fontSize: taglineSize,
            fontWeight: pasion.weight.bodyMedium,
            color: pasion.color.textMuted,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Boutique Sensual
        </span>
      )}
    </span>
  );
}

export default PasionesWordmark;