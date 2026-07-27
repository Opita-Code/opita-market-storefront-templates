# Pasiones Boutique Sensual — Compliance Checklist

Checklist completo de cumplimiento legal para el go-live de Pasiones. **Todos los puntos marcados como BLOQUEANTE deben estar validados antes de producción**.

## Normativa aplicable

| Norma | Año | Aplica a | Tema clave |
|---|---|---|---|
| Ley 679 | 2001 | Cualquier sitio web que comercialice productos sexuales en Colombia | Verificación de mayoría de edad |
| Decreto 1524 | 1996 | Establecimientos que comercialicen productos sexuales | Regulación de la actividad |
| Ley 1336 | 2009 | Todos los establecimientos sexuales | Aviso visible +18 + protección menores |
| Ley 1581 | 2012 | Cualquier entidad que trate datos personales en Colombia | Habeas Data |
| Decreto 1377 | 2013 | Tratamiento de datos personales | Reglamenta Ley 1581 |
| Ley 2300 | 2023 | Derecho al olvido + empaquetado discreto | Discreción comercial |

## Pre-go-live — BLOQUEANTE

### 1. Identidad legal

- [ ] Razón social confirmada: "Pasiones Boutique Sensual S.A.S." (verificar con contadora)
- [ ] NIT (tax_id) confirmado
- [ ] Cámara de comercio vigente (registro mercantil + RUT)
- [ ] Permiso municipal vigente de la Alcaldía de Neiva para operar sex shop
- [ ] Constancia de cumplimiento Decreto 1524/1996 (registro ante el Ministerio de Comercio, Industria y Turismo)

### 2. Configuración backend (`tenant.yml`)

- [ ] `tenant_id: pasiones`
- [ ] `display_name: Pasiones Boutique Sensual`
- [ ] `branding.logo_url` con URL firmada válida (Sprint 7+ cuando el cliente entregue el logo)
- [ ] `branding.primary_color: #FF1493`
- [ ] `branding.accent_color: #1FE0E0`
- [ ] `vertical_config.shipping_enabled: true` (despacho discreto habilitado)
- [ ] `catalog.categories` con las 22 categorías sex-shop (estructura jerárquica)
- [ ] `branches[0]` configurado: Neiva con `divipola_code: "41001"`
- [ ] `compliance.habeas_data_policy_url` con URL firmada del PDF en `assets.pasiones`
- [ ] `compliance.consent_text_version: "2026-07-27.2"` (o la vigente al deploy)
- [ ] `compliance.consent_text_es/en/pt` revisados por **abogada** (no solo AI)
- [ ] `wompi_refund_policy: external`
- [ ] Roles configurados (administrador / vendedor / cliente / auditor)

### 3. Configuración frontend (Storefront)

- [ ] `globals.css` reemplazado con `theme-overrides/pasiones-boutique-sensual/globals.css`
- [ ] Componentes compliance copiados a `src/components/`:
  - [ ] `AgeGate` (Ley 679/2001)
  - [ ] `HabeasDataBanner` (Ley 1581/2012)
  - [ ] `LegalDisclaimer` (Ley 1336/2009)
  - [ ] `DiscreteBillingNotice` (descriptor Wompi)
- [ ] `<AgeGate>` montado en `src/app/layout.tsx` (raíz, antes de cualquier contenido)
- [ ] `<HabeasDataBanner>` montado en el layout con props del tenant config
- [ ] `<LegalDisclaimer>` montado en `PasionesFooter`
- [ ] `<DiscreteBillingNotice>` montado en página de checkout, **antes** del botón "Pagar"
- [ ] Política de Habeas Data (PDF) subida a `assets.pasiones/habeas-data.pdf`

### 4. Configuración frontend (Admin)

- [ ] `globals.css` reemplazado con `admin-tailadmin/theme-overrides/pasiones-boutique-sensual/globals.css`
- [ ] `PasionesAdminLogin` montado en pantalla de login (con recordatorio +18)
- [ ] `AgeVerifiedSaleBadge` montado en POS flujo de venta
- [ ] `PasionesReceiptHeader/Footer` montado en generación de recibos

### 5. Configuración Wompi

- [ ] Llaves públicas/privadas/integrity en AWS Secrets Manager (`opita-market/wompi/...`)
- [ ] **Descriptor de pago discreto**: `"PB*PASIONES SAS"` configurado en Wompi dashboard
  - ⚠️ CRÍTICO: NO usar "PASIONES SEXSHOP" ni "PASIONES BOUTIQUE" ni nada que sugiera el contenido
- [ ] Webhook URL configurada: `https://market.opitacode.com/tenants/pasiones/webhooks/wompi`
- [ ] Evento `transaction.updated` suscrito
- [ ] HMAC signature secret en Secrets Manager

### 6. Cumplimiento UI específico

- [ ] **Age Gate** bloquea primera visita y persiste cookie 30 días
  - [ ] Botón "Sí, soy mayor" graba timestamp
  - [ ] Botón "No, salir" redirige a Google
  - [ ] Escape NO cierra el modal (debe clickear explícitamente)
  - [ ] Focus trap funcional
  - [ ] Accesibilidad WCAG 2.1 AA
- [ ] **Habeas Data Banner** aparece en primera visita de cada sesión
  - [ ] Texto coincide con `tenant.yml consent_text_<locale>`
  - [ ] Link a política completa funciona
  - [ ] Versión se valida contra `consent_text_version`
