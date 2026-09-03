# CLAUDE.md

Guía para Claude Code al trabajar en este repo. Última actualización: 2026-09-02.

## Qué es esto

Mockups interactivos del **eCommerce de Grupo Venado** — la capa de presentación B2B que consume
(cuando exista) el microservicio de Sales de DEAL. Vite + React 19 + TypeScript + Tailwind CSS v4 +
componentes de [`shadcn-ui-kit`](https://github.com/oliviosubelza/shadcn-ui-kit) (Radix, copiados a
mano). Pensado para abrirse **principalmente como webview embebido en WhatsApp** (ya probado que
funciona), pero también debe andar en navegador externo y desktop — por eso es responsive a pantalla
completa, sin marco de teléfono.

Reemplaza a `../evenado-catalogo` (Tailwind plano, sin shadcn) como base de las pantallas nuevas. Ese
proyecto anterior es **maqueta visual pura** — no reutilizar su código de sesión/auth ni de pago.

Este repo vive dentro de un workspace más grande (`eVenado/`, ver `../../CLAUDE.md` en la raíz) que
también incluye el bot de WhatsApp (Django) y "Venado Connect" (atención al cliente). Esos son otros
proyectos — este repo es solo el eCommerce.

## Guía de diseño

**Leé `DESIGN.md` antes de construir o retocar cualquier pantalla.** Define el nivel visual que el
usuario aprobó (Home v2 y Detalle de producto), los tokens/patrones a reutilizar, el tono del copy,
la regla "no suponer, preguntar" y el checklist de entrega. Es la referencia para cualquier modelo.

## Comandos

```bash
npm run dev      # localhost:5173 (o el siguiente puerto libre)
npm run build    # tsc -b && vite build
npm run lint      # oxlint
```

**Gotcha de Vite**: si después de tocar `main.tsx`/`vite.config.ts` o agregar dependencias nuevas
aparece `useRoutes() may be used only in the context of a <Router>` (u otro error de contexto React
que no tiene sentido mirando el código), es caché de pre-bundling de Vite desincronizada — no un bug
real. Fix: `rm -rf node_modules/.vite` y reiniciar el dev server (recargar la página no alcanza).
Si se borra `node_modules/.vite` **con el dev server corriendo**, el browser empieza a tirar
`504 (Outdated Optimize Dep)` — hay que reiniciar el server, no alcanza con recargar.

El Browser pane de Claude Code arranca el server con `.claude/launch.json` **de la raíz del
workspace** (`eVenado/.claude/launch.json`, `npm run dev --prefix eCommerce/evenado-ecommerce`).

## Stack

- **Vite 8 + React 19 + TypeScript**, alias `@/` → `src/` (`vite.config.ts` vía `resolve.alias` +
  `compilerOptions.paths` en ambos `tsconfig*.json` — **sin** `baseUrl`, TS 6 lo deprecó).
- **Tailwind CSS v4** vía `@tailwindcss/vite`. Sin `tailwind.config.js` — todo el theming vive en
  `src/theme.css` con `@theme`.
- **react-router v8** (el paquete `react-router` ya incluye todo lo de DOM — `HashRouter`, `Link`,
  etc. — no hace falta `react-router-dom` aparte). Se usa **HashRouter** (`src/main.tsx`): todo vive
  en un solo documento estático, sin servidor de rutas, compatible con el botón CTA-URL de WhatsApp.
- **lucide-react** para iconos.

## shadcn-ui-kit — cómo se integra

**Es un catálogo copy-paste, no una dependencia instalable.** Cada componente que se necesita se copia
a mano desde el repo del kit (`github.com/oliviosubelza/shadcn-ui-kit`) a `src/components/ui/<nombre>.tsx`
— ver `SKILL.md` del kit, sección "How to pull a component in". Al copiar un archivo nuevo:

1. Copiarlo tal cual a `src/components/ui/<nombre>.tsx` (mismo nombre, usa `@/` así que no hay que
   reescribir imports).
