import type { Result, ApiError } from '../types/result.js'
import { err, ok, toApiError } from '../types/result.js'
import type { OrderStatus } from '../types/sale.js'

/**
 * Wompi webhook parser — verifies HMAC-SHA256 signature and normalizes the
 * payload shape for typed consumption.
 *
 * Wompi sends events like:
 *   {
 *     "event": "transaction.updated",
 *     "data": {
 *       "transaction": {
 *         "id": "01-...", "status": "APPROVED", "reference": "...", "amount_in_cents": 1234567, ...
 *       }
 *     },
 *     "signature": { "properties": ["transaction.id", "transaction.status", ...], "checksum": "abc..." },
 *     "environment": "production"
 *   }
 *
 * Verification: HMAC-SHA256(concatenated-property-values, WOMPI_EVENTS_KEY) === checksum
 * MUST be done with timingSafeEqual.
 */

export interface WompiTransaction {
  readonly id: string
  readonly status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING'
  readonly reference: string  // our orderId
  readonly amountInCents: number
  readonly currency: string
  readonly paymentMethodType?: string
  readonly finalizedAt?: string
}

export interface WompiEvent {
  readonly event: 'transaction.updated' | string
  readonly environment: 'production' | 'sandbox'
  readonly transaction: WompiTransaction
  readonly timestamp: string
}

export interface WompiWebhookBody {
  readonly event: string
  readonly data: { readonly transaction: WompiTransaction }
  readonly signature: { readonly properties: readonly string[]; readonly checksum: string }
  readonly environment?: string
}

/**
 * Verify HMAC signature. Uses Node crypto; in a browser environment, use the
 * SubtleCrypto adapter in ./browser.ts (future).
 *
 * IMPORTANT: this function is ONLY available in Node 20+ runtime.
 */
export const verifyWompiSignature = async (
  body: WompiWebhookBody,
  eventsKey: string
): Promise<boolean> => {
  if (!body.signature?.properties || !body.signature.checksum) return false

  // Concatenate the property values in order, e.g. "01-xxx" + "APPROVED" + ...
  const concatenated = body.signature.properties
    .map((propPath) => {
      // e.g. "transaction.id" → data.transaction.id
      const parts = propPath.split('.')
      let v: unknown = body.data
      for (const p of parts) {
        if (v && typeof v === 'object' && p in v) {
          v = (v as Record<string, unknown>)[p]
        } else {
          return ''
        }
      }
      return String(v ?? '')
    })
    .join('')

  const { createHmac, timingSafeEqual } = await import('node:crypto')
  const computed = createHmac('sha256', eventsKey).update(concatenated).digest('hex')

  // timingSafeEqual requires equal-length buffers; compare lengths first to avoid throwing
  if (computed.length !== body.signature.checksum.length) return false
  return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(body.signature.checksum, 'hex'))
}

export const parseWompiWebhook = async (
  rawBody: string | WompiWebhookBody,
  eventsKey: string
): Promise<Result<WompiEvent, ApiError>> => {
  let body: WompiWebhookBody
  try {
    body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
  } catch (e) {
    return err({ code: 'parse_error', message: 'Invalid JSON body', status: 400 })
  }

  if (!body.event || !body.data?.transaction || !body.signature) {
    return err({ code: 'invalid_event', message: 'Missing required fields', status: 400 })
  }

  const valid = await verifyWompiSignature(body, eventsKey)
  if (!valid) {
    return err({ code: 'invalid_signature', message: 'HMAC signature mismatch', status: 401 })
  }

  return ok({
    event: body.event,
    environment: (body.environment as 'production' | 'sandbox') ?? 'production',
    transaction: body.data.transaction,
    timestamp: new Date().toISOString()
  })
}

/**
 * Map Wompi transaction status → Order FSM status.
 * Returns null for PENDING (no state change yet, wait for next webhook).
 */
export const mapWompiStatusToOrderStatus = (
  wompiStatus: WompiTransaction['status']
): OrderStatus | null => {
  switch (wompiStatus) {
    case 'APPROVED': return 'paid'
    case 'DECLINED':
    case 'VOIDED':
    case 'ERROR': return 'cancelled'
    case 'PENDING': return null
    default: return null
  }
}