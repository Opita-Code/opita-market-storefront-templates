"use client";

/**
 * AgeGate — Verificación de mayoría de edad.
 *
 * Marco normativo verificado vía OSINT:
 *   - Constitución Política art. 44 (derechos fundamentales de los niños)
 *   - Ley 679 de 2001 art. 2° ("menor de edad la persona que no ha cumplido los dieciocho años")
 *   - Ley 1336 de 2009 (adiciona y robustece Ley 679/2001; refuerza el aviso obligatorio)
 *
 * Comportamiento:
 *   - Primera visita: muestra modal full-screen, BLOQUEA el resto del sitio
 *   - Visita verificada: persiste cookie `pasiones-age-verified` (30 días)
 *   - Nueva sesión / nueva pestaña sin cookie: re-verificar
 *   - Sin opción de cerrar / saltar — debe ser afirmativo o salir del sitio
 *
 * UX:
 *   - Modal centrado, alto contraste (hot pink + cyan sobre fondo oscuro)
 *   - 3 mensajes clave: declaración de mayoría de edad, aceptar política,
 *     opción de recordar
 *   - Botón "Salir" redirige a Google (cumple "denegación explícita")
 *   - Botón "Soy mayor de 18" graba timestamp + cookie
 *
 * Accesibilidad:
 *   - role="dialog" aria-modal="true" aria-labelledby="age-gate-title"
 *   - focus trap (tab loop)
 *   - Esc NO cierra — debe clickear o tabular al botón
 *   - Textos multi-idioma desde config/legal.ts (es-CO/en-US/pt-BR)
 */

import { useEffect, useRef, useState } from "react";
import { pasion } from "../../lib/brand";
import { LEGAL_COPY, LEGAL_VERSION, type Locale } from "../../config/legal";

export interface AgeGateProps {
  /** Locale para textos (default "es-CO") */
  locale?: Locale;
  /** URL externa para redirigir si el usuario NO es mayor (default: Google) */
  exitUrl?: string;
  /** Duración del cookie en días (default 30) */
  cookieDays?: number;
  /** Si true, se muestra incluso con cookie previa (útil para cambios de política) */
  forceShow?: boolean;
  /** Callback cuando se verifica la edad (auditoría, analytics) */
  onVerified?: () => void;
}

const COOKIE_NAME = "pasiones-age-verified";
// Cookie version tied to LEGAL_VERSION — bump junto con config/legal.ts
const COOKIE_VERSION = LEGAL_VERSION;

