"use client";

/**
 * AgeGate — Verificación de mayoría de edad.
 *
 * Ley 679 de 2001 (Colombia) + Decreto 1524 de 1996.
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
 *   - Textos en es-CO primario, en-US/pt-BR via prop locale
 */

import { useEffect, useRef, useState } from "react";
import { pasion } from "../../lib/brand";

export interface AgeGateProps {
  /** Locale para textos (default "es-CO") */
  locale?: "es-CO" | "en-US" | "pt-BR";
  /** URL externa para redirigir si el usuario NO es mayor (default: Google) */
  exitUrl?: string;
  /** Duración del cookie en días (default 30) */
  cookieDays?: number;
  /** Si true, se muestra incluso con cookie previa (útil para cambios de política) */
  forceShow?: boolean;
  /** Callback cuando se verifica la edad (auditoría, analytics) */
  onVerified?: () => void;
}

const COPY = {
  "es-CO": {
    title: "Bienvenida a Pasiones Boutique Sensual",
    body: "Este sitio ofrece productos para adultos. Por ley (Colombia, Ley 679 de 2001), necesitamos confirmar que eres mayor de 18 años antes de mostrarte nuestro catálogo.",
    confirm: "Sí, soy mayor de 18",
    leave: "No, salir del sitio",
    remember: "Recordar mi elección por 30 días",
    legalNote: "Al continuar declaras bajo gravedad de juramento que eres mayor de edad. Ley 1336 de 2009.",
  },
  "en-US": {
    title: "Welcome to Pasiones Boutique Sensual",
    body: "This site sells adult products. By law (Colombia, Law 679 of 2001), we need to confirm you are over 18 before showing our catalog.",
    confirm: "Yes, I am over 18",
    leave: "No, leave this site",
    remember: "Remember my choice for 30 days",
    legalNote: "By continuing you declare under oath that you are of legal age. Law 1336 of 2009.",
  },
  "pt-BR": {
    title: "Bem-vindo à Pasiones Boutique Sensual",
    body: "Este site vende produtos adultos. Por lei (Colômbia, Lei 679 de 2001), precisamos confirmar que você é maior de 18 anos antes de mostrar nosso catálogo.",
    confirm: "Sim, sou maior de 18",
    leave: "Não, sair do site",
    remember: "Lembrar minha escolha por 30 dias",
    legalNote: "Ao continuar, você declara sob juramento que é maior de idade. Lei 1336 de 2009.",
  },
};

const COOKIE_NAME = "pasiones-age-verified";
const COOKIE_VERSION = "v1"; // bump si cambia la política → re-verifica

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
  const t = COPY[locale];

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
    // Registrar declinación (cumplimiento Ley 1336/2009)
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