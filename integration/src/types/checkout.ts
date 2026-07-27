import type { Currency } from './money.js'

/** Consent texts rendered on the Habeas Data banner. */
export interface ConsentTexts {
  readonly es: string  // required — Colombian Spanish
  readonly en?: string | null  // optional
  readonly pt?: string | null  // optional
  readonly version: string  // YYYY-MM-DD.N
}

/**
 * PUBLIC checkout config — no auth required.
 * Frontends fetch this on page load to render the Ley 1581 banner + configure TTLs.
 */
export interface CheckoutConfig {
  readonly currency: Currency
  readonly reservationTtlMinutes: number  // default 15
  readonly checkoutTtlMinutes: number  // default 30
  readonly habeasDataPolicyUrl: string
  readonly habeasDataPolicyVersion: string
  readonly consentTexts: ConsentTexts
  readonly wompiRefundPolicy: 'external' | 'automatic'
}

export interface DailyReport {
  readonly date: string  // YYYY-MM-DD
  readonly sales: {
    readonly byChannel: Record<'pos' | 'online', number>
    readonly byStatus: Record<string, number>
    readonly total: number
  }
  readonly journalEntries: {
    readonly byKind: Record<string, number>
    readonly totalDebit: number
    readonly totalCredit: number
  }
  readonly refunds: {
    readonly count: number
    readonly total: number
  }
}

export type Locale = 'es-CO' | 'en-US' | 'pt-BR'

export const isLocale = (v: unknown): v is Locale =>
  v === 'es-CO' || v === 'en-US' || v === 'pt-BR'