import type { ClientConfig } from './http.js'
import type { CatalogHandlers } from './catalog.js'
import type { CartHandlers, CheckoutHandlers } from './cart.js'
import type { OrderHandlers, PosHandlers } from './orders.js'
import type { AuditHandlers, ReportsHandlers, ComplianceHandlers } from './admin.js'
import { catalogHandlers, stockHandlers } from './catalog.js'
import { cartHandlers, checkoutHandlers } from './cart.js'
import { orderHandlers, posHandlers } from './orders.js'
import { auditHandlers, reportsHandlers, complianceHandlers } from './admin.js'

/**
 * The typed SDK surface — every method returns Result<T, ApiError>.
 *
 * Usage:
 *   const client = createClient({ baseUrl: '...', tenantId: 'pasiones', authToken: '...' })
 *   const result = await client.catalog.listProducts()
 *   if (result.ok) console.log(result.value.items)
 */
export interface Client {
  readonly catalog: CatalogHandlers
  readonly stock: ReturnType<typeof stockHandlers>
  readonly cart: CartHandlers
  readonly checkout: CheckoutHandlers
  readonly orders: OrderHandlers
  readonly pos: PosHandlers
  readonly admin: {
    readonly audit: AuditHandlers
    readonly reports: ReportsHandlers
    readonly compliance: ComplianceHandlers
  }
}

export const createClient = (config: ClientConfig): Client => ({
  catalog: catalogHandlers(config),
  stock: stockHandlers(config),
  cart: cartHandlers(config),
  checkout: checkoutHandlers(config),
  orders: orderHandlers(config),
  pos: posHandlers(config),
  admin: {
    audit: auditHandlers(config),
    reports: reportsHandlers(config),
    compliance: complianceHandlers(config)
  }
})

export * from './http.js'