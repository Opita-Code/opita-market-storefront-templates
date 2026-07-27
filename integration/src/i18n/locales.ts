import type { Locale } from '../types/checkout.js'

/**
 * ICU MessageFormat — minimal subset (no plural/select/gender yet).
 * Use {var} for variable substitution; everything else is verbatim.
 *
 * Example:
 *   format('Cart has {count} items', { count: 3 })  // "Cart has 3 items"
 */

let currentLocale: Locale = 'es-CO'

export const setLocale = (locale: Locale): void => { currentLocale = locale }
export const getLocale = (): Locale => currentLocale

const BUNDLES: Record<Locale, Record<string, string>> = {
  'es-CO': {
    'cart.title': 'Carrito',
    'cart.empty': 'Tu carrito está vacío',
    'cart.itemCount': '{count, plural, one {# producto} other {# productos}}',
    'cart.subtotal': 'Subtotal: {amount}',
    'cart.checkout': 'Ir a pagar',
    'cart.reserve': 'Reservar stock',
    'cart.consent.accept': 'Acepto la política de tratamiento de datos',
    'cart.consent.reject': 'No acepto',
    'cart.consent.required': 'Debes aceptar la política para continuar',
    'checkout.title': 'Finalizar compra',
    'checkout.acceptAndPay': 'Aceptar y pagar',
    'checkout.processing': 'Procesando pago…',
    'checkout.success': '¡Pago exitoso!',
    'order.status.pending-payment': 'Pago pendiente',
    'order.status.paid': 'Pagado',
    'order.status.ready-for-pickup': 'Listo para recoger',
    'order.status.completed': 'Completado',
    'order.status.cancelled': 'Cancelado',
    'order.status.refunded': 'Reembolsado',
    'sale.status.draft': 'Borrador',
    'sale.status.completed': 'Completada',
    'sale.status.voided': 'Anulada',
    'sale.status.refunded': 'Reembolsada',
    'sale.complete': 'Completar venta',
    'sale.void': 'Anular',
    'sale.refund': 'Reembolsar',
    'order.markReady': 'Marcar como lista',
    'order.complete': 'Marcar como entregada',
    'order.cancel': 'Cancelar',
    'order.refund': 'Reembolsar',
    'refund.reason.damaged': 'Producto dañado en tránsito',
    'refund.reason.customerRequest': 'Cliente cambió de opinión',
    'refund.reason.defectiveProduct': 'Producto defectuoso',
    'refund.reason.wrongItem': 'Producto equivocado',
    'refund.reason.other': 'Otro',
    'refund.notes.label': 'Notas (opcional)',
    'refund.partial': 'Reembolso parcial',
    'refund.full': 'Reembolso completo',
    'error.network': 'Error de conexión. Por favor intenta de nuevo.',
    'error.unauthorized': 'Tu sesión expiró. Por favor inicia sesión de nuevo.',
    'error.forbidden': 'No tienes permiso para esta acción.',
    'error.notFound': 'No se encontró el recurso.',
    'error.conflict': 'Otro usuario modificó este recurso. Recarga la página.',
    'error.insufficientStock': 'No hay suficiente stock disponible.',
    'error.preconditionFailed': 'Debes aceptar la política de datos para continuar.',
    'error.internal': 'Error del servidor. Por favor intenta más tarde.',
    'error.rateLimited': 'Demasiadas solicitudes. Espera un momento.'
  },
  'en-US': {
    'cart.title': 'Cart',
    'cart.empty': 'Your cart is empty',
    'cart.itemCount': '{count, plural, one {# item} other {# items}}',
    'cart.subtotal': 'Subtotal: {amount}',
    'cart.checkout': 'Checkout',
    'cart.reserve': 'Reserve stock',
    'cart.consent.accept': 'I accept the data processing policy',
    'cart.consent.reject': 'I do not accept',
    'cart.consent.required': 'You must accept the policy to continue',
    'checkout.title': 'Checkout',
    'checkout.acceptAndPay': 'Accept and pay',
    'checkout.processing': 'Processing payment…',
    'checkout.success': 'Payment successful!',
    'order.status.pending-payment': 'Payment pending',
    'order.status.paid': 'Paid',
    'order.status.ready-for-pickup': 'Ready for pickup',
    'order.status.completed': 'Completed',
    'order.status.cancelled': 'Cancelled',
    'order.status.refunded': 'Refunded',
    'sale.status.draft': 'Draft',
    'sale.status.completed': 'Completed',
    'sale.status.voided': 'Voided',
    'sale.status.refunded': 'Refunded',
    'sale.complete': 'Complete sale',
    'sale.void': 'Void',
    'sale.refund': 'Refund',
    'order.markReady': 'Mark as ready',
    'order.complete': 'Mark as delivered',
    'order.cancel': 'Cancel',
    'order.refund': 'Refund',
    'refund.reason.damaged': 'Damaged in transit',
    'refund.reason.customerRequest': 'Customer changed mind',
    'refund.reason.defectiveProduct': 'Defective product',
    'refund.reason.wrongItem': 'Wrong item',
    'refund.reason.other': 'Other',
    'refund.notes.label': 'Notes (optional)',
    'refund.partial': 'Partial refund',
    'refund.full': 'Full refund',
    'error.network': 'Connection error. Please try again.',
    'error.unauthorized': 'Your session expired. Please log in again.',
    'error.forbidden': 'You do not have permission for this action.',
    'error.notFound': 'Resource not found.',
    'error.conflict': 'Another user modified this resource. Please reload.',
    'error.insufficientStock': 'Not enough stock available.',
    'error.preconditionFailed': 'You must accept the data policy to continue.',
    'error.internal': 'Server error. Please try again later.',
    'error.rateLimited': 'Too many requests. Please wait.'
  },
  'pt-BR': {
    'cart.title': 'Carrinho',
    'cart.empty': 'Seu carrinho está vazio',
    'cart.itemCount': '{count, plural, one {# item} other {# itens}}',
    'cart.subtotal': 'Subtotal: {amount}',
    'cart.checkout': 'Finalizar compra',
    'cart.reserve': 'Reservar estoque',
    'cart.consent.accept': 'Aceito a política de tratamento de dados',
    'cart.consent.reject': 'Não aceito',
    'cart.consent.required': 'Você deve aceitar a política para continuar',
    'checkout.title': 'Finalizar compra',
    'checkout.acceptAndPay': 'Aceitar e pagar',
    'checkout.processing': 'Processando pagamento…',
    'checkout.success': 'Pagamento realizado com sucesso!',
    'order.status.pending-payment': 'Pagamento pendente',
    'order.status.paid': 'Pago',
    'order.status.ready-for-pickup': 'Pronto para retirada',
    'order.status.completed': 'Concluído',
    'order.status.cancelled': 'Cancelado',
    'order.status.refunded': 'Reembolsado',
    'sale.status.draft': 'Rascunho',
    'sale.status.completed': 'Concluída',
    'sale.status.voided': 'Anulada',
    'sale.status.refunded': 'Reembolsada',
    'sale.complete': 'Concluir venda',
    'sale.void': 'Anular',
    'sale.refund': 'Reembolsar',
    'order.markReady': 'Marcar como pronto',
    'order.complete': 'Marcar como entregue',
    'order.cancel': 'Cancelar',
    'order.refund': 'Reembolsar',
    'refund.reason.damaged': 'Produto danificado no transporte',
    'refund.reason.customerRequest': 'Cliente mudou de ideia',
    'refund.reason.defectiveProduct': 'Produto com defeito',
    'refund.reason.wrongItem': 'Produto errado',
    'refund.reason.other': 'Outro',
    'refund.notes.label': 'Notas (opcional)',
    'refund.partial': 'Reembolso parcial',
    'refund.full': 'Reembolso completo',
    'error.network': 'Erro de conexão. Por favor tente novamente.',
    'error.unauthorized': 'Sua sessão expirou. Por favor faça login novamente.',
    'error.forbidden': 'Você não tem permissão para esta ação.',
    'error.notFound': 'Recurso não encontrado.',
    'error.conflict': 'Outro usuário modificou este recurso. Recarregue a página.',
    'error.insufficientStock': 'Estoque insuficiente.',
    'error.preconditionFailed': 'Você deve aceitar a política de dados para continuar.',
    'error.internal': 'Erro do servidor. Por favor tente mais tarde.',
    'error.rateLimited': 'Muitas requisições. Aguarde um momento.'
  }
}

