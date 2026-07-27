# Pasiones Boutique Sensual — Admin Theme Override

Customización visual de **admin-tailadmin** (TailAdmin / free-nextjs-admin-dashboard, MIT) para el backoffice de Pasiones. Pensado para uso interno por `administrador` y `vendedor` en POS + backoffice.

**A diferencia del storefront**, este override es **sutil** — los admins no consumen marca, consumen información operativa. La marca Pasiones aparece solo en:
- Pantalla de login (identidad visual + aviso Ley 679/2001)
- Header del ticket POS (cuando se imprime)
- Badge de "Venta verificada +18" en el flujo POS

## Lo que se customiza vs lo que NO

| Elemento | Customizado | Por qué |
|---|---|---|
| Pantalla de login | ✅ Logo + colores Pasiones + aviso +18 | Identidad + cumplimiento |
| Sidebar nav | ❌ Tailwind default gris | Operacional, no estético |
| Tablas de datos | ❌ Default | Densidad de información > estética |
| Botones primarios | ✅ Hot pink | Coherencia con storefront |
| POS — flujo de venta | ✅ Banner de verificación de edad | Cumplimiento Ley 679/2001 art. 4 |
| POS — recibo | ✅ Header Pasiones + aviso Ley 1336/2009 | Marca en papel + cumplimiento |
| Audit log | ❌ Default | Información técnica, no decorativa |

## Estructura

```
theme-overrides/pasiones-boutique-sensual/
├── README.md                              ← este archivo
├── globals.css                            ← tokens (NO reemplazar el globals del TailAdmin completo;
│                                            este es un set mínimo de Pasiones tokens para admin)
├── components/
│   ├── theme/
│   │   └── pasionesTokens.ts              ← tokens TypeScript para usar en componentes admin
│   ├── login/
│   │   └── PasionesAdminLogin.tsx         ← pantalla de login con marca + aviso +18
│   ├── compliance/
│   │   └── AgeVerifiedSaleBadge.tsx       ← badge que aparece en POS tras verificar edad
│   └── receipt/
│       └── PasionesReceiptHeader.tsx      ← header del ticket POS (térmico/impreso/PDF)
└── docs/
    └── pos-age-verification-flow.md       ← cómo el vendedor verifica edad en cada venta
```

## Compliance — POS

**Ley 679/2001 art. 4**: el vendedor debe verificar la mayoría de edad del comprador **al momento de la venta**. La verificación debe ser:

1. **Identidad verificada**: pedir documento de identidad (cédula colombiana / pasaporte para extranjeros)
2. **Mayoría de edad confirmada**: el documento debe mostrar fecha de nacimiento que confirme 18+ años
3. **Registro de la verificación**: el sistema debe registrar que la verificación fue hecha (no se almacena el documento, solo el check)

El flujo en el POS:

```
1. Vendedor escanea productos → CartScreen
2. Click "Cobrar" → CheckoutScreen
3. Sistema PREGUNTA: "¿Verificó documento de identidad del cliente?"
   - Si SÍ → habilita botón "Confirmar venta"
   - Si NO → bloquea, exige verificación
4. Vendedor confirma verificación → registra audit action "sale.age_verified"
5. Venta se procesa → badge "Venta verificada +18" aparece en recibo
```

Este componente `AgeVerifiedSaleBadge` muestra el badge después de confirmar. En el audit log del backend, la entrada `sale.create` incluye metadata `ageVerified: true + vendedorId`.

Ver `docs/pos-age-verification-flow.md` para el detalle completo.

## Instalación

```bash
# 1. Clona el template
git clone --recursive https://github.com/Opita-Code/opita-market-storefront-templates
cd opita-market-storefront-templates/frontend-visual/admin-tailadmin/source

# 2. Instala
npm install

# 3. Copia tokens
cp ../theme-overrides/pasiones-boutique-sensual/globals.css src/app/globals.css

# 4. Copia componentes
cp -r ../theme-overrides/pasiones-boutique-sensual/components/* src/components/

# 5. Personaliza la pantalla de login
#    Ver src/app/login/page.tsx → importar PasionesAdminLogin y usarlo
#    en lugar del layout default.
```

## Lo que NO hace este override

- **No reemplaza el dashboard completo** — TailAdmin default sigue intacto
- **No cambia tablas / formularios** — la información operativa gana
- **No agrega funcionalidad POS** — el flujo de venta es responsabilidad del backend (Sprint 7+)
- **No cambia el audit log** — la auditoría es información técnica

El override es **superficial por diseño**: branding en login, identidad en papel (recibo), un badge en el POS para que el vendedor recuerde verificar edad. Todo lo demás es TailAdmin genérico.

## Próximos pasos Sprint 7+

1. Integrar el flujo de verificación de edad en el POS (handler backend)
2. Audit action `sale.age_verified` en el log
3. Generación automática de PDF de recibo con `PasionesReceiptHeader`
4. POS tablet-optimized (touch-first, no mouse)