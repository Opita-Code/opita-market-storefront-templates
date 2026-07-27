import { describe, it, expect } from 'vitest'
import { getHabeasDataBanner } from '../src/text/habeas-data.js'
import type { ConsentTexts } from '../src/types/checkout.js'

const fixtureTexts: ConsentTexts = {
  es: 'Autorizo el tratamiento de mis datos personales conforme a la Ley 1581.',
  en: 'I authorize the processing of my personal data.',
  pt: 'Autorizo o tratamento dos meus dados pessoais.',
  version: '2026-07-27.1'
}

describe('getHabeasDataBanner', () => {
  it('renders es-CO banner', () => {
    const banner = getHabeasDataBanner(fixtureTexts, 'es-CO')
    expect(banner.locale).toBe('es-CO')
    expect(banner.version).toBe('2026-07-27.1')
    expect(banner.html).toContain('Política de Tratamiento de Datos Personales')
    expect(banner.html).toContain('Ley 1581')
    expect(banner.html).toContain('data-policy-version="2026-07-27.1"')
    expect(banner.html).toContain('data-action="accept"')
    expect(banner.html).toContain('data-action="reject"')
  })

  it('renders en-US banner when text is provided', () => {
    const banner = getHabeasDataBanner(fixtureTexts, 'en-US')
    expect(banner.html).toContain('Personal Data Processing Policy')
    expect(banner.html).toContain('personal data')
  })

  it('renders pt-BR banner when text is provided', () => {
    const banner = getHabeasDataBanner(fixtureTexts, 'pt-BR')
    expect(banner.html).toContain('Tratamento de Dados Pessoais')
  })

  it('escapes HTML to prevent XSS', () => {
    const xssTexts: ConsentTexts = {
      es: 'Texto <script>alert(1)</script> seguro',
      version: '2026-07-27.1'
    }
    const banner = getHabeasDataBanner(xssTexts, 'es-CO')
    expect(banner.html).not.toContain('<script>')
    expect(banner.html).toContain('&lt;script&gt;')
  })
})