import type { ClientConfig, ListOptions, RefundInput, PosSaleCreateInput } from './http.js'
import { httpRequest } from './http.js'
import type { Result } from '../types/result.js'
import type { ApiError } from '../types/result.js'
import type { Order, Sale } from '../types/sale.js'
import type { Page } from '../types/catalog.js'

export interface OrderHandlers {
  list(filters?: ListOptions & { status?: string }): Promise<Result<Page<Order>, ApiError>>
  get(orderId: string): Promise<Result<Order, ApiError>>
  refund(orderId: string, input: RefundInput): Promise<Result<Order, ApiError>>
}

export const orderHandlers = (config: ClientConfig): OrderHandlers => ({
  list: (filters) => httpRequest<Page<Order>>(config, `/tenants/${config.tenantId}/orders`, { queryParams: filters }),
  get: (orderId) => httpRequest<Order>(config, `/tenants/${config.tenantId}/orders/${orderId}`),
  refund: (orderId, input) => httpRequest<Order>(config, `/tenants/${config.tenantId}/orders/${orderId}/refund`, { method: 'POST', body: input })
})

export interface PosHandlers {
  listSales(opts?: ListOptions): Promise<Result<Page<Sale>, ApiError>>
  getSale(saleId: string): Promise<Result<Sale, ApiError>>
  createSale(input: PosSaleCreateInput): Promise<Result<Sale, ApiError>>
  refundSale(saleId: string, input: RefundInput): Promise<Result<Sale, ApiError>>
}

export const posHandlers = (config: ClientConfig): PosHandlers => ({
  listSales: (opts) => httpRequest<Page<Sale>>(config, `/tenants/${config.tenantId}/pos/sales`, { queryParams: opts }),
  getSale: (saleId) => httpRequest<Sale>(config, `/tenants/${config.tenantId}/pos/sales/${saleId}`),
  createSale: (input) => httpRequest<Sale>(config, `/tenants/${config.tenantId}/pos/sales`, { method: 'POST', body: input }),
  refundSale: (saleId, input) => httpRequest<Sale>(config, `/tenants/${config.tenantId}/pos/sales/${saleId}/refund`, { method: 'POST', body: input })
})