import type { ClientConfig, ListOptions } from './http.js'
import { httpRequest } from './http.js'
import type { Result } from '../types/result.js'
import type { ApiError } from '../types/result.js'
import type { Product, Variant, Branch, Page, StockEntry } from '../types/catalog.js'

export interface CatalogHandlers {
  listProducts(filters?: ListOptions & { categoryId?: string; status?: 'active' | 'inactive' }): Promise<Result<Page<Product>, ApiError>>
  getProduct(productId: string): Promise<Result<Product, ApiError>>
  listVariants(productId: string, opts?: ListOptions): Promise<Result<Page<Variant>, ApiError>>
  listBranches(opts?: ListOptions): Promise<Result<Page<Branch>, ApiError>>
  getBranch(branchId: string): Promise<Result<Branch, ApiError>>
}

export const catalogHandlers = (config: ClientConfig): CatalogHandlers => ({
  listProducts: (filters) =>
    httpRequest<Page<Product>>(config, `/tenants/${config.tenantId}/catalog/products`, {
      queryParams: filters
    }),
  getProduct: (productId) =>
    httpRequest<Product>(config, `/tenants/${config.tenantId}/catalog/products/${productId}`),
  listVariants: (productId, opts) =>
    httpRequest<Page<Variant>>(config, `/tenants/${config.tenantId}/catalog/products/${productId}/variants`, {
      queryParams: opts
    }),
  listBranches: (opts) =>
    httpRequest<Page<Branch>>(config, `/tenants/${config.tenantId}/catalog/branches`, {
      queryParams: opts
    }),
  getBranch: (branchId) =>
    httpRequest<Branch>(config, `/tenants/${config.tenantId}/catalog/branches/${branchId}`)
})

export const stockHandlers = (config: ClientConfig) => ({
  list: (filters?: ListOptions & { variantId?: string; branchId?: string }) =>
    httpRequest<Page<StockEntry>>(config, `/tenants/${config.tenantId}/stock`, {
      queryParams: filters
    })
})