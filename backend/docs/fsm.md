# Finite State Machines

The backend enforces FSM rules on `Sale` and `Order`. The UI must reflect these transitions — never show buttons for invalid transitions.

## Sale FSM (4 states)

```
            ┌────────┐
            │ draft  │
            └───┬────┘
                │ complete
                ▼
            ┌─────────┐  void    ┌────────┐
            │completed├─────────►│ voided │
            └────┬────┘          └────────┘
                 │ refund
                 ▼
            ┌─────────┐
            │refunded │
            └─────────┘
```

| From | To | Trigger | Permission |
|------|----|---------|-----------|
| `draft` | `completed` | POS scan complete / Wompi APPROVED webhook | `pos.sale.create` (admin) or Wompi webhook |
| `completed` | `voided` | Manual void (admin only, pre-end-of-day) | `sale.void` |
| `completed` | `refunded` | POST /pos/sales/:id/refund or POST /orders/:id/refund | `sale.refund` or `order.refund` |

**Refund guard** (Sprint 6):
- Sale: status MUST be `completed` to refund
- Refund emits a `kindKind="reverse"` JournalEntry + restores stock per refunded line
- Wompi refund policy: `external` (no API call) or `automatic` (calls Wompi refund API)

**Atomicity gap** (Sprint 7+ candidate):
- Sale status update + refunds JE Put are atomic (TransactWriteItems 2 items)
- Stock restoration per line is a SEPARATE transaction per line
- Partial restoration failures are surfaced as `stockFailures[]` in response
- Sprint 7+ will move to single multi-item transaction with max-lines cap

## Order FSM (7 states)

```
pending-payment ──► paid ──► ready-for-pickup ──► completed
       │           │ │              │                  │
       │           │ └─► cancelled  │                  │
       │           │                │                  │
       │           └────────────►  refunded  ◄─────────┘
       │                              ▲
       └──────────────────────────────┘
```

| From | To | Trigger | Permission |
|------|----|---------|-----------|
| `pending-payment` | `paid` | Wompi webhook APPROVED | Wompi webhook |
| `paid` | `ready-for-pickup` | Admin marks ready | `order.update` |
| `ready-for-pickup` | `completed` | Customer pickup (auto after 7 days) or manual | `order.update` |
| `paid` / `ready-for-pickup` / `completed` | `refunded` | POST /orders/:id/refund | `order.refund` |
| `pending-payment` | `cancelled` | Wompi webhook DECLINED / ERROR / timeout (30 min) | Wompi webhook |
| `paid` | `cancelled` | Admin force-cancel (rare — requires reversal) | `order.update` + `sale.void` |

**Refund guard**: Order must be in `paid`, `ready-for-pickup`, or `completed` to refund.

**Wompi status mapping** (Sprint 4):
- `APPROVED` → `paid`
- `DECLINED` → `cancelled`
- `VOIDED` → `cancelled`
- `ERROR` → `cancelled`
- `PENDING` → no state change (wait for next webhook)

## Cart FSM (4 states)

```
active ──► reserved ──► converted
  │           │
  └───────────┴──► expired
```

| From | To | Trigger | Notes |
|------|----|---------|-------|
| `active` | `reserved` | POST /cart/:id/reserve | 15-min TTL; expires via sweeper |
| `reserved` | `converted` | POST /checkout | 30-min TTL after conversion |
| `active` or `reserved` | `expired` | Sweeper Lambda (every 1 min) | Releases reserved stock |

Cart TTLs are configurable per tenant: `reservationTtlMinutes` (default 15) + `checkoutTtlMinutes` (default 30).

## Why this matters for frontends

The integration package's FSM helpers (`../integration/src/fsm/`) expose typed predicates:

```typescript
import { canRefund, saleNextStates } from '@opita/market-integration/fsm'

if (canRefund(sale)) {
  // show "Refund" button
}

const transitions = saleNextStates(sale.status)
// → [{ to: 'refunded', label: 'Refund', requires: 'sale.refund' }]
```

A frontend should NEVER encode FSM rules itself — always use the integration helpers. The backend is the source of truth; the integration mirrors it.