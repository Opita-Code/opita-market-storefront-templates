import type { Currency, IsoDateTime, TenantId, Version } from './money.js'

export interface Product {
  readonly id: string
  readonly tenantId: TenantId
  readonly sku: string
  readonly name: string
  readonly description?: string | null
  readonly imageUrl?: string | null
  readonly priceAmount: number  // minor units
  readonly currency: Currency
  readonly categoryId?: string | null
  readonly status: 'active' | 'inactive'
  readonly createdAt: IsoDateTime
  readonly version?: Version
}

export interface Variant {
  readonly id: string
  readonly tenantId: TenantId
  readonly productId: string
  readonly sku: string
  readonly name?: string | null
  readonly priceAmount: number
  readonly currency: Currency
  readonly barcode?: string | null
  readonly status: 'active' | 'inactive'
  readonly createdAt: IsoDateTime
  readonly version?: Version
}

export interface Branch {
  readonly id: string
  readonly tenantId: TenantId
  readonly name: string
  readonly address: string
  readonly city?: string | null
  readonly phone?: string | null
  readonly timezone: string  // IANA tz, e.g. "America/Bogota"
  readonly status: 'active' | 'inactive'
  readonly createdAt: IsoDateTime
}

export interface StockEntry {
  readonly id: string
  readonly tenantId: TenantId
  readonly variantId: string
  readonly branchId: string
  readonly quantity: number  // available (not reserved)
  readonly reserved: number  // held by active carts
  readonly version: Version
}

/** Page<T> — cursor-paginated list response from the backend. */
export interface Page<T> {
  readonly items: readonly T[]
  readonly nextCursor: string | null
}