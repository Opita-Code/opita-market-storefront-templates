# API Cookbook — endpoints del backend `opita-market-templates`

> Cómo cada plantilla consume el backend. Companion de los runbooks del
> backend (`opita-market-templates/docs/runbooks/`).

**Asume**: backend v0.1.0+ (Sprint 6). Versiones anteriores no exponen `/audit`, `/reports/daily`, ni `/checkout/config`.

## Convenciones

- **Base URL**: `https://api.opitacode.com` (prod) o `https://api-staging.opitacode.com`
- **Tenant ID**: siempre en el URL path: `/tenants/:tenantId/...`
- **Auth**: cookie OCAIS (`opita_session`) firmada; el backend la valida automáticamente vía `authMiddleware`.
- **Content-Type**: `application/json` para POST/PUT; el backend responde `application/json`.
- **Errores**: `{ error: { code: string, message: string } }` con HTTP status apropiado.

## Por plantilla

### admin-tailadmin (POS + backoffice)

#### Salud

```
GET /health
→ 200 { status: "ok", stackName: "...", tenantId: "...", version: "..." }
```

#### Auditoría

```
GET /tenants/:tenantId/admin/audit?actorEmail=&action=&targetType=&targetId=&limit=&cursor=
Cookie: opita_session=...

→ 200 { items: AuditLog[], nextCursor: string | null }
→ 403 forbidden  // auditor role missing
→ 401 unauthorized  // cookie missing/expired
```

#### Reporte diario

```
GET /tenants/:tenantId/admin/reports/daily?date=YYYY-MM-DD
Cookie: opita_session=...

→ 200 {
    date, currency,
    sales: { count, byChannel: {pos, online}, byStatus, total: {amount, currency} },
    journalEntries: { count, byKind, totalDebit, totalCredit },
    refunds: { count, total }
  }
→ 400 invalid_date | future_date
```

#### Productos (admin CRUD)

```
GET /tenants/:tenantId/admin/products?limit=&cursor=
→ 200 { items: Product[], nextCursor }

POST /tenants/:tenantId/admin/products
Body: ProductCreateInput
→ 201 { product }

PUT /tenants/:tenantId/admin/products/:id
Body: ProductUpdateInput
→ 200 { product }

POST /tenants/:tenantId/admin/products/:id/deactivate
→ 200 { product: Product with isActive=false }
```

#### Variantes

```
POST /tenants/:tenantId/admin/products/:productId/variants
Body: { sku, attributeValues, price, cost?, barcode?, weightGrams?, isActive }
→ 201 { variant }
```

#### Sucursales

```
GET /tenants/:tenantId/admin/branches
POST /tenants/:tenantId/admin/branches
Body: { id, divipola_code, name, address?, phone?, email?, hours?, is_active, is_pickup_enabled, geolocation? }
→ 201 { branch }
```

#### Stock (ajuste manual + transferencia)

```
POST /tenants/:tenantId/admin/stock/adjust
Body: { branchId, variantId, delta: -5, reason: "adjustment", expectedVersion, notes? }
→ 200 { stock, movement }

POST /tenants/:tenantId/admin/stock/transfer
Body: { fromBranchId, toBranchId, variantId, quantity, expectedFromVersion, expectedToVersion, notes? }
→ 200 { fromStock, toStock, fromMovement, toMovement }
```

#### POS

```
POST /tenants/:tenantId/pos/sales
Body: { branchId, paymentMethod }
→ 201 { sale }   // status=draft

POST /tenants/:tenantId/pos/sales/:saleId/lines/scan
Body: { barcode, quantity, expectedVersion }
→ 200 { sale, line }
→ 422 insufficient_stock

POST /tenants/:tenantId/pos/sales/:saleId/complete
Body: { expectedVersion, paymentRef?: { provider, transactionId } }
→ 200 { sale, journalEntryIds, stockFailures? }
→ 422 empty_sale

POST /tenants/:tenantId/pos/sales/:saleId/refund
Body: { reason, refundLines?: [{ variantId, quantity }], expectedVersion }
→ 200 { sale, refundJournalEntryId, refundAmount, stockFailures? }
→ 409 sale_not_refundable  // sale.status !== completed
→ 422 invalid_refund_request | invalid_refundLines
```

#### Orders (online)

```
GET /tenants/:tenantId/orders/:id
→ 200 { order } | 404 order_not_found

POST /tenants/:tenantId/orders/:id/ready-for-pickup
→ 200 { order: with pickupCode + pickupExpiresAt }

POST /tenants/:tenantId/orders/:id/complete
Body: { pickupCode }   // 6-char alphanumeric
→ 200 { order } | 403 pickup_code_mismatch

POST /tenants/:tenantId/orders/:id/refund
Body: { reason, expectedVersion }
→ 200 { order, saleId, refundJournalEntryId, refundAmount }
→ 404 sale_not_found_for_order
```

---

### ecommerce-storefront (B2C cliente)

#### Config público (sin auth)

```
GET /tenants/:tenantId/checkout/config
→ 200 {
    currency, reservationTtlMinutes, checkoutTtlMinutes,
    habeasDataPolicyUrl, habeasDataPolicyVersion,
    consentTexts: { es, en?, pt?, version },
    wompiRefundPolicy: "external" | "automatic"
  }
```

