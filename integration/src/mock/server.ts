import type { Client } from '../client/index.js'
import type { ClientConfig } from '../client/http.js'
import { createClient } from '../client/index.js'
import type { Result } from '../types/result.js'
import { ok, err } from '../types/result.js'
import type { TenantId } from '../types/money.js'
import type { Product, Variant, Branch, StockEntry } from '../types/catalog.js'
import type { Cart, HabeasDataConsent } from '../types/cart.js'
import type { Order, Sale } from '../types/sale.js'
import type { AuditLog } from '../types/audit-log.js'
import type { CheckoutConfig } from '../types/checkout.js'

/**
 * In-memory mock backend — returns the SAME Client interface as the real SDK,
 * but all state is held in module-level Maps. Useful for:
 *   - Frontend dev without deploying the backend
 *   - Storybook stories with realistic data
 *   - Integration tests
 *   - AI agent sandbox runs
 *
 * Usage:
 *   const client = createMockClient({ tenantId: 'pasiones' })
 *   const products = await client.catalog.listProducts()
 *
 * The mock respects the same Result<T, E> shape, so consumers don't need to branch.
 */

interface MockState {
  products: Map<string, Product>
  variants: Map<string, Variant>
  branches: Map<string, Branch>
  stock: Map<string, StockEntry>  // key: `${variantId}:${branchId}`
  carts: Map<string, Cart>
  orders: Map<string, Order>
  sales: Map<string, Sale>
  auditLogs: AuditLog[]
  customers: Map<string, { id: string; email: string; habeasDataConsent: HabeasDataConsent | null }>
  checkoutConfig: CheckoutConfig
}

const states = new Map<TenantId, MockState>()

const getOrInit = (tenantId: TenantId): MockState => {
  let state = states.get(tenantId)
  if (!state) {
    state = {
      products: new Map(),
      variants: new Map(),
      branches: new Map(),
      stock: new Map(),
      carts: new Map(),
      orders: new Map(),
      sales: new Map(),
      auditLogs: [],
      customers: new Map(),
      checkoutConfig: {
        currency: 'COP',
        reservationTtlMinutes: 15,
        checkoutTtlMinutes: 30,
        habeasDataPolicyUrl: 'https://pasiones.co/politica-datos',
        habeasDataPolicyVersion: '2026-07-27.1',
        consentTexts: {
          es: 'Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.',
          en: 'I authorize the processing of my personal data in accordance with Law 1581 of 2012.',
          pt: 'Autorizo o tratamento dos meus dados pessoais conforme a Lei 1581 de 2012.',
          version: '2026-07-27.1'
        },
        wompiRefundPolicy: 'external'
      }
    }
    states.set(tenantId, state)
    seedPasionesFixtures(state)
  }
  return state
}

