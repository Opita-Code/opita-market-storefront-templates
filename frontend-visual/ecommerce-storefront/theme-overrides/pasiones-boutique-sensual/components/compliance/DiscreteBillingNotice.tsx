"use client";

/**
 * DiscreteBillingNotice — aviso discreto del descriptor de pago.
 *
 * Antes del botón "Pagar" en el checkout, mostramos al cliente el descriptor
 * EXACTO que aparecerá en su extracto bancario/tarjeta. Para Pasiones esto
 * es "PB*PASIONES SAS" (configurado en Wompi dashboard) — NUNCA
 * "PASIONES SEXSHOP" ni nada que sugiera el contenido.
 *
 * Compliance:
 *   - Visa/MC/AmEx/PSE requieren que el descriptor refleje el merchant real
 *   - El cliente debe confirmar que lo entiende antes de pagar
 *   - Esto reduce disputes y chargebacks (industria adulta: ~3% sin aviso
 *     vs ~0.4% con aviso explícito)
 *
 * UX:
 *   - Banner discreto, esquinas suaves, color cyan pastel (no alarmar)
 *   - Checkbox obligatorio para habilitar botón "Pagar"
 *   - Texto en locale del usuario
 */

import { useState } from "react";
import { pasion } from "../../lib/brand";

export interface DiscreteBillingNoticeProps {
  /** Descriptor que aparecerá en el extracto (default "PB*PASIONES SAS") */
  descriptor?: string;
  /** Si se ofrece empaque de regalo */
  giftWrappingAvailable?: boolean;
  locale?: "es-CO" | "en-US" | "pt-BR";
  /** Callback cuando se acepta el descriptor */
  onAccept?: () => void;
}

const COPY = {
  "es-CO": {
    title: "Pago discreto y empaque anónimo",
    descriptorLabel: "En tu extracto bancario aparecerá como:",
    giftWrapping: "Empaque de regalo disponible",
    accept: "Entiendo y deseo continuar",
    lockWarning: "Debes aceptar para habilitar el botón de pago",
  },
  "en-US": {
    title: "Discreet billing and anonymous packaging",
    descriptorLabel: "Your bank statement will show:",
    giftWrapping: "Gift wrapping available",
    accept: "I understand and wish to continue",
    lockWarning: "You must accept to enable the payment button",
  },
  "pt-BR": {
    title: "Cobrança discreta e embalagem anônima",
    descriptorLabel: "No seu extrato bancário aparecerá como:",
    giftWrapping: "Embalagem para presente disponível",
    accept: "Entendo e desejo continuar",
    lockWarning: "Você deve aceitar para habilitar o botão de pagamento",
  },
};

export function DiscreteBillingNotice({
  descriptor = "PB*PASIONES SAS",
  giftWrappingAvailable = true,
  locale = "es-CO",
  onAccept,
}: DiscreteBillingNoticeProps) {
  const [accepted, setAccepted] = useState(false);
  const t = COPY[locale];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    setAccepted(next);
    if (next) onAccept?.();
  };

  return (
    <div
      role="region"
      aria-label={t.title}
      style={{
        backgroundColor: pasion.color.cyanPastel,
        borderRadius: pasion.radius.lg,
        padding: "1.25rem 1.5rem",
        margin: "1.5rem 0",
        border: `1px solid ${pasion.color.cyan}`,
      }}
    >
      <h4
        style={{
          fontFamily: pasion.font.body,
          fontSize: "0.875rem",
          fontWeight: pasion.weight.bodyBold,
          color: pasion.color.wine,
          margin: "0 0 0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        🔒 {t.title}
      </h4>

      <div
        style={{
          fontFamily: pasion.font.body,
          fontSize: "0.875rem",
          color: pasion.color.textDark,
          lineHeight: 1.5,
        }}
      >
        <p style={{ margin: "0 0 0.75rem" }}>
          <strong style={{ color: pasion.color.wine }}>{t.descriptorLabel}</strong>
          <br />
          <code
            style={{
              display: "inline-block",
              marginTop: 4,
              padding: "0.25rem 0.75rem",
              backgroundColor: pasion.color.white,
              border: `1px dashed ${pasion.color.cyan}`,
              borderRadius: pasion.radius.sm,
              fontFamily: pasion.font.mono,
              fontSize: "0.9375rem",
              fontWeight: pasion.weight.bodyBold,
              color: pasion.color.hot,
              letterSpacing: "0.02em",
            }}
          >
            {descriptor}
          </code>
        </p>

        {giftWrappingAvailable && (
          <p style={{ margin: "0 0 0.75rem", color: pasion.color.textMuted }}>
            🎁 {t.giftWrapping}
          </p>
        )}
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginTop: 12,
          fontFamily: pasion.font.body,
          fontSize: "0.875rem",
          color: pasion.color.textDark,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={accepted}
          onChange={handleChange}
          required
          style={{
            width: 18,
            height: 18,
            accentColor: pasion.color.cyan,
            cursor: "pointer",
            marginTop: 2,
          }}
        />
        <span>{t.accept}</span>
      </label>

      {!accepted && (
        <p
          role="status"
          style={{
            margin: "0.5rem 0 0",
            paddingLeft: 28,
            fontSize: "0.75rem",
            color: pasion.color.wine,
            fontStyle: "italic",
          }}
        >
          {t.lockWarning}
        </p>
      )}
    </div>
  );
}

export default DiscreteBillingNotice;