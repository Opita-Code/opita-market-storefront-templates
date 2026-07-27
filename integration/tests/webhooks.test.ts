import { describe, it, expect } from 'vitest'
import { mapWompiStatusToOrderStatus } from '../src/webhooks/wompi.js'

describe('mapWompiStatusToOrderStatus', () => {
  it('APPROVED → paid', () => {
    expect(mapWompiStatusToOrderStatus('APPROVED')).toBe('paid')
  })
  it('DECLINED → cancelled', () => {
    expect(mapWompiStatusToOrderStatus('DECLINED')).toBe('cancelled')
  })
  it('VOIDED → cancelled', () => {
    expect(mapWompiStatusToOrderStatus('VOIDED')).toBe('cancelled')
  })
  it('ERROR → cancelled', () => {
    expect(mapWompiStatusToOrderStatus('ERROR')).toBe('cancelled')
  })
  it('PENDING → null (no state change)', () => {
    expect(mapWompiStatusToOrderStatus('PENDING')).toBe(null)
  })
})

describe('parseWompiWebhook', () => {
  it('rejects invalid JSON', async () => {
    const { parseWompiWebhook } = await import('../src/webhooks/wompi.js')
    const result = await parseWompiWebhook('not json', 'events_key')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('parse_error')
  })

  it('rejects missing signature', async () => {
    const { parseWompiWebhook } = await import('../src/webhooks/wompi.js')
    const result = await parseWompiWebhook({
      event: 'transaction.updated',
      data: { transaction: { id: 'tx_1', status: 'APPROVED', reference: 'ord_1', amountInCents: 1000, currency: 'COP' } }
      // signature intentionally omitted
    }, 'events_key')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('invalid_event')
  })
})