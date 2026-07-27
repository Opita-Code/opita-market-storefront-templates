// =============================================================================
// Pasiones Boutique Sensual — tokens para admin-tailadmin
// =============================================================================
// TypeScript tokens para componentes admin. Equivalentes a las CSS custom
// properties de globals.css — usar este objeto en componentes sin Tailwind.

export const pasionAdmin = {
  color: {
    hot: "#FF1493",
    hotBright: "#FF5BB0",
    cyan: "#1FE0E0",
    cyanBright: "#5FF5F5",
    pinkPastel: "#FCE4EC",
    cyanPastel: "#E0F7FA",
    gold: "#D4AF37",
    wine: "#6B1A3A",
    lips: "#E91E63",

    // Status colors POS
    verified: "#2E7D32",          // verde oscuro — venta verificada +18
    pendingVerification: "#FF6F00", // naranja — falta verificar edad
    blocked: "#C62828",            // rojo — bloqueado

    text: {
      dark: "#1A1A1A",
      muted: "#6B4A5C",
    },
  },

  font: {
    script: '"Pacifico", "Brush Script MT", cursive',
    display: '"Anton", "Bebas Neue", "Oswald", sans-serif',
    body: '"Montserrat", "Inter", -apple-system, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },

  // Copy específica para admin (vendedores / auditores)
  copy: {
    login: {
      welcome: "Panel administrativo — Pasiones Boutique Sensual",
      subtitle: "Acceso restringido a personal autorizado",
      emailPlaceholder: "Email corporativo",
      passwordPlaceholder: "Contraseña",
      cta: "Iniciar sesión",
      ageReminder: "Recuerda: solo puedes vender a clientes que hayan verificado mayoría de edad.",
    },
    pos: {
      ageVerificationTitle: "Verificación de mayoría de edad",
      ageVerificationBody: "Antes de procesar la venta, confirma que verificaste el documento de identidad del cliente y que es mayor de 18 años (Ley 679/2001, art. 4).",
      ageVerificationCheckbox: "Verifiqué documento de identidad del cliente (mayor de 18 años)",
      saleBlocked: "Debes verificar la edad del cliente para procesar la venta.",
      verifiedBadge: "Venta verificada +18",
      verifiedAt: "Verificada",
    },
    receipt: {
      legalName: "Pasiones Boutique Sensual S.A.S.",
      taxId: "NIT [por confirmar con contadora]",
      ageNotice: "Venta exclusiva a mayores de 18 años · Ley 1336/2009",
      address: "Mall [redacted], Neiva — Huila, Colombia",
      phone: "+57 318 610 7314",
      email: "contacto@pasiones.example.co",
      thanks: "¡Gracias por tu compra!",
      disclaimer: "Empaque discreto garantizado. En tu extracto bancario aparecerá como PB*PASIONES SAS.",
    },
  },
} as const;

export type PasionAdminBrand = typeof pasionAdmin;