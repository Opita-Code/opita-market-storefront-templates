import type { Currency, IsoDateTime, TenantId, Version } from './money.js'
import type { HabeasDataConsent } from './cart.js'

/**
 * Sale FSM — 4 states.
 * Transitions:
 *   draft       → completed (POS scan complete / Wompi APPROVED)
 *   completed   → voided    (admin void)
 *   completed   → refunded  (POST /pos/sales/:id/refund OR /orders/:id/refund)
 *
 * Refund guard: status MUST be `completed` to refund.
 */
export type SaleStatus = 'draft' | 'completed' | 'voided' | 'refunded'

export interface SaleLine {
  readonly variantId: string
  readonly quantity: number  // >= 1
  readonly unitPriceAmount: number
}

export interface Sale {
  readonly id: string
  readonly tenantId: TenantId
  readonly branchId: string
  readonly orderId?: string | null
  readonly lines: readonly SaleLine[]
  readonly totalAmount: number
  readonly currency: Currency
  readonly paymentMethod?: 'cash' | 'card' | 'transfer' | 'wompi' | null
  readonly paymentRef?: string | null  // Wompi transaction id or POS ref
  readonly status: SaleStatus
  readonly refundReason?: string | null
  readonly refundedAt?: IsoDateTime | null
  readonly refundedBy?: string | null  // OCAIS sub
  readonly refundsJournalEntryIds?: readonly string[]
  readonly createdAt: IsoDateTime
  readonly version?: Version
}

/**
 * Order FSM — 7 states.
 * Transitions:
 *   pending-payment → paid            (Wompi APPROVED webhook)
 *   paid            → ready-for-pickup (admin mark)
 *   ready-for-pickup → completed      (pickup or 7-day auto)
 *   paid | ready-for-pickup | completed → refunded
 *   pending-payment → cancelled       (Wompi DECLINED/VOIDED/ERROR or 30-min timeout)
 *   paid            → cancelled       (admin force-cancel, rare)
 *
 * Refund guard: status MUST be paid|ready-for-pickup|completed to refund.
 */
export type OrderStatus =
  | 'pending-payment' | 'paid' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'refunded'

export interface Order {
  readonly id: string
  readonly tenantId: TenantId
  readonly customerId: string
  readonly branchId: string
  readonly lines: readonly SaleLine[]
  readonly subtotalAmount?: number
  readonly taxAmount?: number
  readonly totalAmount: number
  readonly currency: Currency
  readonly status: OrderStatus
  readonly wompiTransactionId?: string | null
  readonly checkoutUrl?: string | null
  readonly habeasDataConsent?: HabeasDataConsent | null
  readonly refundReason?: string | null
  readonly refundedAt?: IsoDateTime | null
  readonly refundedBy?: string | null
  readonly saleId?: string | null  // set when Order→Sale emission occurs
  readonly createdAt: IsoDateTime
  readonly version?: Version
}