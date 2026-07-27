import type { Sale, SaleStatus, Order, OrderStatus } from '../types/sale.js'
import type { Cart, CartStatus } from '../types/cart.js'

/**
 * Sale FSM — 4 states.
 * Source of truth: ../backend/docs/fsm.md
 *
 *   draft     ──complete──► completed ──void──► voided
 *                          completed ──refund──► refunded
 */
export type SaleTransition = {
  readonly to: SaleStatus
  readonly label: string  // i18n key
  readonly permission?: string
  readonly requiresReason?: boolean
}

const SALE_TRANSITIONS: Record<SaleStatus, readonly SaleTransition[]> = {
  draft: [
    { to: 'completed', label: 'sale.complete', permission: 'pos.sale.create' }
  ],
  completed: [
    { to: 'voided', label: 'sale.void', permission: 'sale.void', requiresReason: true },
    { to: 'refunded', label: 'sale.refund', permission: 'sale.refund', requiresReason: true }
  ],
  voided: [],
  refunded: []
}

export const saleNextStates = (sale: Pick<Sale, 'status'>): readonly SaleTransition[] =>
  SALE_TRANSITIONS[sale.status]

export const canRefundSale = (sale: Pick<Sale, 'status'>): boolean =>
  sale.status === 'completed'

export const canVoidSale = (sale: Pick<Sale, 'status'>): boolean =>
  sale.status === 'completed'

/**
 * Order FSM — 7 states.
 * Source of truth: ../backend/docs/fsm.md
 *
 *   pending-payment ──paid──► paid ──ready──► ready-for-pickup ──pickup──► completed
 *                                          paid|ready|completed ──refund──► refunded
 *   pending-payment ──decline/timeout──► cancelled
 *   paid ──force-cancel──► cancelled
 */
export type OrderTransition = {
  readonly to: OrderStatus
  readonly label: string
  readonly permission?: string
  readonly requiresReason?: boolean
}

const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderTransition[]> = {
  'pending-payment': [],  // transitions are webhook-driven, not user-driven
  paid: [
    { to: 'ready-for-pickup', label: 'order.markReady', permission: 'order.update' },
    { to: 'cancelled', label: 'order.cancel', permission: 'order.update', requiresReason: true },
    { to: 'refunded', label: 'order.refund', permission: 'order.refund', requiresReason: true }
  ],
  'ready-for-pickup': [
    { to: 'completed', label: 'order.complete', permission: 'order.update' },
    { to: 'refunded', label: 'order.refund', permission: 'order.refund', requiresReason: true }
  ],
  completed: [
    { to: 'refunded', label: 'order.refund', permission: 'order.refund', requiresReason: true }
  ],
  cancelled: [],
  refunded: []
}

export const orderNextStates = (order: Pick<Order, 'status'>): readonly OrderTransition[] =>
  ORDER_TRANSITIONS[order.status]

export const canRefundOrder = (order: Pick<Order, 'status'>): boolean =>
  order.status === 'paid' || order.status === 'ready-for-pickup' || order.status === 'completed'

export const canCancelOrder = (order: Pick<Order, 'status'>): boolean =>
  order.status === 'paid'  // pending-payment cancellation is webhook-driven

/**
 * Cart FSM — 4 states.
 *
 *   active ──reserve──► reserved ──checkout──► converted
 *     │                    │
 *     └─────────expire─────┴──► expired
 */
export type CartTransition = {
  readonly to: CartStatus
  readonly label: string
  readonly permission?: string
}

const CART_TRANSITIONS: Record<CartStatus, readonly CartTransition[]> = {
  active: [
    { to: 'reserved', label: 'cart.reserve', permission: 'cart.reserve' }
  ],
  reserved: [
    { to: 'converted', label: 'cart.checkout', permission: 'checkout.create' }
  ],
  expired: [],
  converted: []
}

export const cartNextStates = (cart: Pick<Cart, 'status'>): readonly CartTransition[] =>
  CART_TRANSITIONS[cart.status]

/**
 * Unified canRefund — works for both Sale and Order.
 * Use this in UI to decide whether to show the refund button.
 */
export const canRefund = (
  entity: Pick<Sale, 'status'> | Pick<Order, 'status'>
): boolean => {
  const status = entity.status
  if (status === 'completed') return true  // sale or order
  if (status === 'paid' || status === 'ready-for-pickup') return true  // order only
  return false
}

/**
 * FSM violation check — returns true if the given (from → to) transition is legal.
 * Backend will reject illegal transitions with `state_conflict`; this lets the
 * UI check before sending the request.
 */
export const isLegalTransition = (
  entityType: 'sale' | 'order' | 'cart',
  from: SaleStatus | OrderStatus | CartStatus,
  to: SaleStatus | OrderStatus | CartStatus
): boolean => {
  const transitions =
    entityType === 'sale' ? SALE_TRANSITIONS[from as SaleStatus]
    : entityType === 'order' ? ORDER_TRANSITIONS[from as OrderStatus]
    : CART_TRANSITIONS[from as CartStatus]
  return transitions?.some((t) => t.to === to) ?? false
}