"use client";

/**
 * PasionesFooter — footer completo con identidad Pasiones.
 *
 * Estructura:
 *   - Newsletter signup (3 columnas en desktop, apilado en mobile)
 *   - Links principales (categorías + soporte + legal)
 *   - Datos de contacto (dirección, horario, WhatsApp)
 *   - LegalDisclaimer (Ley 1336/2009) — OBLIGATORIO
 *   - Copyright + powered-by
 */

import { pasion } from "../../lib/brand";
import { LegalDisclaimer } from "../compliance/LegalDisclaimer";
import { PasionesWordmark } from "../icons/PasionesWordmark";

export interface PasionesFooterProps {
  locale?: "es-CO" | "en-US" | "pt-BR";
}

const COPY = {
  "es-CO": {
    newsletterTitle: "Únete al club Pasiones",
    newsletterBody: "Promociones exclusivas, nuevos lanzamientos y eventos especiales. Cero spam, solo cosas buenas.",
    newsletterPlaceholder: "tu@correo.com",
    newsletterCta: "Suscribirme",
    contactTitle: "Contáctanos",
    legalTitle: "Información legal",
    followTitle: "Síguenos",
    hours: "Horario",
    address: "Dirección",
    copyright: "© 2026 Pasiones Boutique Sensual S.A.S. — Todos los derechos reservados.",
    poweredBy: "Plataforma: opita.market",
    links: {
      habeasData: "Habeas Data (Ley 1581/2012)",
      terms: "Términos y condiciones",
      privacy: "Política de privacidad",
      shipping: "Política de envío",
      returns: "Cambios y devoluciones",
      faq: "Preguntas frecuentes",
      about: "Sobre nosotros",
      stores: "Nuestras tiendas",
    },
  },
  "en-US": {
    newsletterTitle: "Join the Pasiones club",
    newsletterBody: "Exclusive promos, new launches, and special events. Zero spam, only good stuff.",
    newsletterPlaceholder: "you@email.com",
    newsletterCta: "Subscribe",
    contactTitle: "Contact us",
    legalTitle: "Legal info",
    followTitle: "Follow us",
    hours: "Hours",
    address: "Address",
    copyright: "© 2026 Pasiones Boutique Sensual S.A.S. — All rights reserved.",
    poweredBy: "Platform: opita.market",
    links: {
      habeasData: "Habeas Data (Law 1581/2012)",
      terms: "Terms and conditions",
      privacy: "Privacy policy",
      shipping: "Shipping policy",
      returns: "Returns and exchanges",
      faq: "FAQ",
      about: "About us",
      stores: "Our stores",
    },
  },
  "pt-BR": {
    newsletterTitle: "Junte-se ao clube Pasiones",
    newsletterBody: "Promoções exclusivas, novos lançamentos e eventos especiais. Zero spam, só coisas boas.",
    newsletterPlaceholder: "seu@email.com",
    newsletterCta: "Assinar",
    contactTitle: "Fale conosco",
    legalTitle: "Informações legais",
    followTitle: "Siga-nos",
    hours: "Horário",
    address: "Endereço",
    copyright: "© 2026 Pasiones Boutique Sensual S.A.S. — Todos os direitos reservados.",
    poweredBy: "Plataforma: opita.market",
    links: {
      habeasData: "Habeas Data (Lei 1581/2012)",
      terms: "Termos e condições",
      privacy: "Política de privacidade",
      shipping: "Política de envio",
      returns: "Trocas e devoluções",
      faq: "Perguntas frequentes",
      about: "Sobre nós",
      stores: "Nossas lojas",
    },
  },
};

