import type { Currency } from '../types/money.js'
import type { Locale } from '../types/checkout.js'

/**
 * Currency formatter — locale-aware.
 *
 * IMPORTANT: amountMinor is in MINOR units (centavos for COP, cents for USD/BRL).
 * The formatter handles the major/minor conversion + locale grouping + symbol.
 *
 * Examples:
 *   formatCurrency(1234567, 'COP', 'es-CO')  // "$ 1.234.567"
 *   formatCurrency(1234567, 'COP', 'es-CO')  // 1.234.567 with es-CO uses dot grouping + "$ " prefix
 *   formatCurrency(9999, 'USD', 'en-US')     // "$99.99"
 *   formatCurrency(9999, 'BRL', 'pt-BR')     // "R$ 99,99"
 *
 * NO third-party deps. We use Intl.NumberFormat which is built into Node + browsers.
 */

const CURRENCY_LOCALE: Record<Currency, string> = {
  COP: 'es-CO',
  USD: 'en-US',
  BRL: 'pt-BR'
}

const DECIMALS: Record<Currency, number> = {
  COP: 0,  // Colombian Peso has no minor unit in practice
  USD: 2,
  BRL: 2
}

/** Hardcoded group + decimal separators per currency (NOT derived from Intl,
 *  which returns inconsistent values depending on options). */
const SEPARATORS: Record<Currency, { group: string; decimal: string }> = {
  COP: { group: '.', decimal: ',' },
  USD: { group: ',', decimal: '.' },
  BRL: { group: '.', decimal: ',' }
}

export interface CurrencyParts {
  readonly symbol: string
  readonly integer: string
  readonly decimals: string
  readonly formatted: string
}

/**
 * Format a minor-unit amount in the given currency.
 * Defaults the locale to the currency's canonical locale if not specified.
 */
export const formatCurrency = (
  amountMinor: number,
  currency: Currency,
  locale?: Locale
): string => {
  const effectiveLocale = locale ?? CURRENCY_LOCALE[currency]
  const decimals = DECIMALS[currency]
  const major = amountMinor / Math.pow(10, decimals)

  // Intl.NumberFormat with the locale's standard currency formatting.
  // For COP with 0 decimals, this gives "$ 1.234.567" (es-CO) or "$1,234,567" (en-US).
  return new Intl.NumberFormat(effectiveLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(major)
}

export const formatCurrencyParts = (
  amountMinor: number,
  currency: Currency,
  locale?: Locale
): CurrencyParts => {
  const effectiveLocale = locale ?? CURRENCY_LOCALE[currency]
  const decimals = DECIMALS[currency]
  const major = amountMinor / Math.pow(10, decimals)
  const parts = new Intl.NumberFormat(effectiveLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).formatToParts(major)

  const symbol = parts.find((p) => p.type === 'currency')?.value ?? ''
  const integer = parts.filter((p) => p.type === 'integer').map((p) => p.value).join('')
  const decimalsPart = parts.find((p) => p.type === 'fraction')?.value ?? ''

  return {
    symbol,
    integer,
    decimals: decimalsPart,
    formatted: parts.map((p) => p.value).join('')
  }
}

/** Parse a locale-formatted currency string back to minor units. Throws on invalid input. */
export const parseCurrency = (
  formatted: string,
  currency: Currency
): number => {
  const locale = CURRENCY_LOCALE[currency]
  const decimals = DECIMALS[currency]

  // Strip the currency symbol + whitespace (incl. NBSP, narrow NBSP) + group separators
  // Keep only digits, the locale's decimal separator, and minus sign.
  // We hardcode separators per currency (Intl returns inconsistent values depending on options).
  const { group: groupSep, decimal: decimalSep } = SEPARATORS[currency]

  // Build the "allowed chars" regex dynamically to include both '.' and ',' when one is the decimal sep.
  // We strip group separators first, THEN strip everything except digits, the decimal sep, and minus.
  let cleaned = formatted
    .replace(/[\s\u00A0\u202F]/g, '')  // strip spaces incl. NBSP
    .replace(new RegExp(`\\${groupSep}`, 'g'), '')  // strip group seps

  // Build allowed-chars regex: digits, minus, and the locale's decimal separator.
  // (We don't allow BOTH '.' and ',' because that confuses which is decimal — we know per-currency.)
  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const allowedChars = new RegExp(`[^\\d${escapeRe(decimalSep)}\\-]`, 'g')
  cleaned = cleaned.replace(allowedChars, '')

  // Now swap the locale's decimal sep for '.' so Number() parses correctly.
  if (decimalSep === ',') {
    cleaned = cleaned.replace(',', '.')
  }

  const major = Number(cleaned)
  if (Number.isNaN(major)) {
    throw new Error(`Cannot parse currency: "${formatted}"`)
  }
  return Math.round(major * Math.pow(10, decimals))
}