"use client";

/**
 * LegalDisclaimer — disclaimer permanente en footer (Ley 1336/2009).
 *
 * "Venta exclusiva a mayores de 18 años" debe aparecer en TODAS las
 * páginas del sitio. Es la exigencia de la Ley 1336 de 2009 (art. 4)
 * para cualquier establecimiento que comercialice productos sexuales.
 *
 * Implementación:
 *   - Componente pequeño, va en `PasionesFooter`
 *   - Texto bilingüe (es-CO + en-US) para turistas en Neiva
 *   - Link a página /habeas-data + /contacto + advertencia explícita
 */

import { pasion } from "../../lib/brand";

export interface LegalDisclaimerProps {
  locale?: "es-CO" | "en-US" | "pt-BR";
  /** Versión del texto legal (cambia cuando se actualiza la política) */
  version?: string;
}

const COPY = {
  "es-CO": {
    text: "Venta exclusiva a mayores de 18 años. Ley 1336 de 2009.",
    habeasData: "Política de tratamiento de datos personales (Ley 1581/2012)",
    report: "Reportar explotación sexual de menores:",
    hotline: "Línea 018000-91-99-99",
  },
  "en-US": {
    text: "Adults only (18+). Law 1336 of 2009.",
    habeasData: "Personal data processing policy (Law 1581/2012)",
    report: "Report child sexual exploitation:",
    hotline: "Hotline 018000-91-99-99",
  },
  "pt-BR": {
    text: "Venda exclusiva para maiores de 18 anos. Lei 1336 de 2009.",
    habeasData: "Política de tratamento de dados pessoais (Lei 1581/2012)",
    report: "Denunciar exploração sexual de menores:",
    hotline: "Linha 018000-91-99-99",
  },
};

export function LegalDisclaimer({
  locale = "es-CO",
  version = "2026-07-27.2",
}: LegalDisclaimerProps) {
  const t = COPY[locale];

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
        ⚠ {t.text}
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
          {t.habeasData}
        </a>

        <span aria-hidden style={{ color: pasion.color.textMuted }}>·</span>

        <span style={{ color: pasion.color.textMuted }}>
          {t.report}{" "}
          <a
            href="tel:018000919999"
            style={{ color: pasion.color.hot, fontWeight: pasion.weight.bodyBold }}
          >
            {t.hotline}
          </a>
        </span>

        <span aria-hidden style={{ color: pasion.color.textMuted }}>·</span>

        <span style={{ color: pasion.color.textMuted, opacity: 0.7 }}>
          v{version}
        </span>
      </div>
    </div>
  );
}

export default LegalDisclaimer;