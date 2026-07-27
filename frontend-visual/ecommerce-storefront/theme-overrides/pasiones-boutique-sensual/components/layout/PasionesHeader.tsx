"use client";

/**
 * PasionesHeader — header sticky con identidad visual Pasiones.
 *
 * Estructura:
 *   - Top bar fina (anuncio "Envío discreto a todo Colombia" / WhatsApp)
 *   - Main bar con logo + nav + carrito + lang switcher + theme toggle
 *   - Sticky al hacer scroll (shadow al hacer scroll)
 *
 * Visual:
 *   - Logo (BunnyLogo + wordmark) a la izquierda
 *   - Categorías centradas (mega menu en desktop, hamburger en mobile)
 *   - Wishlist + Cart + LangSwitcher a la derecha
 *   - Toggle dark mode (sun/moon)
 */

import { useEffect, useState } from "react";
import { pasion } from "../../lib/brand";
import { BunnyLogo } from "../icons/BunnyLogo";
import { PasionesWordmark } from "../icons/PasionesWordmark";
import { LEGAL_COPY, type Locale } from "../../config/legal";

export interface PasionesHeaderProps {
  locale?: Locale;
  cartItemCount?: number;
  wishlistItemCount?: number;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onLocaleChange?: (locale: Locale) => void;
}

// TOPBAR text — incluye el teléfono oficial del cliente (config/legal.ts).
// Cambiar el teléfono en config/legal.ts se refleja automáticamente en los 3 locales.
const TOPBAR_COPY = {
  "es-CO": LEGAL_COPY["es-CO"].topbarText,
  "en-US": LEGAL_COPY["en-US"].topbarText,
  "pt-BR": LEGAL_COPY["pt-BR"].topbarText,
};

const NAV_ITEMS = [
  { key: "lenceria", label: pasion.copy.categories.lenceria, href: "/catalogo/lenceria" },
  { key: "lenceria_curvy", label: pasion.copy.categories.lenceria_curvy, href: "/catalogo/lenceria-curvy", highlight: true },
  { key: "juguetes", label: pasion.copy.categories.juguetes, href: "/catalogo/juguetes" },
  { key: "cuidado_personal", label: pasion.copy.categories.cuidado_personal, href: "/catalogo/cuidado-personal" },
  { key: "bondage", label: pasion.copy.categories.bondage, href: "/catalogo/bondage" },
  { key: "wellness", label: pasion.copy.categories.wellness, href: "/catalogo/wellness" },
  { key: "regalos", label: pasion.copy.categories.regalos, href: "/catalogo/regalos" },
];

export function PasionesHeader({
  locale = "es-CO",
  cartItemCount = 0,
  wishlistItemCount = 0,
  onCartClick,
  onWishlistClick,
  onLocaleChange,
}: PasionesHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("pasiones-theme");
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("pasiones-theme", next);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: pasion.color.white,
        boxShadow: scrolled ? pasion.shadow.medium : "none",
        transition: `box-shadow ${pasion.motion.durationBase} ${pasion.motion.easeOut}`,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          backgroundColor: pasion.color.wine,
          color: pasion.color.textLight,
          padding: "0.375rem 1rem",
          fontFamily: pasion.font.body,
          fontSize: "0.75rem",
          textAlign: "center",
          letterSpacing: "0.02em",
        }}
      >
        {TOPBAR_COPY[locale]}
      </div>

      {/* Main bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.5rem",
          gap: 16,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <BunnyLogo size={36} variant="animated" />
          <PasionesWordmark size="sm" withBunny={false} withTagline={false} />
        </a>

        {/* Nav (desktop) */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flex: 1,
            justifyContent: "center",
          }}
          className="pasiones-nav-desktop"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              style={{
                fontFamily: pasion.font.body,
                fontSize: "0.875rem",
                fontWeight: item.highlight ? pasion.weight.bodyBold : pasion.weight.bodyMedium,
                color: item.highlight ? pasion.color.gold : pasion.color.textDark,
                textDecoration: "none",
                padding: "0.5rem 0.75rem",
                borderRadius: pasion.radius.sm,
                position: "relative",
              }}
            >
              {item.label}
              {item.highlight && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 4,
                    fontSize: "0.625rem",
                    color: pasion.color.hot,
                  }}
                >
                  ✨
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              backgroundColor: pasion.color.pinkPastel,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* Locale switcher */}
          <select
            value={locale}
            onChange={(e) => onLocaleChange?.(e.target.value as "es-CO" | "en-US" | "pt-BR")}
            style={{
              fontFamily: pasion.font.body,
              fontSize: "0.75rem",
              padding: "0.375rem 0.5rem",
              border: `1px solid ${pasion.color.textMuted}`,
              borderRadius: pasion.radius.sm,
              backgroundColor: pasion.color.white,
              cursor: "pointer",
              color: pasion.color.textDark,
            }}
          >
            <option value="es-CO">🇨🇴 ES</option>
            <option value="en-US">🇺🇸 EN</option>
            <option value="pt-BR">🇧🇷 PT</option>
          </select>

          {/* Wishlist */}
          <button
            type="button"
            onClick={onWishlistClick}
            aria-label="Wishlist"
            style={{
              position: "relative",
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            💕
            {wishlistItemCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: pasion.color.hot,
                  color: pasion.color.white,
                  fontSize: "0.625rem",
                  fontWeight: pasion.weight.bodyBold,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                {wishlistItemCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            type="button"
            onClick={onCartClick}
            aria-label="Carrito"
            style={{
              position: "relative",
              padding: "0.5rem 1rem",
              borderRadius: pasion.radius.md,
              border: "none",
              backgroundColor: pasion.color.hot,
              color: pasion.color.white,
              cursor: "pointer",
              fontFamily: pasion.font.body,
              fontSize: "0.875rem",
              fontWeight: pasion.weight.bodyBold,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🛒 Carrito
            {cartItemCount > 0 && (
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: pasion.color.white,
                  color: pasion.color.hot,
                  fontSize: "0.75rem",
                  fontWeight: pasion.weight.bodyExtraBold,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 6px",
                }}
              >
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default PasionesHeader;