2. Revisar sus imports e instalar lo que falte (`radix-ui`, `@base-ui/react`, `cmdk`,
   `embla-carousel-react`, etc. — ya están instalados `class-variance-authority`, `clsx`,
   `tailwind-merge`, `radix-ui`, `@base-ui/react`, `lucide-react`).
3. `src/lib/utils.ts` (`cn()`) ya existe, no falta copiarlo de nuevo.

**Ya copiados**: `button`, `card`, `badge`, `separator`, `input`, `textarea`, `input-group`,
`aspect-ratio`, `skeleton`, `sheet` (base-ui Dialog; `drawer` del kit necesitaría `vaul`, no instalado). El resto del catálogo (Dialog, Sheet, Tabs, Select, Carousel, Calendar,
DataTable/FilterBar — este último es para tablas admin, probablemente no aplica a un eCommerce
customer-facing — etc.) se trae bajo demanda, pantalla por pantalla.

**Reglas de composición del kit** (las sigue todo lo ya copiado, seguirlas en lo nuevo): `className`
solo para layout nunca color: `gap-*` en vez de `space-x/y-*`; `size-*` cuando ancho=alto; tokens
semánticos (`bg-primary`, `text-muted-foreground`) nunca colores crudos; `cn()` para clases
condicionales.

## Theming — `src/theme.css`

Tokens semánticos estándar de shadcn (HSL en triplete) con la paleta de marca Grupo Venado / KRIS.
Dos desvíos de marca documentados como comentario en el propio archivo:

1. `--accent` lleva el rojo de CTA (`#E33231`) en vez del tinte neutro de hover que trae el kit por
   defecto (la marca reusa ese rojo como CTA y como `--destructive`). Para hover sutil de menú/lista
   usar `bg-muted`, no `bg-accent`.
2. Tokens extra fuera del set del kit: `--color-success`, `--color-warning`, `--color-category-*`.

Tipografía: Inter (cuerpo) + Poppins 600/700 (`h1/h2/h3` y la utility `cn-font-heading` que usa el
kit). Logos de marca reales en `public/marcas/` (solo KRIS, Kriolla, Real, Frussion, El Pescador —
el resto de las marcas no tiene asset, ver `src/data/brandLogos.ts`).

## Datos — `src/data/`

**`categories.ts` + `products.ts`**: taxonomía y catálogo **reales**, extraídos el 2026-09-02 de 4
PDFs de catálogo Grupo Venado (Cuidado del Hogar, Bebidas, Panificación, Salsas-Culinarios-Postres) —
375 productos, 9 categorías, 43 subcategorías, 14 marcas. Cruzados contra las 30 categorías que tenía
el sistema (DB) — 12 de esas 30 se descartaron por no tener evidencia en estos 4 catálogos (Canastones,
Carnes Plant Based, Congelados, Leche, Yogurt, Infusiones, Jarabes, Snacks y Panes, Cuidado Infantil,
Cuidado Textil, Coberturas y Rellenos, Limpieza Bucal) — **no están muertas para siempre**, si llegan
catálogos nuevos hay que retomar y expandir. El split "Hogar/Negocio" que tenía la DB no existe como
categoría en el catálogo real — es la misma sección con presentación distinta (chico vs. bulto), se
modela como dato de `size`/`packaging` del producto, no como categoría.

**Ningún campo de precio, stock, ni foto está en `products.ts` — a propósito.** Esos tres campos no
existen en el catálogo fuente. En el sistema real (`sale.products`, ver abajo), precio y stock
tampoco son campo fijo del producto: Sales los resuelve en vivo por cliente vía `getPriceRules` cada
vez que se abre el carrito. No agregar esos campos a `Product` con datos inventados.

**`src/data/mockPricing.ts`**: precio y descuento **simulados**, determinísticos (mismo producto →
mismo precio en cada render, seed = id del producto) por banda de Bs según categoría — solo para que
las pantallas de demo tengan algo que mostrar. Documentado como simulado en el propio archivo, separado
a propósito de `products.ts`. Si algún día hay integración real, esto se reemplaza por la respuesta de
pricing, no se mezcla con el catálogo.