const seedPasionesFixtures = (state: MockState): void => {
  // Branches
  const centro: Branch = {
    id: 'branch_001', tenantId: 'pasiones' as TenantId, name: 'Pasiones Centro',
    address: 'Cra 7 # 45-30', city: 'Bogotá', phone: '+57 1 234 5678',
    timezone: 'America/Bogota', status: 'active', createdAt: '2026-07-01T10:00:00.000Z' as never
  }
  const norte: Branch = {
    id: 'branch_002', tenantId: 'pasiones' as TenantId, name: 'Pasiones Norte',
    address: 'Cl 134 # 7-30', city: 'Bogotá', phone: '+57 1 234 5679',
    timezone: 'America/Bogota', status: 'active', createdAt: '2026-07-01T10:00:00.000Z' as never
  }
  state.branches.set(centro.id, centro)
  state.branches.set(norte.id, norte)

  // Products + variants
  const products: Array<[Product, Variant[]]> = [
    [{ id: 'prod_001', tenantId: 'pasiones' as TenantId, sku: 'CAM-001', name: 'Camiseta algodon', description: 'Camiseta 100% algodon peruano', imageUrl: null, priceAmount: 35000, currency: 'COP', categoryId: null, status: 'active', createdAt: '2026-07-01T10:00:00.000Z' as never, version: 1 as never }, [
      { id: 'var_001', tenantId: 'pasiones' as TenantId, productId: 'prod_001', sku: 'CAM-001-M', name: 'Talla M', priceAmount: 35000, currency: 'COP', barcode: '7701234567001', status: 'active', createdAt: '2026-07-01T10:00:00.000Z' as never, version: 1 as never },
      { id: 'var_002', tenantId: 'pasiones' as TenantId, productId: 'prod_001', sku: 'CAM-001-L', name: 'Talla L', priceAmount: 35000, currency: 'COP', barcode: '7701234567002', status: 'active', createdAt: '2026-07-01T10:00:00.000Z' as never, version: 1 as never }
    ]],
    [{ id: 'prod_002', tenantId: 'pasiones' as TenantId, sku: 'PAN-002', name: 'Pantalón jean', description: 'Jean slim fit', imageUrl: null, priceAmount: 89000, currency: 'COP', categoryId: null, status: 'active', createdAt: '2026-07-01T10:00:00.000Z' as never, version: 1 as never }, [
      { id: 'var_003', tenantId: 'pasiones' as TenantId, productId: 'prod_002', sku: 'PAN-002-30', name: 'Talla 30', priceAmount: 89000, currency: 'COP', barcode: '7701234567010', status: 'active', createdAt: '2026-07-01T10:00:00.000Z' as never, version: 1 as never }
    ]],
    [{ id: 'prod_003', tenantId: 'pasiones' as TenantId, sku: 'ZAP-003', name: 'Zapatos cuero', description: 'Cuero genuino', imageUrl: null, priceAmount: 159000, currency: 'COP', categoryId: null, status: 'active', createdAt: '2026-07-01T10:00:00.000Z' as never, version: 1 as never }, [
      { id: 'var_004', tenantId: 'pasiones' as TenantId, productId: 'prod_003', sku: 'ZAP-003-40', name: 'Talla 40', priceAmount: 159000, currency: 'COP', barcode: '7701234567020', status: 'active', createdAt: '2026-07-01T10:00:00.000Z' as never, version: 1 as never }
    ]]
  ]
  for (const [p, vs] of products) {
    state.products.set(p.id, p)
    for (const v of vs) state.variants.set(v.id, v)
  }

  // Stock
  for (const variant of state.variants.values()) {
    for (const branch of [centro, norte]) {
      const key = `${variant.id}:${branch.id}`
      state.stock.set(key, {
        id: key, tenantId: 'pasiones' as TenantId, variantId: variant.id, branchId: branch.id,
        quantity: 50, reserved: 0, version: 1 as never
      })
    }
  }
}

/**
 * createMockClient — returns a Client backed by the in-memory mock.
 * Same shape as createClient(), so consumers can swap with one line.
 */
