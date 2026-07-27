"use client";

/**
 * LegalDisclaimer — disclaimer permanente en footer.
 *
 * Marco normativo colombiano verificado vía OSINT:
 *   - Constitución Política art. 44 (derechos fundamentales de los niños)
 *   - Ley 679 de 2001 art. 2° (definición de menor de edad = < 18 años)
 *   - Ley 1336 de 2009 (adiciona y robustece Ley 679)
 *   - Ley 1581 de 2012 (Habeas Data)
 *
 * Texto, hotline, contact phone: importados de config/legal.ts (single source).
 * Si necesitas cambiar hotline o teléfono, edita SOLO config/legal.ts.
 */

import { pasion } from "../../lib/brand";
import {
  LEGAL_COPY,
  LEGAL_VERSION,
  legal,
  SUPPORTED_LOCALES,
  type Locale,
} from "../../config/legal";

export interface LegalDisclaimerProps {
  locale?: Locale;
  /** Versión del texto legal (default: LEGAL_VERSION de config/legal.ts) */
  version?: string;
}

export function LegalDisclaimer({
  locale = "es-CO",
  version,
}: LegalDisclaimerProps) {
  const t = LEGAL_COPY[locale] ?? LEGAL_COPY["es-CO"];
  const effectiveVersion = version ?? LEGAL_VERSION;

  return (
    <div
      role="contentinfo"
      aria-label="Aviso legal"
      style={{
        fontFamily: pasion.font.body,
        fontSize: "0.75rem",
        color: pasion.color.textMuted,
        padding: "1rem 0",
        borderTop: `1px solid ${pasion.color.border ?? "#EFE5E8"}`,
      }}
    >
      <p
        style={{
          margin: "0 0 0.5rem",
          fontWeight: pasion.weight.bodyBold,
          color: pasion.color.wine,
          textAlign: "center",
        }}
      >
        ⚠ {t.ageFull}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "0.5rem 1.5rem",
          alignItems: "center",
        }}
      >
        <a
          href="/habeas-data"
          style={{ color: pasion.color.cyan, textDecoration: "underline" }}
        >
          {t.habeasLink}
        </a>

        <span aria-hidden style={{ color: pasion.color.textMuted }}>·</span>

        <span style={{ color: pasion.color.textMuted }}>
          {t.reportMinorsLabel}{" "}
          <a
            href={legal.icbfHotlines.mainHref}
            style={{ color: pasion.color.hot, fontWeight: pasion.weight.bodyBold }}
          >
            {t.hotlineLabel} {t.hotlineTel}
          </a>
        </span>

        <span aria-hidden style={{ color: pasion.color.textMuted }}>·</span>

        <span style={{ color: pasion.color.textMuted, opacity: 0.7 }}>
          v{effectiveVersion}
        </span>
      </div>
    </div>
  );
}

export default LegalDisclaimer;

// Re-export locales para consumidores
export { SUPPORTED_LOCALES };
export type { Locale };