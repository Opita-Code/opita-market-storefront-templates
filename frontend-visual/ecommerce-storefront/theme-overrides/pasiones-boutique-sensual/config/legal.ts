// =============================================================================
// Pasiones Boutique Sensual — legal & contact config (single source of truth)
// =============================================================================
// TODA la data legal/compliance/contacto del tenant vive acá.
// Consumidores:
//   - ecommerce-storefront/theme-overrides: lib/brand.ts, components/compliance/*, components/layout/PasionesHeader.tsx
//   - admin-tailadmin/theme-overrides: components/theme/pasionAdminTokens.ts, components/receipt/PasionesReceiptHeader.tsx
//   - integration: src/i18n/locales.ts (referencias indirectas)
//   - docs/* (compliance-checklist, brand-guide, pos-age-verification-flow)
//   - demo HTMLs en /Temp/opencode/pasiones-demo/*.html
//
// REGLA: si necesitas cambiar un dato legal/contacto, edita SOLO este archivo.
// Las versiones anteriores (018000-91-99-99, +57 318 610 7314, Ley 1336/2009 art. 4)
// fueron removidas porque OSINT (DuckDuckGo + funcionpublica.gov.co + icbf.gov.co)
// demostró que estaban incorrectas:
//   - La línea oficial del ICBF es "01 8000 91 80 80" (Mon-Fri 8am-5pm) y "Línea 141" nacional
//   - El artículo 4 de Ley 1336/2009 trata sobre AUTORREGULACIÓN DE CAFÉ INTERNET,
//     no sobre venta de productos sexuales a mayores de 18 años
//   - El cliente Pasiones facilitó únicamente +57 315 444 5992 como su número oficial

export const LEGAL_VERSION = "2026-07-27.3"; // bump cuando se actualiza la política