export const createMockClient = (config: Omit<ClientConfig, 'mock' | 'baseUrl'>): Client => {
  const tenantId = config.tenantId
  const state = getOrInit(tenantId)

  const unwrap = <T>(value: T): Result<T, never> => ok(value)

  return {
    catalog: {
      listProducts: async (filters) => {
        const items = Array.from(state.products.values()).filter((p) =>
          !filters?.status || p.status === filters.status
        ).slice(0, filters?.limit ?? 20)
        return unwrap({ items, nextCursor: null })
      },
      getProduct: async (id) => {
        const p = state.products.get(id)
        return p ? unwrap(p) : err({ code: 'not_found', message: `Product ${id}`, status: 404 })
      },
      listVariants: async (productId) => {
        const items = Array.from(state.variants.values()).filter((v) => v.productId === productId)
        return unwrap({ items, nextCursor: null })
      },
      listBranches: async () => unwrap({ items: Array.from(state.branches.values()), nextCursor: null }),
      getBranch: async (id) => {
        const b = state.branches.get(id)
        return b ? unwrap(b) : err({ code: 'not_found', message: `Branch ${id}`, status: 404 })
      }
    },
    stock: {
      list: async (filters) => {
        const items = Array.from(state.stock.values()).filter((s) =>
          (!filters?.variantId || s.variantId === filters.variantId) &&
          (!filters?.branchId || s.branchId === filters.branchId)
        ).slice(0, filters?.limit ?? 20)
        return unwrap({ items, nextCursor: null })
      }
    },
    cart: {
      create: async (input) => {
        const cart: Cart = {
          id: `cart_${Math.random().toString(36).slice(2, 10)}`,
          tenantId, customerId: `cust_${Math.random().toString(36).slice(2, 10)}`,
          branchId: input.branchId, status: 'active', items: [], currency: 'COP',
          subtotalAmount: 0,
          createdAt: new Date().toISOString() as never,
          expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() as never
        }
        state.carts.set(cart.id, cart)
        return unwrap(cart)
      },
      addItem: async (cartId, input) => {
        const cart = state.carts.get(cartId)
        if (!cart) return err({ code: 'not_found', message: 'Cart not found', status: 404 })
        const variant = state.variants.get(input.variantId)
        if (!variant) return err({ code: 'not_found', message: 'Variant not found', status: 404 })
        const updated: Cart = {
          ...cart,
          items: [...cart.items, { id: `item_${Math.random().toString(36).slice(2, 6)}`, variantId: input.variantId, quantity: input.quantity, unitPriceAmount: variant.priceAmount }],
          subtotalAmount: (cart.subtotalAmount ?? 0) + variant.priceAmount * input.quantity
        }
        state.carts.set(cartId, updated)
        return unwrap(updated)
      },
      removeItem: async (cartId, itemId) => {
        const cart = state.carts.get(cartId)
        if (!cart) return err({ code: 'not_found', message: 'Cart not found', status: 404 })
        const updated: Cart = {
          ...cart,
          items: cart.items.filter((i) => i.id !== itemId)
        }
        state.carts.set(cartId, updated)
        return unwrap(updated)
      },
      reserve: async (cartId) => {
        const cart = state.carts.get(cartId)
        if (!cart) return err({ code: 'not_found', message: 'Cart not found', status: 404 })
        const updated: Cart = { ...cart, status: 'reserved', expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() as never }
        state.carts.set(cartId, updated)
        return unwrap(updated)
      },
      captureHabeasDataConsent: async (cartId, input) => {
        const cart = state.carts.get(cartId)
        if (!cart) return err({ code: 'not_found', message: 'Cart not found', status: 404 })
        const customer = state.customers.get(cart.customerId) ?? {
          id: cart.customerId, email: 'unknown@example.co', habeasDataConsent: null
        }
        customer.habeasDataConsent = {
          consentedAt: new Date().toISOString() as never,
          policyVersion: input.policyVersion
        }
        state.customers.set(customer.id, customer)
        return unwrap(undefined)
      },
      get: async (cartId) => {
        const cart = state.carts.get(cartId)
        return cart ? unwrap(cart) : err({ code: 'not_found', message: 'Cart not found', status: 404 })
      }
    },
    checkout: {
      getConfig: async () => unwrap(state.checkoutConfig),
      create: async (input) => {
        const cart = state.carts.get(input.cartId)
        if (!cart) return err({ code: 'not_found', message: 'Cart not found', status: 404 })
        const order: Order = {
          id: `ord_${Math.random().toString(36).slice(2, 10)}`,
          tenantId, customerId: cart.customerId, branchId: cart.branchId,
          lines: cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, unitPriceAmount: i.unitPriceAmount })),
          subtotalAmount: cart.subtotalAmount ?? 0, totalAmount: cart.subtotalAmount ?? 0,
          currency: cart.currency,
          status: 'pending-payment',
          checkoutUrl: `https://checkout.wompi.co/l/test_VPOS_${Math.random().toString(36).slice(2, 10)}`,
          createdAt: new Date().toISOString() as never,
          version: 1 as never
        }
        state.orders.set(order.id, order)
        state.carts.set(input.cartId, { ...cart, status: 'converted' })
        return unwrap(order)
      }
    },
    orders: {
      list: async () => unwrap({ items: Array.from(state.orders.values()), nextCursor: null }),
      get: async (orderId) => {
        const o = state.orders.get(orderId)
        return o ? unwrap(o) : err({ code: 'not_found', message: `Order ${orderId}`, status: 404 })
      },
      refund: async (orderId, input) => {
        const o = state.orders.get(orderId)
        if (!o) return err({ code: 'not_found', message: 'Order not found', status: 404 })
        if (o.status !== 'paid' && o.status !== 'ready-for-pickup' && o.status !== 'completed') {
          return err({ code: 'state_conflict', message: `Cannot refund from ${o.status}`, status: 409 })
        }
        const updated: Order = { ...o, status: 'refunded', refundReason: input.reason, refundedAt: new Date().toISOString() as never }
        state.orders.set(orderId, updated)
        return unwrap(updated)
      }
    },
    pos: {
      listSales: async () => unwrap({ items: Array.from(state.sales.values()), nextCursor: null }),
      getSale: async (saleId) => {
        const s = state.sales.get(saleId)
        return s ? unwrap(s) : err({ code: 'not_found', message: `Sale ${saleId}`, status: 404 })
      },
      createSale: async (input) => {
        const sale: Sale = {
          id: `sale_${Math.random().toString(36).slice(2, 10)}`,
          tenantId, branchId: input.branchId,
          lines: input.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity, unitPriceAmount: state.variants.get(l.variantId)?.priceAmount ?? 0 })),
          totalAmount: input.lines.reduce((acc, l) => acc + l.quantity * (state.variants.get(l.variantId)?.priceAmount ?? 0), 0),
          currency: 'COP',
          paymentMethod: input.paymentMethod,
          status: 'completed',
          createdAt: new Date().toISOString() as never,
          version: 1 as never
        }
        state.sales.set(sale.id, sale)
        return unwrap(sale)
      },
      refundSale: async (saleId, input) => {
        const s = state.sales.get(saleId)
        if (!s) return err({ code: 'not_found', message: 'Sale not found', status: 404 })
        if (s.status !== 'completed') return err({ code: 'state_conflict', message: `Cannot refund from ${s.status}`, status: 409 })
        const updated: Sale = { ...s, status: 'refunded', refundReason: input.reason, refundedAt: new Date().toISOString() as never }
        state.sales.set(saleId, updated)
        return unwrap(updated)
      }
    },
    admin: {
      audit: {
        list: async () => unwrap({ items: state.auditLogs, nextCursor: null })
      },
      reports: {
        daily: async (date) => unwrap({
          date,
          sales: { byChannel: { pos: state.sales.size, online: state.orders.size }, byStatus: {}, total: state.sales.size + state.orders.size },
          journalEntries: { byKind: {}, totalDebit: 0, totalCredit: 0 },
          refunds: { count: Array.from(state.sales.values()).filter((s) => s.status === 'refunded').length, total: 0 }
        })
      },
      compliance: {
        getHabeasData: async (customerId) => {
          const c = state.customers.get(customerId)
          if (!c) return err({ code: 'not_found', message: 'Customer not found', status: 404 })
          return unwrap({
            customerId,
            email: c.email,
            habeasDataConsent: c.habeasDataConsent,
            currentPolicyVersion: state.checkoutConfig.habeasDataPolicyVersion,
            policyVersionMatched: c.habeasDataConsent?.policyVersion === state.checkoutConfig.habeasDataPolicyVersion
          })
        }
      }
    }
  }
}

/** Reset all mock state (for tests). */
export const resetMockState = (): void => { states.clear() }