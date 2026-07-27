import type { Currency, IsoDateTime, TenantId } from './money.js'

export type CartStatus = 'active' | 'reserved' | 'expired' | 'converted'

export interface CartItem {
  readonly id: string
  readonly variantId: string
  readonly quantity: number  // >= 1
  readonly unitPriceAmount: number
}

export interface Cart {
  readonly id: string
  readonly tenantId: TenantId
  readonly customerId: string
  readonly branchId: string
  readonly status: CartStatus
  readonly items: readonly CartItem[]
  readonly subtotalAmount?: number
  readonly currency: Currency
  readonly createdAt: IsoDateTime
  readonly expiresAt: IsoDateTime  // 15-min TTL for active, 30-min for reserved
}

/**
 * Habeas Data consent — Ley 1581/2012 Colombia, Decreto 1377/2013.
 * Captured on first cart reservation. Re-captured when policyVersion bumps.
 */
export interface HabeasDataConsent {
  readonly consentedAt: IsoDateTime
  readonly policyVersion: string  // YYYY-MM-DD.N
  readonly policyUrl?: string | null
  readonly ipAddress?: string | null
  readonly userAgent?: string | null
}

/** Customer entity. Created lazily on first cart or order. */
export interface Customer {
  readonly id: string
  readonly tenantId: TenantId
  readonly email: string
  readonly fullName?: string | null
  readonly phone?: string | null
  readonly habeasDataConsent?: HabeasDataConsent | null
  readonly createdAt: IsoDateTime
}