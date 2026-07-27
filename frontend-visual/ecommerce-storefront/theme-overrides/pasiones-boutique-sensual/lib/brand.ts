// =============================================================================
// Pasiones Boutique Sensual — brand tokens (TypeScript)
// =============================================================================
// Tokens para usar desde componentes React / Next.js sin Tailwind.
// Si necesitas utilities Tailwind (bg-pasion-hot etc.), usa globals.css.
//
// Equivalencias hex ↔ globals.css (Tailwind v4 oklch):
//   #FF1493 = oklch(0.62 0.27 354)   — primary, hot pink
//   #1FE0E0 = oklch(0.81 0.13 195)   — accent, cyan
//   #FCE4EC = oklch(0.94 0.02 5)     — surface pastel pink
//   #E0F7FA = oklch(0.96 0.02 200)   — surface pastel cyan
//   #D4AF37 = oklch(0.78 0.13 75)    — gold (línea premium)
//   #6B1A3A = oklch(0.34 0.13 5)     — wine (dark mode)
//   #E91E63 = oklch(0.55 0.24 354)   — lips
//
// LEGAL/CONTACT: data legal/compliance/contacto viene de config/legal.ts
// (single source of truth). Si necesitas cambiar teléfono, hotline o citas
// legales, edita SOLO config/legal.ts.
// =============================================================================

import { contact, LEGAL_COPY, LEGAL_VERSION, type Locale } from "../config/legal";

export const pasion = {
  color: {
    hot: "#FF1493",           // hot pink / magenta — CTAs, wordmark
    hotBright: "#FF5BB0",     // hot pink brillante para dark mode
    cyan: "#1FE0E0",          // bunny / focus / links
    cyanBright: "#5FF5F5",    // cyan brillante para dark mode
    pinkPastel: "#FCE4EC",    // surface pastel
    cyanPastel: "#E0F7FA",    // surface cyan pastel
    gold: "#D4AF37",          // línea premium (Curvy)
    wine: "#6B1A3A",          // dark mode background, wine editorial
    lips: "#E91E63",          // lips icon detalle, hover fuerte

    // Texto
    textDark: "#1A1A1A",
    textMuted: "#6B4A5C",
    textLight: "#F5E8EC",
    white: "#FFFFFF",
    black: "#000000",
  },

  font: {
    script: '"Pacifico", "Brush Script MT", cursive',
    display: '"Anton", "Bebas Neue", "Oswald", sans-serif',
    body: '"Montserrat", "Inter", -apple-system, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },

  weight: {
    bodyRegular: 400,
    bodyMedium: 500,
    bodyBold: 700,
    bodyExtraBold: 800,
    displayRegular: 400, // Anton solo tiene 400
    scriptRegular: 400,
  },

  size: {
    // Escala tipográfica coherente con el display
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "2rem",     // 32px
    "4xl": "2.5rem",   // 40px
    "5xl": "3.5rem",   // 56px
    "6xl": "4.5rem",   // 72px
  },

  space: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2.5rem",
    "2xl": "4rem",
    "3xl": "6rem",
  },

  radius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    pill: "9999px",
  },

  shadow: {
    soft: "0 2px 8px rgba(255, 20, 147, 0.08)",
    medium: "0 8px 24px rgba(255, 20, 147, 0.16)",
    strong: "0 16px 48px rgba(255, 20, 147, 0.24)",
    glowCyan: "0 0 24px rgba(31, 224, 224, 0.4)",
    glowHot: "0 0 24px rgba(255, 20, 147, 0.5)",
  },

  motion: {
    durationFast: "120ms",
    durationBase: "240ms",
    durationSlow: "400ms",
    easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  },

  // Voz y copy — para que las landings suenen como Pasiones, no como un
  // SaaS genérico. Estos son los hooks editoriales oficiales.
  copy: {
    tagline: "La sensualidad no tiene talla",
    cta: {
      shop: "Descubrir",
      addToCart: "Añadir al carrito",
      buyNow: "Comprar ahora",
      checkout: "Finalizar pedido",
      seeMore: "Ver más",
      back: "Volver",
    },
    badge: {
      new: "Nuevo",
      sale: "Oferta",
      bestseller: "Más vendido",
      discreet: "Empaque discreto",
      age: "+18",
      curvy: "Curvy",
    },
    categories: {
      lenceria: "Lencería",
      lenceria_ella: "Para Ella",
      lenceria_el: "Para Él",
      lenceria_parejas: "Para Parejas",
      lenceria_curvy: "Línea Curvy",
      juguetes: "Juguetes",
      juguetes_vibradores: "Vibradores",
      juguetes_dildos: "Dildos",
      juguetes_anal: "Anal",
      juguetes_parejas: "Para Parejas",
      juguetes_bullet: "Bullets & Egg",
      cuidado_personal: "Cuidado Personal",
      lubricantes: "Lubricantes",
      masajes: "Aceites & Masajes",
      higiene: "Higiene",
      bondage: "Bondage",
      bondage_basico: "Bondage Básico",
      bondage_avanzado: "Bondage Avanzado",
      wellness: "Wellness & CBD",
      libros_peliculas: "Libros & Películas",
      regalos: "Regalos & Kits",
      regalos_kit_iniciacion: "Kit de Iniciación",
      regalos_aniversario: "Aniversario",
    },
    legal: {
      // Deprecated: prefer LEGAL_COPY from config/legal.ts.
      // Mantenemos estas keys para no romper consumidores antiguos.
      ageDisclaimer: LEGAL_COPY["es-CO"].ageDisclaimer,
      ageModalTitle: "Bienvenida a Pasiones",
      ageModalBody:
        "Este sitio ofrece productos para adultos. Para continuar, confirma que eres mayor de 18 años.",
      ageConfirm: LEGAL_COPY["es-CO"].ageConfirmationLabel,
      ageLeave: "No, salir del sitio",
      discreteNotice: "En tu extracto bancario aparecerá como PB*PASIONES SAS",
      giftWrapping: "Empaque de regalo disponible",
      contactPhone: `Contáctanos ${contact.phone}`,
    },
  },

  // Metadata de la tienda — para SEO + OG
  meta: {
    legalName: "Pasiones Boutique Sensual S.A.S.",
    phone: contact.phone,
    whatsapp: contact.whatsapp,
    whatsappHref: contact.whatsappHref,
    email: contact.email,
    emailHabeasData: contact.habeasEmail,
    emailPrivacy: contact.privacyEmail,
    address: contact.address,
    schedule: "L-V 10:00–20:00 · S 10:00–21:00 · D 12:00–18:00",
    social: {
      instagram: "@pasionesboutiquesensual",
      whatsapp: contact.whatsapp,
    },
  },
} as const;

// Re-export para que consumidores puedan importar todo desde un solo lugar
export { contact, LEGAL_COPY, LEGAL_VERSION } from "../config/legal";
export type { Locale } from "../config/legal";

export type PasionBrand = typeof pasion;