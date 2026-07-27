# POS — Flujo de verificación de edad (Ley 679/2001)

## Contexto legal

**Ley 679 de 2001 art. 4** establece que los establecimientos que comercializan productos sexuales deben **verificar la mayoría de edad** de los compradores al momento de la venta. La verificación debe hacerse mediante documento de identidad válido.

**Ley 1336 de 2009** refuerza esta obligación y exige que el aviso "Venta exclusiva a mayores de 18 años" sea **visible** en el local y en cualquier material publicitario o transaccional.

## Estado del flujo en Sprint 7+

Este flujo se implementa en Sprint 7+ (el backend aún no tiene el handler `POST /sales` con verificación de edad). Por ahora, este documento describe la especificación; los componentes del theme override ya están listos para enchufarse.

## Flujo paso a paso

### 1. Vendedor escanea productos

El vendedor agrega productos al carrito (POS screen). Esto ya funciona en Sprint 6 (cart endpoint + optimistic version).

### 2. Vendedor presiona "Cobrar"

El sistema navega a la pantalla de checkout del POS. Aquí se monta el componente `AgeVerificationPrompt` (Sprint 7+).

### 3. Sistema pide verificación

El sistema muestra un modal centrado con:

```
┌─────────────────────────────────────┐
│  ⚠ Verificación de mayoría de edad  │
│                                     │
│  Antes de procesar la venta,        │
│  confirma que verificaste el        │
│  documento de identidad del         │
│  cliente y que es mayor de 18 años  │
│  (Ley 679/2001, art. 4).           │
│                                     │
│  □ Verifiqué documento de identidad │
│    del cliente (mayor de 18 años)   │
│                                     │
│              [Cancelar] [Confirmar] │
└─────────────────────────────────────┘
```

El botón "Confirmar" está **deshabilitado** hasta que el checkbox esté marcado.

### 4. Vendedor confirma verificación

Al confirmar, el sistema:

1. Registra `audit.action = "sale.age_verified"` con:
   - `vendedorId`: del JWT
   - `saleDraftId`: id del borrador de venta
   - `timestamp`: ISO 8601
   - `verificationMethod`: "document_check" (default; Sprint 7+ podría añadir "document_photo" o "third_party_id")

2. Habilita el botón "Procesar venta"

3. Continúa con el flujo normal de cobro (cash / card / wompi)

### 5. Venta procesada

El `Sale.create` handler del backend incluye `metadata.ageVerified: true + ageVerifiedBy: vendedorId + ageVerifiedAt: timestamp`.

El recibo (térmico/PDF/email) lleva el badge `AgeVerifiedSaleBadge` con status `verified`.

## Componentes del theme override

| Componente | Archivo | Dónde se monta |
|---|---|---|
| `AgeVerifiedSaleBadge` | `components/compliance/AgeVerifiedSaleBadge.tsx` | Lista de ventas (backoffice) + recibo |
| `PasionesReceiptHeader` | `components/receipt/PasionesReceiptHeader.tsx` | Header del recibo (térmico/PDF/email) |
| `PasionesReceiptFooter` | mismo archivo | Pie del recibo |
| `PasionesAdminLogin` | `components/login/PasionesAdminLogin.tsx` | Pantalla de login (recordatorio +18) |

## Sprint 7+ — tareas pendientes

1. **Backend**: handler `POST /sales` rechaza si `ageVerified !== true` en metadata
2. **Backend**: nuevo `AuditAction = "sale.age_verified"` en el enum
3. **Backend**: integración con DIAN para factura electrónica (cuando `features.invoicing = true`)
4. **Frontend POS**: componente `AgeVerificationPrompt` (modal con checkbox)
5. **Frontend POS**: lógica para "bloquear" botón "Procesar venta" hasta verificar
6. **Auditoría**: dashboard para auditores con filtro `age_verified` para revisar todas las verificaciones

## Lo que NO se almacena

Por privacidad y minimización de datos (Ley 1581/2012 art. 4), **NO se almacena**:

- ❌ Foto del documento de identidad
- ❌ Número del documento
- ❌ Fecha de nacimiento del cliente
- ❌ Nombre del cliente (si es venta anónima — Sprint 7+)

**Solo se almacena**: un flag booleano `ageVerified: true + vendedorId + timestamp`. La auditoría puede revisar la operación si hay disputa legal, pero no se retiene PII innecesario.

## Edge cases

### Cliente se niega a mostrar documento

Si el cliente se niega a mostrar documento, el vendedor **debe rechazar la venta**. Esto no es opcional. El sistema no tiene un flujo para "vender sin verificar" — la UI bloquea el botón "Procesar venta" hasta que la verificación esté marcada.

Si el cliente insiste, el vendedor le explica que es un requisito legal. Si hay conflicto, el vendedor puede llamar al administrador. No hay override.

### Cliente presenta documento falso

Esto es responsabilidad penal del cliente (Código Penal colombiano, art. 286 — falsedad ideológica). El vendedor cumplió con su obligación al solicitar el documento. El sistema no necesita verificar autenticidad del documento (es competencia de las autoridades).

### Cliente menor de edad

Si el vendedor sospecha que el documento es de un menor (o el cliente confiesa serlo), **rechaza la venta inmediatamente** y registra el intento en audit log como `sale.age_verification_failed` (Sprint 7+). NO se procesa el cobro. Si el cliente es insistente, el vendedor contacta al administrador. No se contacta a las autoridades automáticamente (sería escalada manual del administrador).