"use client";

/**
 * BunnyLogo — marca icónica de Pasiones Boutique Sensual.
 *
 * Conejo estilizado en cyan (#1FE0E0) con highlights blancos, en referencia
 * a la imagen 1 (local físico). Vector puro para escalar a cualquier tamaño.
 *
 * Modos:
 *   - default: bunny completo en cyan con glow sutil
 *   - minimal: silueta plana, ideal para favicon / loading
 *   - animated: bunny con pulse cyan (usa animation CSS .animate-pasion-pulse-cyan)
 *
 * Nota: NO usar con palabras como "PLAYBOY" o referencia explícita. La marca
 * es conejo + Pasiones script — independiente y original.
 */

import { pasion } from "../../lib/brand";

export type BunnyLogoVariant = "default" | "minimal" | "animated";

export interface BunnyLogoProps {
  variant?: BunnyLogoVariant;
  size?: number; // px
  glow?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function BunnyLogo({
  variant = "default",
  size = 48,
  glow = false,
  className,
  ariaLabel = "Pasiones Boutique Sensual",
}: BunnyLogoProps) {
  const fill = pasion.color.cyan;
  const stroke = pasion.color.white;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel}
      className={`${className ?? ""} ${variant === "animated" ? "animate-pasion-pulse-cyan" : ""}`}
      style={
        glow
          ? { filter: `drop-shadow(0 0 12px ${pasion.color.cyan})` }
          : undefined
      }
    >
      {/* Conejo estilizado — silueta simétrica bunny ears + face mask */}
      <g fill={fill} stroke={stroke} strokeWidth="0.5">
        {/* Oreja izquierda */}
        <path d="M 18 8 Q 16 6 14 10 Q 12 18 16 26 L 24 28 Q 26 20 24 12 Q 22 8 18 8 Z" />
        {/* Oreja derecha */}
        <path d="M 46 8 Q 48 6 50 10 Q 52 18 48 26 L 40 28 Q 38 20 40 12 Q 42 8 46 8 Z" />
        {/* Cara (máscara estilizada) */}
        <ellipse cx="32" cy="38" rx="22" ry="14" />
        {/* Highlight interno de las orejas */}
        <ellipse cx="20" cy="16" rx="3" ry="6" fill={stroke} opacity="0.85" />
        <ellipse cx="44" cy="16" rx="3" ry="6" fill={stroke} opacity="0.85" />
      </g>

      {/* Ojos — minimal */}
      {variant !== "minimal" && (
        <g fill={pasion.color.textDark}>
          <ellipse cx="24" cy="36" rx="2.5" ry="3" />
          <ellipse cx="40" cy="36" rx="2.5" ry="3" />
          {/* Brillo en los ojos */}
          <circle cx="24.5" cy="35" r="0.7" fill={stroke} />
          <circle cx="40.5" cy="35" r="0.7" fill={stroke} />
        </g>
      )}

      {/* Nariz/boca — solo variant default */}
      {variant === "default" && (
        <g fill={pasion.color.lips}>
          <path d="M 30 42 Q 32 44 34 42 L 32 45 Z" />
        </g>
      )}
    </svg>
  );
}

export default BunnyLogo;