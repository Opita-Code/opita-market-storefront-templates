"use client";

/**
 * PasionesAdminLogin — pantalla de login para backoffice Pasiones.
 *
 * Reemplaza el form de login default de TailAdmin con identidad Pasiones +
 * aviso Ley 679/2001 (los vendedores deben recordar que solo pueden vender
 * a mayores de 18 años — el recordatorio es visible en el login).
 *
 * Visual:
 *   - Fondo degradado wine → hot pink
 *   - Card centrada, logo Pasiones + bunny + form
 *   - Footer con aviso legal
 */

import { pasionAdmin } from "../theme/pasionAdminTokens";

export interface PasionesAdminLoginProps {
  onSubmit?: (email: string, password: string) => void | Promise<void>;
  errorMessage?: string;
  isLoading?: boolean;
}

export function PasionesAdminLogin({
  onSubmit,
  errorMessage,
  isLoading,
}: PasionesAdminLoginProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(135deg, ${pasionAdmin.color.wine} 0%, ${pasionAdmin.color.hot} 100%)`,
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          backgroundColor: pasionAdmin.color.text.dark === "#1A1A1A" ? "#FFFFFF" : "#FFFFFF",
          borderRadius: "1rem",
          padding: "2.5rem 2rem",
          boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
        }}
      >
        {/* Logo + bunny */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: pasionAdmin.color.cyan,
              margin: "0 auto 1rem",
              filter: `drop-shadow(0 0 16px ${pasionAdmin.color.cyan})`,
              fontSize: "3rem",
            }}
          >
            🐰
          </div>

          <h1
            style={{
              fontFamily: pasionAdmin.font.script,
              fontSize: "2.5rem",
              color: pasionAdmin.color.hot,
              margin: "0 0 0.5rem",
              lineHeight: 1.1,
            }}
          >
            Pasiones
          </h1>

          <p
            style={{
              fontFamily: pasionAdmin.font.body,
              fontSize: "0.875rem",
              fontWeight: 500,
              color: pasionAdmin.color.wine,
              margin: "0 0 0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {pasionAdmin.copy.login.welcome}
          </p>

          <p
            style={{
              fontFamily: pasionAdmin.font.body,
              fontSize: "0.75rem",
              color: pasionAdmin.color.text.muted,
              margin: 0,
            }}
          >
            {pasionAdmin.copy.login.subtitle}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            onSubmit?.(email, password);
          }}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <label>
            <span
              style={{
                display: "block",
                fontFamily: pasionAdmin.font.body,
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: pasionAdmin.color.text.dark,
                marginBottom: 4,
              }}
            >
              {pasionAdmin.copy.login.emailPlaceholder}
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: `1px solid ${pasionAdmin.color.cyanPastel}`,
                backgroundColor: "#FAFAFA",
                fontFamily: pasionAdmin.font.body,
                fontSize: "0.875rem",
              }}
            />
          </label>

          <label>
            <span
              style={{
                display: "block",
                fontFamily: pasionAdmin.font.body,
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: pasionAdmin.color.text.dark,
                marginBottom: 4,
              }}
            >
              {pasionAdmin.copy.login.passwordPlaceholder}
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: `1px solid ${pasionAdmin.color.cyanPastel}`,
                backgroundColor: "#FAFAFA",
                fontFamily: pasionAdmin.font.body,
                fontSize: "0.875rem",
              }}
            />
          </label>

          {errorMessage && (
            <div
              role="alert"
              style={{
                padding: "0.75rem",
                borderRadius: "0.5rem",
                backgroundColor: "#FFE5E5",
                color: pasionAdmin.color.blocked,
                fontFamily: pasionAdmin.font.body,
                fontSize: "0.8125rem",
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: "0.5rem",
              padding: "0.875rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: pasionAdmin.color.hot,
              color: "white",
              fontFamily: pasionAdmin.font.body,
              fontSize: "0.9375rem",
              fontWeight: 700,
              cursor: isLoading ? "wait" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              boxShadow: `0 4px 12px rgba(255, 20, 147, 0.3)`,
            }}
          >
            {isLoading ? "Verificando…" : pasionAdmin.copy.login.cta}
          </button>
        </form>

        {/* Aviso Ley 679/2001 — recordatorio para el vendedor */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "0.875rem",
            borderRadius: "0.5rem",
            backgroundColor: pasionAdmin.color.pinkPastel,
            border: `1px dashed ${pasionAdmin.color.hot}`,
            fontFamily: pasionAdmin.font.body,
            fontSize: "0.75rem",
            color: pasionAdmin.color.wine,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          ⚠️ {pasionAdmin.copy.login.ageReminder}
        </div>
      </div>
    </main>
  );
}

export default PasionesAdminLogin;