- [ ] **Legal Disclaimer** en footer de TODAS las páginas
  - [ ] Texto: "Venta exclusiva a mayores de 18 años. Ley 1336 de 2009."
  - [ ] Link a /habeas-data funcional
  - [ ] Teléfono de reporte de explotación sexual visible: 018000-91-99-99
- [ ] **Discrete Billing Notice** antes del botón de pago
  - [ ] Descriptor exacto visible: "PB*PASIONES SAS"
  - [ ] Checkbox obligatorio para habilitar botón
  - [ ] Opción de empaque de regalo mencionada

### 7. POS — Verificación de edad (Sprint 7+)

- [ ] Backend handler `POST /sales` rechaza si `ageVerified !== true`
- [ ] Nuevo `AuditAction: "sale.age_verified"` en el enum
- [ ] Frontend POS muestra modal con checkbox obligatorio antes de cobrar
- [ ] Audit log incluye `vendedorId + timestamp + verificationMethod: "document_check"`
- [ ] Recibo POS lleva badge "Venta verificada +18"
- [ ] No se almacena foto ni número del documento (solo flag booleano)

## Pre-go-live — RECOMENDADO (no bloqueante)

### Documentación legal visible

- [ ] Política de Habeas Data en `/habeas-data` (texto completo, no solo link al PDF)
- [ ] Términos y condiciones en `/terminos`
- [ ] Política de devoluciones en `/devoluciones` (específica para boutique sensual)
- [ ] Política de envío en `/envios` (énfasis en empaque discreto + tiempo de entrega)
- [ ] FAQ en `/faq` (incluye preguntas sobre discreción, empaque, despacho)

### Datos de contacto

- [ ] WhatsApp 318 610 7314 funcional y con respuesta
- [ ] Email `contacto@pasiones.example.co` con autorespuesta inmediata
- [ ] Email `habeas_data@pasiones.example.co` para solicitudes Ley 1581/2012
- [ ] Dirección física pública (Mall [redacted], Neiva — Huila)
- [ ] Horario de atención publicado (L-V 10:00-20:00, S 10:00-21:00, D 12:00-18:00)

### Operacional

- [ ] Backup diario de DDB (ya configurado por SST — verificar)
- [ ] Monitoreo de errores (CloudWatch alarms configuradas)
- [ ] Plan de respuesta a incidentes (qué hacer si Wompi cae, si hay chargeback masivo, etc.)
- [ ] Capacitación a vendedores sobre verificación de edad (Sesión + documento)

## Post-go-live — Monitoreo continuo

### Diario

- [ ] Revisar audit log buscando `sale.age_verification_failed` (si > 0%, hay problema)
- [ ] Verificar chargebacks Wompi (debe ser < 1% — discreción del descriptor funciona)
- [ ] Revisar emails a `habeas_data@` (solicitudes de supresión, revocación)

### Semanal

- [ ] Revisar `daily_report` del backend (volumen, ventas por categoría)
- [ ] Validar que TODAS las ventas tengan `age_verified: true` (Sprint 7+)
- [ ] Backup verificado

### Mensual

- [ ] Revisar consentimiento: ¿la versión `consent_text_version` sigue vigente?
- [ ] Si hubo cambio en la política, bumpear versión y verificar re-captura
- [ ] Auditar `customer.habeasDataConsent` con respecto al histórico

### Anual

- [ ] Renovación permiso municipal
- [ ] Renovación registro Decreto 1524/1996
- [ ] Revisar textos legales con abogada (cambios legislativos)
- [ ] Auditoría externa de cumplimiento (opcional pero recomendado)

## Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Venta a menor de edad | Multa + cierre + demanda penal | POS bloquea venta sin `age_verified`; age gate bloquea web |
| Descriptor Wompi revelador | Chargebacks + daño reputacional | Configurar `"PB*PASIONES SAS"` desde día 1; nunca cambiar |
| Filtración de datos de clientes | Multa SIC + demanda + daño reputacional | Cifrado en tránsito + reposo; retención 5 años; habeas data activo |
| Venta de productos sin restricción de envío | Multa municipal | Sprint 7+ per-category variant schemas + shipping restrictions |
| Cambio de política sin bumpear versión | No se re-captura consentimiento | Operador bumpea `consent_text_version` en cada cambio |
| Cliente exige supresión inmediata de datos | Multa SIC | Endpoint `DELETE /api/customers/:id` con validación + audit |

## Canales de reporte

- **Línea nacional contra explotación sexual de menores**: 018000-91-99-99 (visible en LegalDisclaimer)
- **Superintendencia de Industria y Comercio (SIC)**: para quejas Ley 1581/2012
- **Alcaldía de Neiva**: para quejas sobre operación comercial

## Firmas requeridas pre-deploy

| Rol | Firma | Fecha |
|---|---|---|
| Propietario (negocio) | __________________ | ____/____/____ |
| Abogada | __________________ | ____/____/____ |
| Contadora | __________________ | ____/____/____ |
| Operador técnico | __________________ | ____/____/____ |

Una vez firmado, deploy procederá.

## Referencias

- `theme-overrides/pasiones-boutique-sensual/components/compliance/` — implementación UI
- `theme-overrides/pasiones-boutique-sensual/lib/brand.ts` — copy oficial
- `admin-tailadmin/theme-overrides/pasiones-boutique-sensual/docs/pos-age-verification-flow.md` — flujo POS
- `integration/src/i18n/locales.ts` — keys i18n (age_gate.*, legal_disclaimer.*, pos.age_verification.*)
- Ley 679/2001: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=18309
- Ley 1336/2009: https://www.suin-juriscol.gov.co/
- Ley 1581/2012: https://www.suin-juriscol.gov.co/