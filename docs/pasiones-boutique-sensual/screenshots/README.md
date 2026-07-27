# Visual demos — Pasiones Boutique Sensual

16 screenshots capturados via Playwright headless para documentar la identidad
visual del tenant Pasiones en sus flujos principales.

## Convenciones

- **Light** = modo claro (default)
- **Dark** = modo oscuro (vino profundo + hot pink luminoso)
- **Mobile** = viewport 390×844 (iPhone 14 Pro)
- **Full** = captura con scroll completo (toda la página)
- **Hero** = captura del primer viewport (above-the-fold)
- **Footer** = captura con scroll al final

## Tabla de screenshots

| # | Archivo | Vista | Notas |
|---|---|---|---|
| 01 | `01-light-with-agegate.png` | Home (light) | Primera visita · modal `AgeGate` visible |
| 02 | `02-light-home-hero.png` | Home (light) | Hero + nav (post-verificación) |
| 03 | `03-light-home-full.png` | Home (light) | Página completa con todos los productos |
| 04 | `04-light-footer.png` | Home (light) | Footer + LegalDisclaimer + Línea Curvy banner |
| 05 | `05-dark-home-hero.png` | Home (dark) | Modo oscuro · vino profundo |
| 06 | `06-dark-home-full.png` | Home (dark) | Página completa modo oscuro |
| 07 | `07-mobile-light.png` | Home (mobile) | iPhone 390×844 |
| 08 | `08-mobile-full.png` | Home (mobile) | Página completa mobile |
| 09 | `09-cart-light-full.png` | Carrito (light) | 3 productos · 4 unidades · summary sticky |
| 10 | `10-cart-dark-full.png` | Carrito (dark) | Modo oscuro del carrito |
| 11 | `11-cart-empty-light.png` | Carrito vacío | Empty state con quick categories |
| 12 | `12-cart-mobile-full.png` | Carrito (mobile) | Layout apilado |
| 13 | `13-checkout-light-full.png` | Checkout (light) | 4-step: Identificación → Envío → Edad → Pago |
| 14 | `14-checkout-mobile-full.png` | Checkout (mobile) | Layout apilado |
| 15 | `15-product-light-full.png` | Producto (light) | Vibrador Conejo Luxe · galería + variants + reviews |
| 16 | `16-product-mobile-full.png` | Producto (mobile) | Layout apilado |

## Compliance visible en los screenshots

Todos los screenshots reflejan los datos **OSINT-corregidos** (commit `26f392d`):

- ✅ Teléfono cliente: `+57 315 444 5992` (proporcionado por el cliente)
- ✅ Línea ICBF: `01 8000 91 80 80` (L-V 8am-5pm) + `Línea 141` (24/7)
- ✅ Citación legal: `Constitución Política art. 44 + Ley 679 de 2001 art. 2°`
- ✅ Versión consentimiento: `v2026-07-27.3`

> ⚠️ La línea "018000-91-99-99" y la cita "Ley 1336/2009 art. 4" fueron removidas
> por imprecisión (verificado vía DuckDuckGo + icbf.gov.co + funcionpublica.gov.co
> el 2026-07-27).

## Reproducir las capturas

Los HTML fuente están en `C:\Users\Nico\AppData\Local\Temp\opencode\pasiones-demo\`
(demos standalone para presentación al cliente, no forman parte del repo de
producción).

```bash
# Setup
mkdir -p /tmp/opencode/pasiones-demo
# (copiar los 5 HTML: index.html, cart.html, cart-empty.html, checkout.html,
#  product.html + take-screenshots.cjs)

# Install Playwright (ya hecho)
npm install -g playwright

# Run
node /tmp/opencode/pasiones-demo/take-screenshots.cjs
```

Las imágenes se regeneran en `screenshots/*.png`. Playwright cierra el browser
automáticamente al terminar (zero orphan processes verificado).