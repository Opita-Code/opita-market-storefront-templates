"use client";

/**
 * AgeVerifiedSaleBadge — badge de "Venta verificada +18".
 *
 * Aparece en:
 *   - El modal de confirmación de venta en el POS
 *   - La línea de detalle de la venta en la lista del backoffice
 *   - El recibo (térmico / PDF / email)
 *
 * Compliance:
 *   - Ley 679/2001 art. 4 — la verificación de edad es obligatoria
 *   - Ley 1336/2009 — el aviso debe ser visible
 *
 * Visual:
 *   - Verde oscuro cuando verificada
 *   - Naranja cuando pendiente verificar (bloquea venta)
 *   - Rojo si el vendedor marcó que NO verificó (alarma)
 */

import { pasionAdmin } from "../theme/pasionAdminTokens";

export type AgeVerificationStatus = "verified" | "pending" | "blocked";

export interface AgeVerifiedSaleBadgeProps {
  status: AgeVerificationStatus;
  verifiedAt?: string;       // ISO timestamp
  verifiedBy?: string;       // vendedor email/id
  showTimestamp?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AgeVerifiedSaleBadge({
  status,
  verifiedAt,
  verifiedBy,
  showTimestamp = false,
  size = "md",
}: AgeVerifiedSaleBadgeProps) {
  const config = {
    verified: {
      bg: pasionAdmin.color.verified,
      fg: "#FFFFFF",
      icon: "✓",
      label: "Venta verificada +18",
      tooltip: "Documento de identidad verificado al cierre de venta",
    },
    pending: {
      bg: pasionAdmin.color.pendingVerification,
      fg: "#FFFFFF",
      icon: "⚠",
      label: "Pendiente verificar edad",
      tooltip: "El vendedor debe confirmar verificación antes de cobrar",
    },
    blocked: {
      bg: pasionAdmin.color.blocked,
      fg: "#FFFFFF",
      icon: "✕",
      label: "Bloqueada — falta verificación",
      tooltip: "La venta no puede procesarse sin verificar la edad",
    },
  }[status];

  const padding = size === "sm" ? "0.25rem 0.5rem" : size === "lg" ? "0.5rem 1rem" : "0.375rem 0.75rem";
  const fontSize = size === "sm" ? "0.6875rem" : size === "lg" ? "0.9375rem" : "0.8125rem";

  return (
    <span
      title={config.tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding,
        borderRadius: "9999px",
        backgroundColor: config.bg,
        color: config.fg,
        fontFamily: pasionAdmin.font.body,
        fontSize,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden>{config.icon}</span>
      <span>{config.label}</span>
      {showTimestamp && verifiedAt && status === "verified" && (
        <span style={{ opacity: 0.85, fontWeight: 500 }}>
          · {new Date(verifiedAt).toLocaleString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          })}
        </span>
      )}
      {showTimestamp && verifiedBy && status === "verified" && (
        <span style={{ opacity: 0.7, fontWeight: 400, fontSize: "0.875em" }}>
          ({verifiedBy})
        </span>
      )}
    </span>
  );
}

export default AgeVerifiedSaleBadge;