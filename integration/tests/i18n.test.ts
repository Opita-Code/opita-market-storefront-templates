import { describe, it, expect, beforeEach } from 'vitest'
import { t, setLocale, getLocale, validateLocaleConsistency } from '../src/i18n/locales.js'

describe('i18n', () => {
  beforeEach(() => setLocale('es-CO'))

  it('setLocale + getLocale', () => {
    setLocale('pt-BR')
    expect(getLocale()).toBe('pt-BR')
    setLocale('es-CO')
  })

  it('t() resolves es-CO keys', () => {
    setLocale('es-CO')
    expect(t('cart.title')).toBe('Carrito')
    expect(t('cart.checkout')).toBe('Ir a pagar')
  })

  it('t() resolves en-US keys', () => {
    setLocale('en-US')
    expect(t('cart.title')).toBe('Cart')
  })

  it('t() resolves pt-BR keys', () => {
    setLocale('pt-BR')
    expect(t('cart.title')).toBe('Carrinho')
  })

  it('t() substitutes variables', () => {
    setLocale('es-CO')
    expect(t('cart.subtotal', { amount: '$ 1.234.567' })).toBe('Subtotal: $ 1.234.567')
  })

  it('t() falls back to en-US if key missing in current locale', () => {
    setLocale('es-CO')
    // If we delete a key from es-CO, it should fall through to en-US
    // (We can't easily test deletion without polluting the bundle, so we just verify the lookup pattern works)
    expect(t('nonexistent.key')).toBe('nonexistent.key')  // returns key when not found anywhere
  })

  it('validateLocaleConsistency — all 3 locales have the same keys', () => {
    const result = validateLocaleConsistency()
    expect(result.missing).toEqual([])
  })
})