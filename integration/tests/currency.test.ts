import { describe, it, expect } from 'vitest'
import { formatCurrency, formatCurrencyParts, parseCurrency } from '../src/currency/format.js'

describe('formatCurrency', () => {
  it('COP es-CO uses dot grouping + $ symbol', () => {
    expect(formatCurrency(1234567, 'COP', 'es-CO')).toMatch(/1[.]\d{3}[.]\d{3}/)
    expect(formatCurrency(1234567, 'COP', 'es-CO')).toContain('$')
  })

  it('USD en-US uses comma grouping + $ symbol', () => {
    const formatted = formatCurrency(9999, 'USD', 'en-US')
    expect(formatted).toBe('$99.99')
  })

  it('BRL pt-BR uses dot grouping + comma decimal + R$', () => {
    const formatted = formatCurrency(9999, 'BRL', 'pt-BR')
    expect(formatted).toContain('99,99')
    expect(formatted).toContain('R$')
  })

  it('COP with 0 decimals', () => {
    expect(formatCurrency(50000, 'COP', 'es-CO')).toMatch(/50[.]\d{3}/)
  })

  it('uses currency\'s default locale if not specified', () => {
    expect(formatCurrency(9999, 'USD')).toBe('$99.99')
    expect(formatCurrency(9999, 'BRL')).toContain('99,99')
  })
})

describe('formatCurrencyParts', () => {
  it('decomposes into symbol + integer + decimals', () => {
    const parts = formatCurrencyParts(9999, 'USD', 'en-US')
    expect(parts.symbol).toBe('$')
    expect(parts.integer).toBe('99')
    expect(parts.decimals).toBe('99')
    expect(parts.formatted).toBe('$99.99')
  })
})

describe('parseCurrency', () => {
  it('roundtrips COP', () => {
    expect(parseCurrency(formatCurrency(1234567, 'COP', 'es-CO'), 'COP')).toBe(1234567)
  })
  it('roundtrips USD', () => {
    expect(parseCurrency('$99.99', 'USD')).toBe(9999)
  })
  it('roundtrips BRL', () => {
    expect(parseCurrency('R$ 99,99', 'BRL')).toBe(9999)
  })
})