**Campos reales que existen en `sale.products`/`sale.owners`/`sale.delivery_points` (schema real de
Sales, no en este repo) y que TODAVÍA no están modelados acá, a propósito — se agregan recién cuando
una pantalla los necesite**: `barcode`, `isCooled` (húmedo/refrigerado), `isPack` + productos que
incluye, `isPareto` (flag real de alta rotación — base legítima para un badge "más vendido", no es
un campo inventado). `sale.customer_details.limit_buy_amount` es real (el "límite de compra" que
mostraba el mockup viejo no era un campo inventado, solo no está en el endpoint documentado de owner).
`sale.delivery_points` no tiene campo `name` — no inventarlo si se arma selección de punto de entrega.

## Mapa de pantallas y alcance V1

Mapa completo (15 pantallas): WhatsApp (entrada) · Login · Home · Catálogo · Categorías · Buscador ·
Detalle de producto · Carrito · Entrega+fecha · Reserva+Pago QR · Pedido confirmado · Estado del
pedido · Historial · Perfil · Deudas.

**V1 (lo que se está construyendo, en este orden)**: **Home → Catálogo → Detalle de producto →
Carrito → Entrega+fecha → Pago QR → Estado del pedido** — arranca directo en Home, **sin** pantallas
de WhatsApp/Login por ahora (se agregan/ajustan después). El resto del mapa completo queda pospuesto,
no descartado.

Criterio de diseño pedido explícitamente por el usuario: pensar como eCommerce reales que venden
(no solo "mockup funcional") — iconografía cuidada, layout profesional/innovador, usando el catálogo
real de productos ya cargado.

### Shell de navegación

Dos layouts en `src/components/chrome/`:
- **`Layout`** (`TopBar` + `BottomNav` de 5 ítems: Inicio/Catálogo/Carrito/Puntos/Perfil) — para
  Home, Catálogo, Carrito, Venado Money (4 pantallas), Historial y Perfil.
- **`FocusLayout`** (header minimal, solo botón volver, sin bottom nav) — para Detalle de producto,
  Checkout, Pago, Estado del pedido. No distrae durante el flujo de compra/pago.

### Estado de construcción (2026-09-02)

- ✅ Setup completo (theming, primitivos base, shell, routing wireado en `App.tsx`).
- ✅ **Home** (refresh visual 2026-09-02, criterio "eCommerce que vende al verlo"): hero carrusel de
  3 promos con packshot real (`src/components/home/HeroCarousel.tsx`, scroll-snap + autoplay, tonos
  primary/accent/warning), strip de propuesta de valor (entrega / pago QR / precio mayorista), bento
  de categorías (2 tiles grandes con foto + rail de chips con conteo real,
  `CategoryShowcase.tsx`), rail "Los más pedidos" (`ProductCard` con foto), marcas tipo "stories"
  (`BrandRail.tsx`: círculos grandes con logo real o monograma tintado, sin isotipos inventados),
  banner de ofertas y grilla "Ofertas de la semana" repartida por categoría. Sin bloque de WhatsApp al
  pie (el usuario lo pidió fuera por ahora). `ProductCard` rediseñada: foto real si
  existe, si no logo de marca + ícono de categoría sobre tinte; precio en Poppins, presentación
  resumida (`packagingShort` en `src/lib/format.ts`: "Caja con 12 Unidades" → "Caja x12"), botón
  "+" rojo (CTA de conversión) que se convierte en stepper (ver abajo).
