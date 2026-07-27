/**
 * Result<T, E> — typed success/error union.
 * Methods in this package return Result instead of throwing.
 *
 * Pattern: "no exceptions for control flow". Every operation either succeeds
 * with a value or fails with a typed error. This forces consumers to handle
 * failure cases at the type level.
 */
export type Result<T, E = ApiError> = Ok<T> | Err<E>

export interface Ok<T> {
  readonly ok: true
  readonly value: T
}

export interface Err<E> {
  readonly ok: false
  readonly error: E
}

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })

/**
 * Typed error codes that mirror the backend's error.code values (see ../backend/docs/errors.md).
 * Adding a new error here is a contract change — keep in sync with backend handler HttpError throws.
 */
export type ApiErrorCode =
  // 4xx
  | 'validation_failed' | 'invalid_format' | 'out_of_range' | 'required_field_missing'
  | 'unauthorized' | 'invalid_token' | 'invalid_audience' | 'token_expired'
  | 'tenant_mismatch' | 'forbidden' | 'missing_permission'
  | 'not_found' | 'conflict' | 'insufficient_stock' | 'state_conflict'
  | 'precondition_failed' | 'payload_too_large' | 'rate_limited'
  | 'invalid_signature' | 'invalid_event'
  // 5xx
  | 'internal_error' | 'service_unavailable' | 'network_error' | 'parse_error'

export interface ApiError {
  readonly code: ApiErrorCode
  readonly message: string
  readonly status?: number
  readonly details?: Record<string, unknown>
}

/** Wraps a thrown error into a typed ApiError. */
export const toApiError = (e: unknown, fallbackStatus = 500): ApiError => {
  if (e instanceof Error) {
    return { code: 'internal_error', message: e.message, status: fallbackStatus }
  }
  return { code: 'internal_error', message: String(e), status: fallbackStatus }
}