"use client";

/**
 * HabeasDataBanner — banner de consentimiento informado Ley 1581/2012.
 *
 * Aparece en la primera visita de cada sesión (NO bloqueante — el usuario
 * puede descartarlo). El texto viene de `tenant.yml → consent_text_<locale>`.
 *
 * Compliance:
 *   - El handler de checkout captura `Customer.habeasDataConsent` con
 *     `policyVersion` cuando el cliente confirma un pedido (no cuando hace
 *     click aquí — eso es solo informativo). Ver `CartHandler` en backend.
 *   - Si `consent_text_version` se bumpea en tenant.yml, el siguiente
 *     pedido vuelve a capturar el consentimiento.
 *   - Texto debe ser validado por abogada ANTES del primer deploy.
 *
 * Visual:
 *   - Banner inferior centrado, esquinas suaves, hot pink primario
 *   - Botón "Acepto" graba localStorage + audit log
 *   - Link "Ver política completa" abre URL firmada del PDF
 */

import { useEffect, useState } from "react";
import { pasion } from "../../lib/brand";

export interface HabeasDataBannerProps {
  /** Texto de consentimiento (viene de tenant.yml) */
  consentText: string;
  /** URL de la política completa (PDF firmado en assets.pasiones) */
  policyUrl: string;
  /** Versión de la política (debe coincidir con tenant.yml consent_text_version) */
  policyVersion: string;
  /** Locale */
  locale?: "es-CO" | "en-US" | "pt-BR";
}

const COPY = {
  "es-CO": {
    title: "Tratamiento de datos personales",
    accept: "Acepto",
    reject: "Solo necesarias",
    seeMore: "Ver política completa",
    auditTag: "habeas_data_consent",
  },
  "en-US": {
    title: "Personal data processing",
    accept: "I accept",
    reject: "Required only",
    seeMore: "See full policy",
    auditTag: "habeas_data_consent",
  },
  "pt-BR": {
    title: "Tratamento de dados pessoais",
    accept: "Aceito",
    reject: "Apenas necessárias",
    seeMore: "Ver política completa",
    auditTag: "habeas_data_consent",
  },
};

const STORAGE_KEY = "pasiones-habeas-data";

export function HabeasDataBanner({
  consentText,
  policyUrl,
  policyVersion,
  locale = "es-CO",
}: HabeasDataBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const t = COPY[locale];

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (!stored || stored.policyVersion !== policyVersion) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, [policyVersion]);

  const record = (accepted: boolean) => {
    const entry = {
      accepted,
      policyVersion,
      locale,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    } catch {
      // Safari private — no crítico
    }
    // Audit log local
    try {
      const log = JSON.parse(localStorage.getItem("pasiones-consent-audit") ?? "[]");
      log.push({ ...entry, tag: t.auditTag });
      localStorage.setItem("pasiones-consent-audit", JSON.stringify(log.slice(-20)));
    } catch {
      // No crítico
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label={t.title}
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 9000,
        maxWidth: 640,
        margin: "0 auto",
        backgroundColor: pasion.color.white,
        borderRadius: pasion.radius.lg,
        boxShadow: pasion.shadow.strong,
        padding: "1.25rem 1.5rem",
        borderLeft: `4px solid ${pasion.color.hot}`,
      }}
    >
      <h3
        style={{
          fontFamily: pasion.font.body,
          fontSize: "0.875rem",
          fontWeight: pasion.weight.bodyBold,
          color: pasion.color.hot,
          margin: "0 0 0.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {t.title}
      </h3>

      <p
        style={{
          fontFamily: pasion.font.body,
          fontSize: "0.8125rem",
          color: pasion.color.textDark,
          margin: "0 0 1rem",
          lineHeight: 1.5,
          maxHeight: "8rem",
          overflowY: "auto",
        }}
      >
        {consentText}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => record(true)}
          style={{
            fontFamily: pasion.font.body,
            fontSize: "0.875rem",
            fontWeight: pasion.weight.bodyBold,
            padding: "0.5rem 1rem",
            borderRadius: pasion.radius.md,
            border: "none",
            backgroundColor: pasion.color.hot,
            color: pasion.color.white,
            cursor: "pointer",
          }}
        >
          {t.accept}
        </button>

        <button
          type="button"
          onClick={() => record(false)}
          style={{
            fontFamily: pasion.font.body,
            fontSize: "0.8125rem",
            fontWeight: pasion.weight.bodyMedium,
            padding: "0.5rem 1rem",
            borderRadius: pasion.radius.md,
            border: `1px solid ${pasion.color.textMuted}`,
            backgroundColor: "transparent",
            color: pasion.color.textMuted,
            cursor: "pointer",
          }}
        >
          {t.reject}
        </button>

        <a
          href={policyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: pasion.font.body,
            fontSize: "0.8125rem",
            color: pasion.color.cyan,
            textDecoration: "underline",
            marginLeft: "auto",
          }}
        >
          {t.seeMore} →
        </a>
      </div>
    </div>
  );
}

export default HabeasDataBanner;