export function AgeGate({
  locale = "es-CO",
  exitUrl = "https://www.google.com",
  cookieDays = 30,
  forceShow = false,
  onVerified,
}: AgeGateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [remember, setRemember] = useState(true);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const t = LEGAL_COPY[locale] ?? LEGAL_COPY["es-CO"];

  // Decidir si mostrar el modal al montar
  useEffect(() => {
    const cookies = document.cookie.split(";");
    const verified = cookies
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!verified || forceShow) {
      setIsVisible(true);
      // Lock scroll mientras el modal está abierto
      document.body.style.overflow = "hidden";
    }
  }, [forceShow]);

  // Focus management + focus trap
  useEffect(() => {
    if (!isVisible) return;

    // Mover focus al botón confirmar al abrir
    confirmButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // No permitimos cerrar con Esc — debe clickear "Sí, soy mayor" o "Salir"
        e.preventDefault();
        return;
      }
      if (e.key === "Tab") {
        // Focus trap: solo los 2 botones son focusables
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const handleConfirm = () => {
    // Set cookie
    if (remember) {
      const expires = new Date();
      expires.setDate(expires.getDate() + cookieDays);
      document.cookie = `${COOKIE_NAME}=${COOKIE_VERSION}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
    } else {
      // Cookie de sesión (sin expires = muere al cerrar navegador)
      document.cookie = `${COOKIE_NAME}=${COOKIE_VERSION}; path=/; SameSite=Lax; Secure`;
    }

    // Audit log local (no toca backend)
    try {
      const auditEntry = {
        event: "age_verification_confirmed",
        locale,
        remember,
        timestamp: new Date().toISOString(),
        userAgentHash: hashUserAgent(navigator.userAgent),
      };
      const existing = JSON.parse(localStorage.getItem("pasiones-age-audit") ?? "[]");
      existing.push(auditEntry);
      // Mantener últimas 10 entradas
      localStorage.setItem("pasiones-age-audit", JSON.stringify(existing.slice(-10)));
    } catch {
      // localStorage bloqueado en Safari private — no crítico
    }

    onVerified?.();
    setIsVisible(false);
    document.body.style.overflow = "";
  };

  const handleLeave = () => {
    // Registrar declinación (cumplimiento Ley 679/2001 + Ley 1336/2009 + Const. art. 44)
    try {
      const declination = {
        event: "age_verification_declined",
        locale,
        timestamp: new Date().toISOString(),
        redirectedTo: exitUrl,
      };
      const existing = JSON.parse(localStorage.getItem("pasiones-age-audit") ?? "[]");
      existing.push(declination);
      localStorage.setItem("pasiones-age-audit", JSON.stringify(existing.slice(-10)));
    } catch {
      // No crítico
    }
    window.location.href = exitUrl;
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-body"
      ref={dialogRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: pasion.color.wine,
        backgroundImage: `linear-gradient(135deg, ${pasion.color.wine} 0%, ${pasion.color.hot} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "32rem",
          width: "100%",
          backgroundColor: pasion.color.white,
          borderRadius: pasion.radius.lg,
          padding: "2.5rem 2rem",
          boxShadow: pasion.shadow.strong,
          textAlign: "center",
        }}
      >
        {/* Bunny logo top */}
        <div
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: pasion.color.cyan,
            margin: "0 auto 1.5rem",
            filter: `drop-shadow(0 0 20px ${pasion.color.cyan})`,
          }}
        >
          <span style={{ fontSize: 48, lineHeight: 1 }}>🐰</span>
        </div>

        {/* Title */}
        <h1
          id="age-gate-title"
          style={{
            fontFamily: pasion.font.script,
            fontSize: "2rem",
            color: pasion.color.hot,
            margin: "0 0 1rem",
            lineHeight: 1.2,
          }}
        >
          {t.title}
        </h1>

        {/* Body */}
        <p
          id="age-gate-body"
          style={{
            fontFamily: pasion.font.body,
            fontSize: "1rem",
            color: pasion.color.textDark,
            margin: "0 0 1.5rem",
            lineHeight: 1.5,
          }}
        >
          {t.body}
        </p>

        {/* Remember checkbox */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            margin: "0 auto 1.5rem",
            fontFamily: pasion.font.body,
            fontSize: "0.875rem",
            color: pasion.color.textMuted,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{
              width: 18,
              height: 18,
              accentColor: pasion.color.hot,
              cursor: "pointer",
            }}
          />
          {t.remember}
        </label>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            margin: "0 0 1rem",
          }}
        >
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            style={{
              fontFamily: pasion.font.body,
              fontSize: "1rem",
              fontWeight: pasion.weight.bodyBold,
              padding: "0.875rem 1.5rem",
              borderRadius: pasion.radius.md,
              border: "none",
              backgroundColor: pasion.color.hot,
              color: pasion.color.white,
              cursor: "pointer",
              boxShadow: `0 4px 12px rgba(255, 20, 147, 0.4)`,
              transition: "transform 120ms ease-out",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {t.confirm}
          </button>

          <button
            type="button"
            onClick={handleLeave}
            style={{
              fontFamily: pasion.font.body,
              fontSize: "0.875rem",
              fontWeight: pasion.weight.bodyMedium,
              padding: "0.625rem 1.5rem",
              borderRadius: pasion.radius.md,
              border: `1px solid ${pasion.color.textMuted}`,
              backgroundColor: "transparent",
              color: pasion.color.textMuted,
              cursor: "pointer",
            }}
          >
            {t.leave}
          </button>
        </div>

        {/* Legal footnote */}
        <p
          style={{
            fontFamily: pasion.font.body,
            fontSize: "0.6875rem",
            color: pasion.color.textMuted,
            margin: "1rem 0 0",
            lineHeight: 1.4,
          }}
        >
          {t.legalNote}
        </p>
      </div>
    </div>
  );
}

/**
 * Hash no criptográfico del User-Agent para audit log.
 * Solo usamos para detectar anomalías (ej. mismo UA verifica 100 veces).
 * NO usamos para identificación personal.
 */
function hashUserAgent(ua: string): string {
  let hash = 0;
  for (let i = 0; i < ua.length; i++) {
    hash = ((hash << 5) - hash + ua.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export default AgeGate;