- **Fotos de producto — convención por SKU, sin mapeo manual**: `public/productos/<sku>.<png|jpg|webp>`
  (ej. `300986.png`; para productos con `sku: null` se acepta `<id>.<ext>`). El usuario cargó ~457
  packshots nombrados por código el 2026-09-02 (65 MB — por eso viven en `public/`, servidas tal cual,
  no pasan por el bundle). Como Vite no puede globear `public/`, `scripts/product-images-manifest.mjs`
  genera `src/data/productImageManifest.json` (basename → archivo) automáticamente en `predev` /
  `prebuild`; si agregás fotos con el server corriendo: `npm run images` + recargar.
  `src/data/productImages.ts` resuelve `productImage(product)` por sku y después por id. 233 de los
  356 SKUs del catálogo tienen foto; el código `000000` (6 productos sin SKU) se ignora por ambiguo.
  ~224 archivos no matchean ningún SKU del catálogo actual (probablemente productos de catálogos que
  todavía no se cargaron) — no son error. Sin foto → placeholder de marca/categoría, no inventar.
- **Logos de marca** (`public/marcas/*.svg`, isotipos circulares provistos por el usuario el
  2026-09-02, mapeados en `src/data/brandLogos.ts`): 10 de las 14 marcas del catálogo tienen logo;
  sin logo: De la Granja, KRIS Energy, Raptor, Revive (se muestran como monograma). Hay logos de
  marcas que todavía no están en el catálogo (Azucaraditas, Choco Explosion, Fleischmann, Frutaritos,
  Kriskao) — se mapean cuando lleguen sus catálogos. `grupo-venado-blanco.svg` es el logo del grupo en
  blanco para fondos de marca (TopBar).
- **`ProductCard` con stepper**: sin cantidad muestra el "+" rojo; con cantidad > 0 muestra un pill
  azul `[− | N unidades | +]` (el "−" pasa a tacho en 1) + badge de cantidad sobre la foto y ring
  azul en la card. Mismo patrón que la versión anterior de `evenado-catalogo`, pedido explícito.
- ✅ `CartProvider` (`src/state/cart.tsx`) — estado simple `{productId, quantity}[]`, precio nunca se
  persiste ahí, se recalcula con `mockPrice`. Verificado funcionando (badge en `TopBar` y `BottomNav`).
- ✅ **Detalle de producto** (`src/screens/ProductDetail.tsx`, 2026-09-02). Decisiones del usuario
  (preguntadas explícitamente, no supuestas): (1) **unidad de venta en 2 niveles** — mínima = unidad
  suelta, máxima = bulto cerrado según `packaging` del catálogo (`parsePackaging` en `src/lib/format.ts`
  multiplica todos los niveles: "Caja con 8 Displays de 25 Unidades" → caja de 200; los displays NO se
  venden aparte); (2) **precio del bulto = unidad × unidades, sin descuento** (mock, no inventar);
  (3) **solo datos reales del catálogo** en la ficha (presentación, tamaño, vida útil, código, marca,
  subcategoría) — sin descripción ni stock simulados; (4) al agregar **se queda en el detalle**: el CTA
  muestra "Agregado" 1.6 s y aparece una franja verde "En tu carrito: 2 cajas (24 unidades) · Ver
  carrito". Extras basados en datos reales: "Otras presentaciones" (mismo `name`, otro `size`) y "Te
  puede interesar" (misma subcategoría, luego misma categoría, con foto primero). Layout 2 columnas en
  `sm+`. La vista se remonta con `key={productId}` para resetear unidad/cantidad al cambiar de producto.
- **Carrito con unidad de venta** (`src/state/cart.tsx`): líneas `{productId, unit: "unidad"|"caja",
  quantity}`; `unitsPer()` / `unitPrice()` exportados. `ProductCard` opera siempre en "unidad"; el
  bulto solo se elige en el detalle. `FocusLayout` ahora muestra el ícono de carrito con badge.
