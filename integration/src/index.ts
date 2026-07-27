/**
 * @opita/market-integration — main barrel.
 *
 * Re-exports the public API surface. Sub-paths are also exposed via package.json exports:
 *   @opita/market-integration          (this file — types + client + utilities)
 *   @opita/market-integration/fsm      (FSM helpers)
 *   @opita/market-integration/webhooks (Wompi parsers)
 *   @opita/market-integration/i18n     (ICU messages + locale bundles)
 *   @opita/market-integration/currency (formatters)
 *   @opita/market-integration/text     (Habeas Data + receipt + refund-modal strings)
 *   @opita/market-integration/mock     (in-memory mock server)
 *
 * Framework-agnostic — no React/Vue/Svelte components here. Use this from any TS/JS app.
 */
export * from './types/index.js'
export * from './client/index.js'
export * from './fsm/index.js'
export * from './webhooks/index.js'
export * from './i18n/index.js'
export * from './currency/index.js'
export * from './text/index.js'
export * from './mock/index.js'