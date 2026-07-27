/**
 * Money type — all amounts are integer minor units (e.g. centavos for COP).
 * NEVER use float for money. Convert at the UI edge.
 *
 * Backend invariant: amount >= 0, currency ∈ {COP, USD, BRL}.
 */
export type Currency = 'COP' | 'USD' | 'BRL'

export interface Money {
  readonly amountMinor: number
  readonly currency: Currency
}

/** Type guard for currency string (server may return unknown values). */
export const isCurrency = (v: unknown): v is Currency =>
  v === 'COP' || v === 'USD' || v === 'BRL'

/** Tenant id — kebab-case per the OCAIS convention. */
export type TenantId = string & { readonly __brand: 'TenantId' }

/** ISO 8601 timestamp. Backend returns e.g. "2026-07-27T15:30:00.000Z". */
export type IsoDateTime = string & { readonly __brand: 'IsoDateTime' }

/** YYYY-MM-DD date. */
export type IsoDate = string & { readonly __brand: 'IsoDate' }

/** Optimistic concurrency token. Increment by 1 on each successful write. */
export type Version = number & { readonly __brand: 'Version' }