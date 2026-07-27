import type { TenantId } from '../types/money.js'
import { ok, err, toApiError, type ApiError, type Result } from '../types/result.js'

/**
 * ClientConfig — passed to createClient().
 *
 * In production, fetch is used directly. In tests/dev, mock: true swaps in
 * an in-memory implementation (see ./mock.ts).
 */
export interface ClientConfig {
  readonly baseUrl: string  // e.g. "https://market.opitacode.com"
  readonly tenantId: TenantId
  readonly fetchFn?: typeof fetch  // injectable for SSR + tests
  readonly authToken?: string  // OCAIS JWT
  readonly mock?: boolean  // if true, all calls go to in-memory mock
}

export interface ListOptions {
  readonly limit?: number
  readonly cursor?: string
}

export interface CartCreateInput {
  readonly branchId: string
}

export interface CartAddItemInput {
  readonly variantId: string
  readonly quantity: number
  readonly expectedStockVersion?: number
}

export interface CartHabeasDataInput {
  readonly accepted: boolean
  readonly policyVersion: string
}

export interface CheckoutCreateInput {
  readonly cartId: string
  readonly customerEmail: string
  readonly customerFullName?: string
  readonly customerPhone?: string
}

export interface PosSaleCreateInput {
  readonly branchId: string
  readonly paymentMethod: 'cash' | 'card' | 'transfer'
  readonly lines: ReadonlyArray<{ readonly variantId: string; readonly quantity: number }>
  readonly expectedVersion?: number
}

export interface RefundInput {
  readonly reason: string
  readonly refundLines?: ReadonlyArray<{ readonly variantId: string; readonly quantity: number }>
  readonly notes?: string
}

export interface AuditListFilter {
  readonly actorEmail?: string
  readonly action?: string
  readonly targetType?: string
  readonly targetId?: string
  readonly limit?: number
  readonly cursor?: string
}

export interface HttpRequestOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  readonly body?: unknown
  readonly headers?: Record<string, string>
  readonly queryParams?: unknown
}

/**
 * Build a full URL from base + path + query params.
 * Strips undefined values and stringifies booleans.
 */
export const buildUrl = (
  base: string,
  path: string,
  queryParams?: unknown
): string => {
  const url = new URL(path, base)
  if (queryParams && typeof queryParams === 'object') {
    for (const [k, v] of Object.entries(queryParams as Record<string, unknown>)) {
      if (v === undefined) continue
      url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

/**
 * Parse error response from backend into typed ApiError.
 * Backend always returns { error: { code, message, details? } } shape.
 */
export const parseErrorResponse = (
  status: number,
  body: unknown
): ApiError => {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const e = (body as { error: { code?: string; message?: string; details?: unknown } }).error
    return {
      code: (e.code as ApiError['code']) ?? 'internal_error',
      message: e.message ?? `HTTP ${status}`,
      status,
      details: e.details as Record<string, unknown> | undefined
    }
  }
  return {
    code: status >= 500 ? 'service_unavailable' : status === 429 ? 'rate_limited' : 'internal_error',
    message: `HTTP ${status}`,
    status
  }
}

/**
 * Low-level HTTP wrapper — adds tenant header, parses JSON, normalizes errors.
 * Exposed for the SDK internals; consumers should use the typed methods instead.
 */
export const httpRequest = async <T>(
  config: ClientConfig,
  path: string,
  options: HttpRequestOptions = {}
): Promise<Result<T, ApiError>> => {
  const fetchFn = config.fetchFn ?? fetch
  const method = options.method ?? 'GET'
  const url = buildUrl(config.baseUrl, path, options.queryParams)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Id': config.tenantId,
    ...options.headers
  }
  if (config.authToken) {
    headers['Authorization'] = `Bearer ${config.authToken}`
  }

  let response: Response
  try {
    response = await fetchFn(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    })
  } catch (e) {
    return { ok: false, error: toApiError(e, 0) as ApiError }
  }

  let parsed: unknown
  try {
    parsed = await response.json()
  } catch {
    return err(parseErrorResponse(response.status, undefined))
  }

  if (!response.ok) {
    return err(parseErrorResponse(response.status, parsed))
  }

  return ok(parsed as T)
}