- ✅ **Catálogo** (`src/screens/Catalog.tsx`, 2026-09-02). Decisiones del usuario (preguntadas):
  chips de categoría (con ícono) + chips de subcategoría + botón "Filtros" que abre una **hoja**
  (`src/components/ui/sheet.tsx`, copiado del kit; `side="bottom"` en mobile, `"right"` de 400 px en
  `sm+` vía `useMediaQuery`) con orden (relevancia = con foto primero / precio ↑↓ / nombre A-Z),
  toggle "solo ofertas" y marca (single-select, con logo; solo las marcas de la categoría activa);
  **buscador en vivo** dentro del catálogo (nombre + marca + SKU + tamaño, sin acentos vía
  `src/lib/search.ts`; la TopBar manda a `/catalogo?buscar=1` para enfocarlo); **paginado de a 24**
  con "Ver más productos" y contador. Todo el estado vive en la URL (`categoria`, `sub`, `marca`,
  `ofertas=1`, `q`, `orden`) con `useSearchParams` + `replace`, así los links de Home/Detalle entran
  directo y el back funciona. Banner tintado de categoría con foto real flotante; estado vacío con
  "Limpiar todo". **Banner de marca** (`BrandBanner` en el mismo archivo) cuando hay `?marca=`: foto
  "familia de productos" de `public/family-products/<slug>.webp` (600×600 fondo blanco, mapeadas en
  `src/data/brandFamily.ts`, 9 de 14 marcas) a la derecha, difuminada hacia el texto (degradé
  horizontal `from-card`) y hacia la página (degradé vertical `from-background`) para que la grilla
  parezca salir del banner; es la pantalla a la que llegan los logos del Home. Sin foto de familia
  cae a un banner tintado con logo/monograma.
- ✅ **Flujo completo Carrito → Entrega → Pago QR → Estado** (2026-09-02). Decisiones del usuario
  (preguntadas): (1) **motor de reglas de precio SIMULADO** en `src/data/priceRules.ts` — reglas
  opacas con id interno que NUNCA se muestra (ni "Mayorista A" ni nombres de regla: las reglas son
  de Sales, a eVenado solo le llegan sus efectos; una regla puede ser descuento, bonificación o
  ambos). Tres reglas demo: 10 % general, escala 12+1 en mayonesa/ketchup doypack (bonifica el
  mismo producto, línea aparte gratis como `is_bonus`), combo Bristar (≥12 lavavajillas → 5 % extra
  + vajillero gratis). `quoteCart(lines)` devuelve líneas con gross/discount/net, bonificaciones y
  **hints** "te faltan N unidades" (con botón que agrega las que faltan). (2) **Pantalla propia
  Entrega + fecha**: puntos de entrega mock de `src/data/customer.ts` etiquetados por dirección +
  contacto + horario de recepción (sin nombre de sucursal, como `sale.delivery_points`), fechas =
  próximos martes/jueves (`DELIVERY_WEEKDAYS`). (3) **Una sola pantalla de pago**: "Stock reservado",
  QR mock determinístico (`QRCodeMock`, no codifica nada — en real llega `qrBase64` de Collections),
  countdown 10 min, fases Esperando → Pago recibido → Confirmado **simuladas solas a los 6 s** + botón
  discreto "Simular pago"; al confirmar crea el pedido (`src/state/order.tsx`, snapshot de la
  cotización, `orderId` entero desde 48213), vacía el carrito y navega a `/pedido/:orderId`.
  (4) **Estado del pedido con los 8 pasos del canal prepago del kickoff** (Pedido realizado → Pago QR
  validado → Confirmado → Planificado → Picking → Despachado → En ruta → Entregado), hero verde,
  entrega, ítems con bonificación, totales, "Volver a WhatsApp" (usa `VITE_BOT_WHATSAPP_NUMBER` si
  existe) y "Repetir pedido" (vuelve a cargar las líneas al carrito).
- **Estado**: `CartProvider` (líneas + `quote` memoizada + `setUnit` para pasar una línea de unidad a
  caja), `CheckoutProvider` (punto + fecha) y `OrderProvider` (pedidos en memoria de la sesión), los
  tres en `main.tsx`. `ScrollToTop` en `App.tsx` sube al cambiar de pathname.