export const SUPPORTED_LOCALES = ["es-CO", "en-US", "pt-BR"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

// ---------------------------------------------------------------------------
// Contacto oficial del cliente
// ---------------------------------------------------------------------------
export const contact = {
  // Única línea oficial proporcionada por el cliente
  phone: "+57 315 444 5992",
  phonePretty: "+57 315 444 5992",
  whatsapp: "+57 315 444 5992",
  whatsappHref: "https://wa.me/573154445992",
  email: "contacto@pasiones.example.co",
  habeasEmail: "habeas_data@pasiones.example.co",
  privacyEmail: "privacidad@pasiones.example.co",
  address: "Neiva — Huila, Colombia",
} as const;

// ---------------------------------------------------------------------------
// Marco normativo colombiano verificado (OSINT funcionpublica.gov.co + icbf.gov.co)
// ---------------------------------------------------------------------------
export const legal = {
  // Ley 679 de 2001 — Estatuto contra explotación, pornografía y turismo sexual con menores
  //   Art. 1: Objeto — medidas de protección
  //   Art. 2: "menor de edad la persona que no ha cumplido los dieciocho años"
  //   URL verificada: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=18309
  ley679: {
    year: 2001,
    title: "Ley 679 de 2001",
    article: "Art. 2°",
    summary: "Estatuto para prevenir y contrarrestar la explotación, la pornografía y el turismo sexual con menores",
    minorDefinition: "menor de edad la persona que no ha cumplido los dieciocho años",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=18309",
  },

  // Ley 1336 de 2009 — Adiciona y robustece Ley 679/2001 (turismo, aerolíneas, café internet)
  //   ⚠ Su artículo 4 trata sobre AUTORREGULACIÓN DE CAFÉ INTERNET — NO sobre
  //     venta de productos sexuales. NO la citamos en disclaimers.
  ley1336: {
    year: 2009,
    title: "Ley 1336 de 2009",
    summary: "Adiciona y robustece la Ley 679 de 2001",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=36877",
  },

  // Constitución Política de Colombia
  //   Art. 44: derechos fundamentales de los niños (prevalencia)
  //   "Son derechos fundamentales de los niños: la vida, la integridad física,
  //    la salud y la seguridad social, la alimentación equilibrada..."
  //   URL verificada: https://www.constitucioncolombia.com/titulo-2/capitulo-2/articulo-44
  constitucion44: {
    title: "Constitución Política de Colombia — Art. 44",
    summary: "Derechos fundamentales de los niños (prevalencia sobre los demás)",
    url: "https://www.constitucioncolombia.com/titulo-2/capitulo-2/articulo-44",
  },

  // Ley 1581 de 2012 — Habeas Data / protección datos personales
  ley1581: {
    year: 2012,
    title: "Ley 1581 de 2012",
    summary: "Habeas Data — protección de datos personales",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981",
  },

  // Ley 2300 de 2023 — "Dejen de fregar" — intimidad del consumidor, opt-in marketing
  ley2300: {
    year: 2023,
    title: "Ley 2300 de 2023",
    summary: "Protección del derecho a la intimidad de los consumidores (opt-in comunicaciones)",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=213990",
  },

  // Línea oficial del ICBF (verificada en icbf.gov.co)
  //   - "01 8000 91 80 80" — Línea gratuita nacional ICBF (L-V 8am-5pm)
  //   - "Línea 141" — Nacional para protección, emergencia y orientación
  icbfHotlines: {
    main: "01 8000 91 80 80",
    mainHref: "tel:018000918080",
    emergency: "Línea 141",
    emergencyHref: "tel:141",
    note: "Línea gratuita nacional del Instituto Colombiano de Bienestar Familiar (ICBF)",
  },
} as const;

// ---------------------------------------------------------------------------
// Copy legal multilingüe (es-CO primario, en-US/pt-BR traducciones)
// ---------------------------------------------------------------------------
export const LEGAL_COPY: Record<Locale, {
  ageDisclaimer: string;
  ageFull: string;
  ageAffirmationTitle: string;
  ageAffirmationBody: string;
  habeasLink: string;
  reportMinorsLabel: string;
  hotlineLabel: string;
  hotlineTel: string;
  ageGateLegalNote: string;
  topbarText: string;
  ageConfirmationLabel: string;
}> = {
  "es-CO": {
    ageDisclaimer: "Venta exclusiva a mayores de 18 años",
    // Combina Constitución art. 44 + Ley 679/2001 art. 2 (definición de menor)
    ageFull: "Venta exclusiva a mayores de 18 años. Constitución Política art. 44 y Ley 679 de 2001 art. 2°.",
    ageAffirmationTitle: "Declaración jurada de mayoría de edad",
    ageAffirmationBody:
      "Declaro bajo la gravedad del juramento, en cumplimiento de la Constitución Política (art. 44) y la Ley 679 de 2001 (art. 2°), que soy mayor de 18 años, que los productos adquiridos son para uso personal de un adulto, y que NO estoy comprando en nombre de un menor de edad. Entiendo que la explotación sexual comercial de menores es un delito en Colombia (Ley 679 de 2001, Ley 1336 de 2009) y que Pasiones Boutique Sensual S.A.S. reportará cualquier sospecha al ICBF.",
    habeasLink: "Política de tratamiento de datos personales (Ley 1581 de 2012)",
    reportMinorsLabel: "Reportar explotación sexual de menores (ICBF):",
    hotlineLabel: "Línea ICBF",
    hotlineTel: legal.icbfHotlines.main,
    ageGateLegalNote:
      "Al continuar declaras bajo gravedad de juramento que eres mayor de 18 años, conforme a la Constitución Política art. 44 y la Ley 679 de 2001 art. 2°.",
    topbarText: `Envío discreto a todo Colombia · Contáctanos ${contact.phone}`,
    ageConfirmationLabel: "Sí, soy mayor de 18",
  },
  "en-US": {
    ageDisclaimer: "Adults only (18+)",
    ageFull: "Adults only (18+). Colombian Constitution art. 44 and Law 679 of 2001 art. 2.",
    ageAffirmationTitle: "Age of majority affirmation",
    ageAffirmationBody:
      "I declare under oath, in compliance with the Colombian Constitution (art. 44) and Law 679 of 2001 (art. 2), that I am over 18 years old, that the products purchased are for personal adult use, and that I am NOT purchasing on behalf of a minor. I understand that commercial sexual exploitation of minors is a crime in Colombia (Law 679/2001, Law 1336/2009) and that Pasiones Boutique Sensual S.A.S. will report any suspicion to ICBF.",
    habeasLink: "Personal data processing policy (Law 1581 of 2012)",
    reportMinorsLabel: "Report child sexual exploitation (ICBF):",
    hotlineLabel: "ICBF Hotline",
    hotlineTel: legal.icbfHotlines.main,
    ageGateLegalNote:
      "By continuing, you declare under oath that you are over 18, in accordance with the Colombian Constitution art. 44 and Law 679 of 2001 art. 2.",
    topbarText: `Discrete shipping across Colombia · Contact ${contact.phone}`,
    ageConfirmationLabel: "Yes, I am over 18",
  },
  "pt-BR": {
    ageDisclaimer: "Venda exclusiva para maiores de 18 anos",
    ageFull: "Venda exclusiva para maiores de 18 anos. Constituição Política art. 44 e Lei 679 de 2001 art. 2°.",
    ageAffirmationTitle: "Declaração de maioridade",
    ageAffirmationBody:
      "Declaro sob juramento, em cumprimento da Constituição Política (art. 44) e da Lei 679 de 2001 (art. 2°), que sou maior de 18 anos, que os produtos adquiridos são para uso pessoal de um adulto e que NÃO estou comprando em nome de um menor. Entendo que a exploração sexual comercial de menores é crime na Colômbia (Lei 679/2001, Lei 1336/2009) e que a Pasiones Boutique Sensual S.A.S. reportará qualquer suspeita ao ICBF.",
    habeasLink: "Política de tratamento de dados pessoais (Lei 1581 de 2012)",
    reportMinorsLabel: "Denunciar exploração sexual de menores (ICBF):",
    hotlineLabel: "Linha ICBF",
    hotlineTel: legal.icbfHotlines.main,
    ageGateLegalNote:
      "Ao continuar, você declara sob juramento que é maior de 18 anos, conforme a Constituição Política art. 44 e a Lei 679 de 2001 art. 2°.",
    topbarText: `Envio discreto para toda Colômbia · Contato ${contact.phone}`,
    ageConfirmationLabel: "Sim, sou maior de 18",
  },
};

// ---------------------------------------------------------------------------
// Resolved helpers — para no tener que importar el Record<> en cada sitio
// ---------------------------------------------------------------------------
export const getLegalCopy = (locale: Locale = "es-CO") => LEGAL_COPY[locale];