import { describe, it, expect } from 'vitest'
import {
  canRefundSale, canRefundOrder, canCancelOrder,
  saleNextStates, orderNextStates, cartNextStates,
  canRefund, isLegalTransition
} from '../src/fsm/sale.js'
import type { Sale } from '../src/types/sale.js'

const saleOf = (status: Sale['status']): Pick<Sale, 'status'> => ({ status })

describe('FSM — Sale', () => {
  it('canRefundSale returns true only for completed', () => {
    expect(canRefundSale(saleOf('draft'))).toBe(false)
    expect(canRefundSale(saleOf('completed'))).toBe(true)
    expect(canRefundSale(saleOf('voided'))).toBe(false)
    expect(canRefundSale(saleOf('refunded'))).toBe(false)
  })

  it('saleNextStates reflects the FSM', () => {
    expect(saleNextStates(saleOf('draft'))).toHaveLength(1)
    expect(saleNextStates(saleOf('completed')).map((t) => t.to).sort()).toEqual(['refunded', 'voided'])
    expect(saleNextStates(saleOf('voided'))).toHaveLength(0)
    expect(saleNextStates(saleOf('refunded'))).toHaveLength(0)
  })
})

describe('FSM — Order', () => {
  it('canRefundOrder true for paid|ready-for-pickup|completed', () => {
    expect(canRefundOrder({ status: 'pending-payment' })).toBe(false)
    expect(canRefundOrder({ status: 'paid' })).toBe(true)
    expect(canRefundOrder({ status: 'ready-for-pickup' })).toBe(true)
    expect(canRefundOrder({ status: 'completed' })).toBe(true)
    expect(canRefundOrder({ status: 'cancelled' })).toBe(false)
    expect(canRefundOrder({ status: 'refunded' })).toBe(false)
  })

  it('canCancelOrder true only for paid', () => {
    expect(canCancelOrder({ status: 'pending-payment' })).toBe(false)
    expect(canCancelOrder({ status: 'paid' })).toBe(true)
    expect(canCancelOrder({ status: 'ready-for-pickup' })).toBe(false)
  })
})

describe('FSM — unified canRefund', () => {
  it('works for both Sale and Order', () => {
    expect(canRefund(saleOf('completed'))).toBe(true)
    expect(canRefund({ status: 'paid' })).toBe(true)
    expect(canRefund({ status: 'cancelled' })).toBe(false)
  })
})

describe('FSM — isLegalTransition', () => {
  it('returns true for legal transitions', () => {
    expect(isLegalTransition('sale', 'completed', 'refunded')).toBe(true)
    expect(isLegalTransition('order', 'paid', 'refunded')).toBe(true)
    expect(isLegalTransition('order', 'paid', 'ready-for-pickup')).toBe(true)
  })
  it('returns false for illegal transitions', () => {
    expect(isLegalTransition('sale', 'draft', 'refunded')).toBe(false)
    expect(isLegalTransition('order', 'pending-payment', 'paid')).toBe(false)  // webhook-driven
    expect(isLegalTransition('order', 'cancelled', 'paid')).toBe(false)
  })
})

describe('FSM — cartNextStates', () => {
  it('exposes reserve and checkout transitions', () => {
    expect(cartNextStates({ status: 'active' }).map((t) => t.to)).toEqual(['reserved'])
    expect(cartNextStates({ status: 'reserved' }).map((t) => t.to)).toEqual(['converted'])
    expect(cartNextStates({ status: 'expired' })).toHaveLength(0)
    expect(cartNextStates({ status: 'converted' })).toHaveLength(0)
  })
})