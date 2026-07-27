import { describe, it, expect } from 'vitest'
import { ok, err, toApiError } from '../src/types/result.js'

describe('Result', () => {
  it('ok() creates an Ok variant', () => {
    const r = ok({ id: '1' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toEqual({ id: '1' })
  })

  it('err() creates an Err variant', () => {
    const e = err({ code: 'not_found' as const, message: 'gone', status: 404 })
    expect(e.ok).toBe(false)
    if (!e.ok) expect(e.error.code).toBe('not_found')
  })

  it('toApiError wraps unknown errors', () => {
    const e1 = toApiError(new Error('boom'))
    expect(e1.code).toBe('internal_error')
    expect(e1.message).toBe('boom')

    const e2 = toApiError('string thrown')
    expect(e2.code).toBe('internal_error')
    expect(e2.message).toBe('string thrown')

    const e3 = toApiError(null, 503)
    expect(e3.status).toBe(503)
  })
})