- ✅ **Historial (`/pedidos`) y Perfil (`/perfil`)** (2026-09-02): ambos en `Layout`; el `BottomNav`
  pasó a 5 ítems (Inicio · Catálogo · Carrito · Pedidos · Perfil). `OrderProvider` arranca con **3
  pedidos de demo** (`seedOrders` en `src/state/order.tsx`: uno "En ruta" y dos "Entregados", armados
  con productos reales + el motor de reglas, fechas relativas a hoy) para que Historial tenga
  contenido — en real vendrían de O8 `GET /orders?customerId`. Cada pedido guarda `history` (fecha
  por paso alcanzado) y `OrderStatus` adapta el hero según estado (confirmado / en camino /
  entregado). Historial: "En curso" vs "Entregados", miniaturas apiladas, "Repetir" y "Ver".
  Perfil: cabecera azul con iniciales, **límite de compra** (campo real
  `sale.customer_details.limit_buy_amount`, en `customer.limitBuyAmount`), titular, WhatsApp
  vinculado (de la sesión), puntos de entrega con predeterminado (escribe en `CheckoutProvider`),
  asesor comercial, toggle de avisos y "Cerrar y volver a WhatsApp". **No se muestra la lista de
  precios** (decisión del usuario).
- **Integración de demo con el bot (heredada de la v1, `src/lib/botApi.ts` + `src/state/session.tsx`)**:
  el bot abre la web con `#/...?phone=591XXXXXXXX`; el teléfono se guarda en localStorage
  (`evenado.session.phone`). Al confirmarse el pago, la web hace `POST
  {VITE_BOT_API_BASE_URL}/api/v1/demo/catalogo/pedido-confirmado/` con `X-API-Key` para que el bot
  mande el WhatsApp de "pedido confirmado" (endpoint que sigue existiendo en gv-agent-core,
  `core/api/urls.py`). "Volver a WhatsApp" usa `https://wa.me/{VITE_BOT_WHATSAPP_NUMBER}`. Las tres
  variables son opcionales (ver `.env.example`); sin ellas todo funciona local y el botón vuelve al
  Home. En la arquitectura real este aviso lo emite eVenado al consumir eventos de Sales/Invoice, no
  el frontend.
- ✅ **Venado Money — programa de puntos (v2 de los mockups, 2026-09-02)**. Referencia de producto:
  FarmaCLUB de Farmacorp (saldo, progreso al siguiente nivel, extracto, categorías canjeables,
  catálogo con costo en puntos). Decisiones del usuario (preguntadas): (1) **menú propio**: ítem
  "Puntos" en el bottom nav (Inicio · Catálogo · Carrito · Puntos · Perfil; "Mis pedidos" pasó a
  Perfil → Accesos) + card dorada en el Home (`components/home/PointsCard.tsx`); (2) **se gana 1 punto
  por cada Bs 10 del neto, acreditado al confirmar** el pedido (prepago); (3) **3 niveles con
  beneficio**: Bronce 0–1.000 (×1), Plata 1.001–5.000 (×1.2), Oro 5.001+ (×1.5), sobre puntos
  acumulados históricos, no saldo; (4) **canje dentro del mismo carrito** (pedido mixto Bs + puntos):
  el catálogo de canje es un subconjunto (`redeemables` en `src/data/venadoMoney.ts`: primeros 4
  productos con foto de 6 categorías; costo = precio mock redondeado a 5, 1 pt = Bs 1 de valor), el
  carrito tiene la sección "Canjes con puntos" con su stepper ámbar, el QR cobra solo la parte en Bs,
  si el pedido es 100 % puntos la pantalla de pago se convierte en "Confirmá tu canje" (sin QR), y los
  puntos se debitan/acreditan al confirmar. Si el saldo no alcanza, el carrito avisa cuántos faltan y
  bloquea "Continuar". El Estado del pedido muestra "Este pedido te dio +N pts" y los canjes usados.
  Pantallas en `src/screens/money/`: `PointsHome` (`/puntos`: hero con saldo, anillo de progreso,
  nivel, accesos, rail de canjeables ordenado por "te alcanza", últimos movimientos, cómo funciona),
  `RedeemCatalog` (`/puntos/canjear`, chips de categoría, CTA "Ver carrito" cuando hay canjes),
  `PointsHistory` (`/puntos/extracto`, Todos/Abonos/Débitos), `Tiers` (`/puntos/niveles`). Estado en
  `src/state/points.tsx` (movimientos sembrados coherentes con los pedidos demo: acumulado ≈ 760,
  saldo ≈ 520). Token de color propio `--color-money` (ámbar) + `--color-money-foreground` en
  `theme.css` — distinto del amarillo de promo. `ProductCard` muestra pill "N pts" en los canjeables y
  `ProductDetail` un bloque "Canjealo por N pts". Todas las constantes (tasa, valor de canje, niveles,
  categorías) están al tope de `venadoMoney.ts` para ajustarlas.
