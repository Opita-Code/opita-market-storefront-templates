import type { ConsentTexts } from '../types/checkout.js'
import type { Locale } from '../types/checkout.js'
import type { Sale } from '../types/sale.js'
import type { Currency } from '../types/money.js'

/**
 * Habeas Data banner — returns raw HTML + version for the frontend to render.
 *
 * The operator must validate the consent text with a Colombian lawyer before
 * production deployment. The default texts below are AI-drafted (Sprint 6) and
 * need legal review for compliance with Ley 1581/2012 + Decreto 1377/2013.
 *
 * Frontends should NOT modify the consent text. If you need a different policy,
 * bump the version in tenants/<tenant>/tenant.yml and let the system re-capture.
 */
export interface HabeasDataBanner {
  readonly html: string
  readonly version: string  // echoes back what was passed in
  readonly locale: Locale
}

export const getHabeasDataBanner = (
  consentTexts: ConsentTexts,
  locale: Locale
): HabeasDataBanner => {
  const text = locale === 'en-US' && consentTexts.en
    ? consentTexts.en
    : locale === 'pt-BR' && consentTexts.pt
    ? consentTexts.pt
    : consentTexts.es  // fallback to es-CO (required)

  // Sanitize: consent text comes from tenant.yml, which is operator-controlled.
  // We still escape < and > to prevent accidental XSS via copy-paste.
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const html = `
<aside class="habeas-data-banner" data-policy-version="${consentTexts.version}" role="region" aria-label="Data processing policy">
  <h2 class="habeas-data-banner__title">${escapeHtml(headerFor(locale))}</h2>
  <div class="habeas-data-banner__body">${escaped.replace(/\n/g, '<br>')}</div>
  <div class="habeas-data-banner__actions">
    <button type="button" data-action="accept" class="habeas-data-banner__accept">${escapeHtml(acceptLabelFor(locale))}</button>
    <button type="button" data-action="reject" class="habeas-data-banner__reject">${escapeHtml(rejectLabelFor(locale))}</button>
  </div>
</aside>`.trim()

  return { html, version: consentTexts.version, locale }
}

const headerFor = (locale: Locale): string => {
  const headers: Record<Locale, string> = {
    'es-CO': 'Política de Tratamiento de Datos Personales',
    'en-US': 'Personal Data Processing Policy',
    'pt-BR': 'Política de Tratamento de Dados Pessoais'
  }
  return headers[locale]
}

const acceptLabelFor = (locale: Locale): string => {
  const labels: Record<Locale, string> = {
    'es-CO': 'Aceptar',
    'en-US': 'Accept',
    'pt-BR': 'Aceitar'
  }
  return labels[locale]
}

const rejectLabelFor = (locale: Locale): string => {
  const labels: Record<Locale, string> = {
    'es-CO': 'Rechazar',
    'en-US': 'Reject',
    'pt-BR': 'Recusar'
  }
  return labels[locale]
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ============================================================================

/**
 * Receipt text — locale-aware template strings for the printed receipt.
 * The frontend can use these as-is or wrap in their own layout.
 */
export interface ReceiptText {
  readonly header: string
  readonly lineItemLabel: (variantName: string, qty: number, unitPrice: string) => string
  readonly totalLabel: string
  readonly footer: string
}

export const getReceiptText = (sale: Pick<Sale, 'currency'>, locale: Locale): ReceiptText => {
  const headers: Record<Locale, string> = {
    'es-CO': 'RECIBO DE VENTA',
    'en-US': 'SALE RECEIPT',
    'pt-BR': 'RECIBO DE VENDA'
  }
  const totals: Record<Locale, string> = {
    'es-CO': 'TOTAL',
    'en-US': 'TOTAL',
    'pt-BR': 'TOTAL'
  }
  const footers: Record<Locale, string> = {
    'es-CO': 'Gracias por su compra',
    'en-US': 'Thank you for your purchase',
    'pt-BR': 'Obrigado pela sua compra'
  }
  const lineItemTemplates: Record<Locale, (n: string, q: number, p: string) => string> = {
    'es-CO': (n, q, p) => `${n} × ${q} = ${p}`,
    'en-US': (n, q, p) => `${n} × ${q} = ${p}`,
    'pt-BR': (n, q, p) => `${n} × ${q} = ${p}`
  }
  return {
    header: headers[locale],
    lineItemLabel: lineItemTemplates[locale],
    totalLabel: totals[locale],
    footer: footers[locale]
  }
  // Note: `sale.currency` is reserved for future use (e.g. multi-currency totals)
  void (null as unknown as Currency)
}

// ============================================================================

/**
 * Refund reason picker labels.
 */
export const getRefundReasonLabels = (locale: Locale): Record<string, string> => {
  const labels: Record<Locale, Record<string, string>> = {
    'es-CO': {
      damaged: 'Producto dañado en tránsito',
      customerRequest: 'Cliente cambió de opinión',
      defectiveProduct: 'Producto defectuoso',
      wrongItem: 'Producto equivocado',
      other: 'Otro'
    },
    'en-US': {
      damaged: 'Damaged in transit',
      customerRequest: 'Customer changed mind',
      defectiveProduct: 'Defective product',
      wrongItem: 'Wrong item',
      other: 'Other'
    },
    'pt-BR': {
      damaged: 'Produto danificado no transporte',
      customerRequest: 'Cliente mudou de ideia',
      defectiveProduct: 'Produto com defeito',
      wrongItem: 'Produto errado',
      other: 'Outro'
    }
  }
  return labels[locale]
}