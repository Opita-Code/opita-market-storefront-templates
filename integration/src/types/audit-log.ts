import type { IsoDateTime, TenantId } from './money.js'

/**
 * 22 AuditAction values (Sprint 6). Adding a new value requires a backend sprint
 * that adds the corresponding emit() call in the relevant handler.
 */
export type AuditAction =
  | 'product.create' | 'product.update' | 'product.deactivate'
  | 'variant.create' | 'variant.update'
  | 'branch.create' | 'branch.update'
  | 'stock.adjust' | 'stock.transfer'
  | 'cart.create' | 'cart.add_item' | 'cart.remove_item' | 'cart.reserve' | 'cart.expire'
  | 'cart.habeas_data_consent_captured' | 'cart.habeas_data_consent_bumped'
  | 'order.create' | 'order.refund' | 'order.cancel'
  | 'sale.create' | 'sale.refund' | 'sale.void'
  | 'wompi.webhook_received' | 'wompi.refund.external_handled_outside_platform'
  | 'audit.list'

export type AuditTargetType =
  | 'product' | 'variant' | 'branch' | 'stock'
  | 'cart' | 'order' | 'sale' | 'customer' | 'journal_entry' | 'audit_log'

export interface AuditLog {
  readonly id: string  // aud_<random-hex>
  readonly tenantId: TenantId
  readonly actorEmail: string
  readonly actorSubject?: string | null  // OCAIS sub
  readonly action: AuditAction
  readonly targetType?: AuditTargetType
  readonly targetId?: string | null
  readonly ipAddress?: string | null
  readonly userAgent?: string | null
  readonly requestId?: string | null
  readonly metadata?: Record<string, unknown> | null
  readonly createdAt: IsoDateTime
  readonly expiresAtEpochSeconds: number  // DDB native TTL (1825 days)
}

/** JournalEntryKind — Sprint 6 adds "reverse" for refund counter-entries. */
export type JournalEntryKind = 'sale' | 'refund' | 'reverse' | 'adjustment'

export interface JournalEntryLine {
  readonly account: string  // PUC code, e.g. "1105" (caja), "4135" (ventas), "4175" (devoluciones)
  readonly debitMinor?: number
  readonly creditMinor?: number
}

export interface JournalEntry {
  readonly id: string
  readonly tenantId: TenantId
  readonly date: IsoDateTime
  readonly kind: JournalEntryKind
  readonly lines: readonly JournalEntryLine[]
  readonly referenceType: 'sale' | 'order' | 'refund' | 'manual'
  readonly referenceId: string
  readonly actorId: string
  readonly metadata?: Record<string, unknown> | null  // for reverse: { originalId, originalCreatedAt, originalKind, reason }
  readonly createdAt: IsoDateTime
}