export function PasionesFooter({ locale = "es-CO" }: PasionesFooterProps) {
  const t = COPY[locale];

  return (
    <footer
      style={{
        backgroundColor: pasion.color.wine,
        color: pasion.color.textLight,
        marginTop: "4rem",
      }}
    >
      {/* Main grid */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "3rem 1.5rem 2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Column 1 — Brand + Newsletter */}
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <PasionesWordmark size="sm" withBunny={true} withTagline={false} />
          </div>
          <h4
            style={{
              fontFamily: pasion.font.body,
              fontSize: "1rem",
              fontWeight: pasion.weight.bodyBold,
              margin: "1rem 0 0.5rem",
              color: pasion.color.cyan,
            }}
          >
            {t.newsletterTitle}
          </h4>
          <p
            style={{
              fontFamily: pasion.font.body,
              fontSize: "0.875rem",
              margin: "0 0 1rem",
              opacity: 0.85,
              lineHeight: 1.5,
            }}
          >
            {t.newsletterBody}
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              type="email"
              placeholder={t.newsletterPlaceholder}
              required
              style={{
                flex: 1,
                minWidth: 0,
                padding: "0.625rem 0.75rem",
                borderRadius: pasion.radius.md,
                border: "none",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: pasion.color.textLight,
                fontFamily: pasion.font.body,
                fontSize: "0.875rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.625rem 1rem",
                borderRadius: pasion.radius.md,
                border: "none",
                backgroundColor: pasion.color.hot,
                color: pasion.color.white,
                fontFamily: pasion.font.body,
                fontSize: "0.875rem",
                fontWeight: pasion.weight.bodyBold,
                cursor: "pointer",
              }}
            >
              {t.newsletterCta}
            </button>
          </form>
        </div>

        {/* Column 2 — Categorías */}
        <div>
          <h4
            style={{
              fontFamily: pasion.font.body,
              fontSize: "1rem",
              fontWeight: pasion.weight.bodyBold,
              margin: "0 0 1rem",
              color: pasion.color.cyan,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Categorías
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {Object.entries(pasion.copy.categories)
              .filter(([key]) => key.includes("_") === false) // solo top-level
              .map(([key, label]) => (
                <li key={key} style={{ marginBottom: "0.5rem" }}>
                  <a
                    href={`/catalogo/${key}`}
                    style={{
                      color: pasion.color.textLight,
                      textDecoration: "none",
                      fontFamily: pasion.font.body,
                      fontSize: "0.875rem",
                      opacity: 0.85,
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
          </ul>
        </div>

        {/* Column 3 — Legal */}
        <div>
          <h4
            style={{
              fontFamily: pasion.font.body,
              fontSize: "1rem",
              fontWeight: pasion.weight.bodyBold,
              margin: "0 0 1rem",
              color: pasion.color.cyan,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {t.legalTitle}
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {Object.entries(t.links).map(([key, label]) => (
              <li key={key} style={{ marginBottom: "0.5rem" }}>
                <a
                  href={`/${key}`}
                  style={{
                    color: pasion.color.textLight,
                    textDecoration: "none",
                    fontFamily: pasion.font.body,
                    fontSize: "0.875rem",
                    opacity: 0.85,
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4 — Contacto */}
        <div>
          <h4
            style={{
              fontFamily: pasion.font.body,
              fontSize: "1rem",
              fontWeight: pasion.weight.bodyBold,
              margin: "0 0 1rem",
              color: pasion.color.cyan,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {t.contactTitle}
          </h4>
          <div
            style={{
              fontFamily: pasion.font.body,
              fontSize: "0.875rem",
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>WhatsApp:</strong>{" "}
              <a
                href={`https://wa.me/${pasion.meta.phone.replace(/\D/g, "")}`}
                style={{ color: pasion.color.cyan }}
              >
                {pasion.meta.phone}
              </a>
            </p>
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${pasion.meta.email}`} style={{ color: pasion.color.cyan }}>
                {pasion.meta.email}
              </a>
            </p>
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>{t.address}:</strong>
              <br />
              {pasion.meta.address}
            </p>
            <p style={{ margin: 0 }}>
              <strong>{t.hours}:</strong>
              <br />
              {pasion.meta.schedule}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.25)",
          padding: "1rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontFamily: pasion.font.body,
            fontSize: "0.75rem",
            color: pasion.color.textLight,
            opacity: 0.8,
          }}
        >
          <span>{t.copyright}</span>
          <span>
            {t.poweredBy} · Pasiones v0.1.0
          </span>
        </div>

        <div style={{ maxWidth: 1400, margin: "1rem auto 0" }}>
          <LegalDisclaimer locale={locale} />
        </div>
      </div>
    </footer>
  );
}

export default PasionesFooter;