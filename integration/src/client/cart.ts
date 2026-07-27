import type { ClientConfig } from './http.js'
import { httpRequest } from './http.js'
import type { CartCreateInput, CartAddItemInput, CartHabeasDataInput } from './http.js'
import type { Result } from '../types/result.js'
import type { ApiError } from '../types/result.js'
import type { Cart } from '../types/cart.js'
import type { CheckoutConfig } from '../types/checkout.js'
import type { CheckoutCreateInput } from './http.js'
import type { Order } from '../types/sale.js'

export interface CartHandlers {
  create(input: CartCreateInput): Promise<Result<Cart, ApiError>>
  addItem(cartId: string, input: CartAddItemInput): Promise<Result<Cart, ApiError>>
  removeItem(cartId: string, itemId: string): Promise<Result<Cart, ApiError>>
  reserve(cartId: string): Promise<Result<Cart, ApiError>>
  captureHabeasDataConsent(cartId: string, input: CartHabeasDataInput): Promise<Result<void, ApiError>>
  get(cartId: string): Promise<Result<Cart, ApiError>>
}

export const cartHandlers = (config: ClientConfig): CartHandlers => ({
  create: (input) => httpRequest<Cart>(config, `/tenants/${config.tenantId}/cart`, { method: 'POST', body: input }),
  addItem: (cartId, input) => httpRequest<Cart>(config, `/tenants/${config.tenantId}/cart/${cartId}/items`, { method: 'POST', body: input }),
  removeItem: (cartId, itemId) => httpRequest<Cart>(config, `/tenants/${config.tenantId}/cart/${cartId}/items/${itemId}`, { method: 'DELETE' }),
  reserve: (cartId) => httpRequest<Cart>(config, `/tenants/${config.tenantId}/cart/${cartId}/reserve`, { method: 'POST' }),
  captureHabeasDataConsent: (cartId, input) => httpRequest<void>(config, `/tenants/${config.tenantId}/cart/${cartId}/habeas-data`, { method: 'POST', body: input }),
  get: (cartId) => httpRequest<Cart>(config, `/tenants/${config.tenantId}/cart/${cartId}`)
})

export interface CheckoutHandlers {
  /** PUBLIC — no auth required. Returns Habeas Data texts + currency + TTLs. */
  getConfig(): Promise<Result<CheckoutConfig, ApiError>>
  /** Creates order + returns wompi checkoutUrl. Requires Habeas Data already captured. */
  create(input: CheckoutCreateInput): Promise<Result<Order, ApiError>>
}

export const checkoutHandlers = (config: ClientConfig): CheckoutHandlers => ({
  getConfig: () => httpRequest<CheckoutConfig>(config, `/tenants/${config.tenantId}/checkout/config`),
  create: (input) => httpRequest<Order>(config, `/tenants/${config.tenantId}/checkout`, { method: 'POST', body: input })
})