**El frontend debe llamar este endpoint una sola vez al boot** y cachear en Context (ver `INTEGRATION.md §3`).

#### Catálogo (público, isActive filter server-side)

```
GET /tenants/:tenantId/catalog/products?category=&limit=&cursor=
→ 200 { items: Product[], nextCursor }

GET /tenants/:tenantId/catalog/products/:id
→ 200 { product, variants: Variant[] } | 404 product_not_found

GET /tenants/:tenantId/catalog/branches
→ 200 { items: Branch[], nextCursor }  // isActive=true + isPickupEnabled=true

GET /tenants/:tenantId/catalog/branches/:branchId/stock/:variantId
→ 200 { variantId, branchId, quantity, reservedQuantity, available }
```

#### Cart (cliente autenticado)

```
POST /tenants/:tenantId/cart/reservations
Body: { variantId, branchId, quantity, expectedStockVersion }
→ 201 { reservation }
→ 422 insufficient_stock | variant_inactive | stock_not_found

GET /tenants/:tenantId/cart/reservations?status=active&limit=&cursor=
→ 200 { items: CartReservation[], nextCursor }

DELETE /tenants/:tenantId/cart/reservations/:reservationId
→ 200 { released: reservationId }
→ 404 reservation_not_found
→ 409 reservation_not_releasable
```

#### Checkout

```
POST /tenants/:tenantId/orders/checkout
Body: {}   // el cliente ya eligió branchId al agregar al cart
→ 201 {
    order,   // status=pending-payment
    wompiTransactionId,
    widgetUrl,  // iframe URL
    expiresAt,
  }
→ 400 no_active_cart | multi_branch_cart | zero_total
→ 413 too_many_reservations
```

#### Orders (cliente autenticado)

```
GET /tenants/:tenantId/orders/:id
→ 200 { order } | 404
→ 403 forbidden  // cliente intentando ver pedido ajeno

GET /tenants/:tenantId/orders?status=&limit=&cursor=
→ 200 { items, nextCursor }
Cliente solo ve sus propios pedidos (customerId del JWT).

POST /tenants/:tenantId/orders/:id/cancel
→ 200 { order } | 409 order_not_cancellable
```

#### Me

```
GET /tenants/:tenantId/me
→ 200 { user: { email, customerId, branchIds, roles } }
```

#### Wompi webhook (server-side, no para storefront)

```
POST /tenants/:tenantId/webhooks/wompi
Headers: wompi_hash (HMAC-SHA256)
Body: Wompi event payload
→ 200 (validates + emits Sale + JournalEntries + consumes CartReservations)
```

---

### booking-service (Sprint 7+ — pending)

Pendiente hasta que el vertical `services-with-bookings` se implemente en el backend.

Endpoints target:
- `GET /tenants/:id/services`
- `GET /tenants/:id/services/:id/availability?date=YYYY-MM-DD`
- `POST /tenants/:id/bookings`
- `GET /tenants/:id/bookings/:id`
- `POST /tenants/:id/bookings/:id/cancel`

---

### landing-marketing (Sprint 2 — no backend)

Sin endpoints. El sitio es estático. CTA → tenant's ecommerce-storefront.

## Tipos compartidos (TypeScript)

El backend publica `@opita-market/core` con todas las entidades. Sprint 7+
recomendación: crear `@opita-market/contracts` (types-only, public npm) para
que las plantillas frontend importen los tipos sin depender del paquete
core (que tiene dependencias de SST/Node).

Alternativa: `tsc --emitDeclarationOnly` sobre `packages/core/` + public npm.

## Errores comunes y cómo diagnosticarlos

| HTTP | code | Causa | Fix frontend |
|---|---|---|---|
| 400 | missing_variantId | body falta campo | Validate antes de POST |
| 400 | invalid_quantity | quantity no es entero ≥1 | UI: solo inputs numéricos |
| 401 | (cookie expirada) | OCAIS session expirada | Redirect /login con returnTo |
| 403 | forbidden | cliente intentando acceso admin | Hide UI + redirect /403 |
| 403 | branch_forbidden | vendedor sin scope en esta branch | Hide branch selector option |
| 404 | product_not_found | producto desactivado o mal id | Refresh catalog, hide card |
| 409 | stale_version | otro admin modificó la misma fila | Re-fetch + re-submit |
| 422 | insufficient_stock | no hay stock disponible | Toast + re-fetch variant |
| 422 | empty_sale | intentando cobrar venta sin líneas | Disable Complete button |
| 502 | wompi_unavailable | Wompi API down | Retry + support contact |

## Reference

- Backend runbooks: `opita-market-templates/docs/runbooks/`
- Catalog runbook (Sprint 1): `opita-market-templates/docs/runbooks/mvp6-catalog-branches.md`
- Stock runbook (Sprint 2): `opita-market-templates/docs/runbooks/mvp6-stock-movements.md`
- Cart runbook (Sprint 3): `opita-market-templates/docs/runbooks/mvp6-cart-reservations.md`
- Order + Wompi runbook (Sprint 4): `opita-market-templates/docs/runbooks/mvp6-order-wompi.md`
- POS runbook (Sprint 5): `opita-market-templates/docs/runbooks/mvp5-pos-journal.md`
- Refunds + Audit + Habeas Data runbook (Sprint 6): `opita-market-templates/docs/runbooks/mvp6-refunds-audit.md`