import type { ClientConfig, AuditListFilter } from './http.js'
import { httpRequest } from './http.js'
import type { Result } from '../types/result.js'
import type { ApiError } from '../types/result.js'
import type { AuditLog } from '../types/audit-log.js'
import type { DailyReport } from '../types/checkout.js'
import type { Page } from '../types/catalog.js'
import type { HabeasDataConsent } from '../types/cart.js'

export interface AuditHandlers {
  list(filters?: AuditListFilter): Promise<Result<Page<AuditLog>, ApiError>>
}

export const auditHandlers = (config: ClientConfig): AuditHandlers => ({
  list: (filters) => httpRequest<Page<AuditLog>>(config, `/tenants/${config.tenantId}/admin/audit`, { queryParams: filters })
})

export interface ReportsHandlers {
  daily(date: string): Promise<Result<DailyReport, ApiError>>
}

export const reportsHandlers = (config: ClientConfig): ReportsHandlers => ({
  daily: (date) => httpRequest<DailyReport>(config, `/tenants/${config.tenantId}/admin/reports/daily`, { queryParams: { date } })
})

export interface ComplianceHandlers {
  getHabeasData(customerId: string): Promise<Result<{
    customerId: string
    email: string
    habeasDataConsent: HabeasDataConsent | null
    currentPolicyVersion: string
    policyVersionMatched: boolean
  }, ApiError>>
}

export const complianceHandlers = (config: ClientConfig): ComplianceHandlers => ({
  getHabeasData: (customerId) => httpRequest(config, `/tenants/${config.tenantId}/admin/customers/${customerId}/habeas-data`)
})