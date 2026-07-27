"use client";

/**
 * PasionesReceiptHeader — header del recibo POS (térmico / PDF / email).
 *
 * El recibo es documento legal — debe incluir:
 *   - Razón social + NIT (DIAN)
 *   - Dirección + contacto
 *   - Aviso "Venta exclusiva a mayores de 18 años · Ley 1336/2009"
 *   - Aviso discreto de empaque y descriptor bancario
 *
 * En impresión térmica (80mm), se ajusta a fontSize pequeños.
 * En PDF/email, puede usar la versión full con tipografía script.
 */

import { pasionAdmin } from "../theme/pasionAdminTokens";

export type ReceiptFormat = "thermal" | "pdf" | "email";

export interface PasionesReceiptHeaderProps {
  format?: ReceiptFormat;
  /** Fecha de la venta (ISO) */
  saleDate?: string;
  /** Número de venta / orden */
  saleNumber?: string;
  /** Mostrar avatar Pasiones arriba (solo PDF / email) */
  showLogo?: boolean;
}

export function PasionesReceiptHeader({
  format = "thermal",
  saleDate,
  saleNumber,
  showLogo,
}: PasionesReceiptHeaderProps) {
  const isCompact = format === "thermal";

  return (
    <header
      style={{
        textAlign: "center",
        padding: isCompact ? "0.5rem 0" : "1rem 0",
        borderBottom: `1px dashed ${isCompact ? "#999" : pasionAdmin.color.hot}`,
        marginBottom: isCompact ? "0.5rem" : "1rem",
      }}
    >
      {showLogo && (
        <div
          aria-hidden
          style={{
            display: "inline-block",
            fontSize: "1.5rem",
            marginBottom: 4,
          }}
        >
          🐰
        </div>
      )}

      <h1
        style={{
          fontFamily: isCompact ? pasionAdmin.font.body : pasionAdmin.font.script,
          fontSize: isCompact ? "1.125rem" : "1.75rem",
          fontWeight: 700,
          color: pasionAdmin.color.hot,
          margin: "0 0 0.25rem",
        }}
      >
        Pasiones Boutique Sensual
      </h1>

      <div
        style={{
          fontFamily: pasionAdmin.font.body,
          fontSize: isCompact ? "0.6875rem" : "0.75rem",
          color: "#333",
          lineHeight: 1.4,
        }}
      >
        <p style={{ margin: "0 0 0.125rem", fontWeight: 600 }}>
          {pasionAdmin.copy.receipt.legalName}
        </p>
        <p style={{ margin: "0 0 0.125rem" }}>{pasionAdmin.copy.receipt.taxId}</p>
        {!isCompact && (
          <>
            <p style={{ margin: "0 0 0.125rem" }}>{pasionAdmin.copy.receipt.address}</p>
            <p style={{ margin: "0 0 0.125rem" }}>
              Tel: {pasionAdmin.copy.receipt.phone}
            </p>
            <p style={{ margin: "0 0 0.25rem" }}>{pasionAdmin.copy.receipt.email}</p>
          </>
        )}

        {saleNumber && (
          <p
            style={{
              margin: "0.25rem 0 0",
              paddingTop: 4,
              borderTop: `1px solid ${isCompact ? "#DDD" : pasionAdmin.color.cyanPastel}`,
            }}
          >
            <strong>Venta:</strong> #{saleNumber}
            {saleDate && (
              <>
                {" · "}
                <strong>Fecha:</strong>{" "}
                {new Date(saleDate).toLocaleString("es-CO")}
              </>
            )}
          </p>
        )}
      </div>

      <p
        style={{
          fontFamily: pasionAdmin.font.body,
          fontSize: isCompact ? "0.625rem" : "0.6875rem",
          color: "#666",
          margin: "0.5rem 0 0",
          fontStyle: "italic",
        }}
      >
        ⚠ {pasionAdmin.copy.receipt.ageNotice}
      </p>
    </header>
  );
}

/**
 * PasionesReceiptFooter — pie del recibo (mensaje + descargo de privacidad).
 */
export function PasionesReceiptFooter({ format = "thermal" }: { format?: ReceiptFormat }) {
  const isCompact = format === "thermal";
  return (
    <footer
      style={{
        textAlign: "center",
        padding: isCompact ? "0.5rem 0 0" : "1rem 0 0",
        borderTop: `1px dashed ${isCompact ? "#999" : pasionAdmin.color.cyan}`,
        marginTop: isCompact ? "0.5rem" : "1rem",
        fontFamily: pasionAdmin.font.body,
        fontSize: isCompact ? "0.625rem" : "0.75rem",
        color: "#555",
        lineHeight: 1.4,
      }}
    >
      <p style={{ margin: "0 0 0.25rem", fontWeight: 700, color: pasionAdmin.color.hot }}>
        {pasionAdmin.copy.receipt.thanks}
      </p>
      <p style={{ margin: "0 0 0.25rem", fontStyle: "italic" }}>
        {pasionAdmin.copy.receipt.disclaimer}
      </p>
      {!isCompact && (
        <p style={{ margin: 0 }}>
          Política de tratamiento de datos: habeas_data@pasiones.example.co
        </p>
      )}
    </footer>
  );
}

export default PasionesReceiptHeader;