export const t = (key: string, vars?: Record<string, string | number>): string => {
  const template = BUNDLES[currentLocale][key]
  if (template === undefined) {
    // Fallback to en-US, then return key if missing
    return BUNDLES['en-US'][key] ?? key
  }
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`))
}

/** Get all keys for a namespace (e.g. "cart.*"). Useful for testing. */
export const keysInNamespace = (namespace: string): readonly string[] =>
  Object.keys(BUNDLES[currentLocale]).filter((k) => k.startsWith(namespace + '.'))

/** Test/debug helper: check that all 3 locales have the same keys. */
export const validateLocaleConsistency = (): { missing: readonly string[] } => {
  const esKeys = new Set(Object.keys(BUNDLES['es-CO']))
  const enKeys = new Set(Object.keys(BUNDLES['en-US']))
  const ptKeys = new Set(Object.keys(BUNDLES['pt-BR']))
  const all = new Set([...esKeys, ...enKeys, ...ptKeys])
  const missing: string[] = []
  for (const k of all) {
    if (!esKeys.has(k)) missing.push(`es-CO: ${k}`)
    if (!enKeys.has(k)) missing.push(`en-US: ${k}`)
    if (!ptKeys.has(k)) missing.push(`pt-BR: ${k}`)
  }
  return { missing }
}