- **Venado Money, ajustes posteriores (2026-09-02)**: (a) **vencimiento de puntos**: `EXPIRY_MONTHS = 12`
  (constante, no confirmada con negocio); los abonos son lotes y los canjes los consumen FIFO
  (`buildLots` en `state/points.tsx`), así el extracto muestra por abono "Vencen el …" o "Quedan N ·
  vencen el …" o "Ya canjeados", y arriba "Próximo vencimiento: N pts el …" (en rojo si vence en
  60 días, con link a canjear); el Home de puntos repite la línea. (b) **Promos de puntos por
  producto/marca** (`EARN_RULES` en `venadoMoney.ts`, ej. Raptor ×2): los puntos se calculan POR
  LÍNEA (`pointsForQuote`), multiplicando nivel × promo; badge "×2 puntos" en ProductCard, Detalle y
  línea del carrito, y sección "Promos de puntos" en `/puntos`. (c) **Navegación "atrás"**
  (`lib/useSmartBack.ts`): `FocusLayout` muestra "‹ Carrito / Entrega / Catálogo / Mis pedidos" con
  destino explícito por ruta (checkout siempre al paso anterior, pedido a Mis pedidos, producto por
  historial con fallback a catálogo); `TopBar` muestra "‹" al padre en sub-pantallas (`/puntos/*` →
  Puntos, `/pedidos` → Perfil); `ScrollToTop` ya no scrollea en POP, así el navegador restaura la
  posición al volver del detalle al catálogo.
- **Home v3 (2026-09-03, pedido del usuario)**: se quitó TODO lo de "Ofertas de la semana" (slide del
  hero, banner rojo y grilla de descuentos). En su lugar: slide de Venado Money en el hero (Raptor,
  ×2) y la sección **"Productos recomendados"** debajo de la card de puntos y antes de Categorías —
  grilla 2/3 columnas con `RECOMMENDED_IDS` (jugos/bebidas de fruta con foto: De la Granja naranja,
  pomelo, durazno, manzana; Frussion naranja, mango). En el bento de categorías el tile de Salsas
  ahora usa la foto del ketchup con tinte rojo (`tint` opcional en `CategoryShowcase`) para no
  repetir el verde del tile de Bebidas. Los descuentos siguen existiendo como efecto de reglas de
  precio (cards, carrito, filtro "solo ofertas" del catálogo) — solo salieron del Home.
- ⏳ Pendiente del mapa completo: Deudas, WhatsApp entry (chat simulado), Login (pospuestos).

## Notas de entorno / herramientas (no del código)

En el Browser pane usado durante esta sesión de Claude Code, el tool de clicks/screenshot (`computer`)
a veces se cuelga ("pane is currently hidden") aunque la app funciona bien — no es un bug de la app.
Workaround que funcionó: verificar con `get_page_text` / `read_console_messages`, y disparar clicks
reales via `javascript_tool` (`element.click()`) en vez de depender de `computer`.
