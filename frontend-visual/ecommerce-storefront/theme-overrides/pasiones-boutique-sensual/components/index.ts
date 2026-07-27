// =============================================================================
// Pasiones Boutique Sensual — components barrel
// =============================================================================
// Re-exporta todos los componentes del theme override para que el operador
// pueda hacer `import { AgeGate, PasionesHeader } from "@/components/pasion"`
// en vez de importar uno a uno.
//
// Nota: la carpeta física en este repo es `theme-overrides/pasiones-boutique-sensual/components/`
// pero al instalar en el proyecto Next.js, el operador copia estos archivos
// a `src/components/` (o donde prefiera). Este barrel es para el árbol copiado.
// =============================================================================

// Icons
export { BunnyLogo } from "./icons/BunnyLogo";
export { PasionesWordmark } from "./icons/PasionesWordmark";

// Compliance — TODOS deben quedar montados
export { AgeGate } from "./compliance/AgeGate";
export { HabeasDataBanner } from "./compliance/HabeasDataBanner";
export { LegalDisclaimer } from "./compliance/LegalDisclaimer";
export { DiscreteBillingNotice } from "./compliance/DiscreteBillingNotice";

// Layout
export { PasionesHeader } from "./layout/PasionesHeader";
export { PasionesFooter } from "./layout/PasionesFooter";
export { HeroBanner } from "./layout/HeroBanner";

// Products
export { CategoryNav } from "./products/CategoryNav";
export { ProductCard } from "./products/ProductCard";
export type { ProductCardData, ProductCardProps } from "./products/ProductCard";

// Brand tokens (TypeScript)
export { pasion } from "../lib/brand";
export type { PasionBrand } from "../lib/brand";