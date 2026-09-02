# DESIGN.md — Guía de diseño del eCommerce Grupo Venado

Para cualquier modelo/persona que construya pantallas nuevas en este repo. El objetivo es que el
resultado se vea al nivel de **Home**, **Detalle de producto**, **Catálogo** y el **flujo de
checkout** (`src/screens/*.tsx`), que el usuario aprobó explícitamente. Leé esto completo antes
de tocar una pantalla. Complementa (no reemplaza) `CLAUDE.md`, que tiene stack, datos y reglas del kit.

## 0. Criterio de aceptación

> "¿Vende con solo verlo?" — no "¿funciona?".

El usuario rechazó una primera versión del Home por ser *"cuadraditos, muy sencillo, no innovador"*.
Lo que sí aprobó: fotos reales grandes, jerarquía fuerte, formas redondeadas, color de marca con
intención, micro-interacciones. Pensá en Rappi / Mercado Libre / Tiendanube móviles, no en un
admin ni en un wireframe.

## 1. Reglas de trabajo (no negociables)

1. **No suponer. Preguntar.** Si un dato no existe en el catálogo (precio real, stock, descripción,
   fotos secundarias) o una decisión es de producto (unidad de venta, qué pasa al agregar, filtros),
   preguntar con `AskUserQuestion` ofreciendo 2-4 opciones con la **recomendada primera**. El usuario
   lo pidió textual: *"si tienes dudas de algo preguntame, no suponemos nada"*.
2. **Datos reales o nada.** Solo se muestra lo que está en `src/data/products.ts` /
   `categories.ts` (nombre, marca, tamaño, SKU, vida útil, presentación) + fotos reales. Precio y
   descuento vienen de `mockPricing.ts` y están marcados como SIMULADOS. No inventar descripciones,
   stock, reseñas, ratings, "más vendido" (existe un flag real `isPareto` en Sales para eso, cuando
   haya integración), ni isotipos para marcas sin logo.
3. **Foto real siempre que exista.** Priorizá productos con foto en rails, destacados, relacionados
   (`hasProductImage`). La foto es lo que más vende.
4. **Verificar en el browser antes de decir "listo"**: mobile (375) y desktop (1280), `npm run
   build` y `oxlint` limpios. Sacar screenshot, mirar de verdad, corregir lo que se ve mal.
5. **Documentar decisiones** en `CLAUDE.md` (estado de construcción) y, si son de proceso, en la
   memoria del usuario.

## 2. Sistema visual

### Tokens (`src/theme.css`) — nunca colores crudos
| Rol | Token | Uso |
|---|---|---|
| Marca / navegación / selección | `primary` (azul #0B54C9) | logo, links, chips activos, stepper en card, ring de selección |
| **Conversión** | `accent` (rojo #E33231) | botón "+" de agregar, CTA "Agregar", badges de descuento, banner de ofertas |
| Éxito | `success` (verde) | estado "Agregado", franja "En tu carrito" |
| Promo cálida | `warning` (amarillo) | slide de hero con texto oscuro |
| Fondo de página | `background` (gris muy claro) | el lienzo |
| Superficies | `card` (blanco) | cards, chips, barras |
| **Venado Money** (puntos) | `money` (ámbar #F59E0B) + `money-foreground` (marrón oscuro) | todo lo que sea puntos: pills "N pts", botón "Canjear", stepper de canje, hero de saldo. Nunca usar `warning` para puntos ni `money` para promos |
| Tintes por categoría | `tintForCategory(id)` (`src/lib/categoryTint.ts`) | fondos suaves determinísticos + ícono del mismo color |

Regla de color: **rojo = acción de compra**, **azul = marca y estado seleccionado**, **verde =
confirmación**, **ámbar = puntos Venado Money**. No mezclar (un CTA azul y otro rojo en la misma barra confunde).

### Forma
- Radios grandes: `rounded-2xl` en cards y chips, `rounded-3xl` en heros/tiles/galerías,
  `rounded-full` en botones, pills, stepper, avatares de marca.
- Bordes casi invisibles: `ring-1 ring-foreground/5` + `shadow-sm`. Nunca `border-gray-*` duro.
- Elevación en hover: `hover:-translate-y-0.5 hover:shadow-lg` (transition-all duration-200).
- Botones con sombra de su propio color: `shadow-lg shadow-accent/30`, `shadow-md shadow-primary/20`.
- Formas decorativas en bloques de color: círculos `absolute rounded-full bg-primary-foreground/10`
  fuera del borde (`-top-16 -right-8 size-56`) con `pointer-events-none`.

### Tipografía
- Títulos (`h1/h2/h3`) ya salen en **Poppins 700** por el base layer. Para precios y números
  importantes usar la utility `cn-font-heading`.
- Jerarquía típica de una sección: `h2 text-base` + subtítulo `text-xs text-muted-foreground`.
- Etiquetas pequeñas en mayúsculas con tracking: `text-[10px] font-bold tracking-wider uppercase`
  (marca en azul, eyebrows en bloques de color).
- Números tabulares en stepper/precios: `tabular-nums`.

### Fotos de producto
- Siempre `object-contain` sobre fondo blanco/`bg-card` o degradé `from-muted to-card`, con
  `drop-shadow-md` (cards) / `drop-shadow-2xl` (hero, galería).
- En heros y tiles la foto **flota** fuera del bloque: `absolute -right-3 bottom-[-6%] h-[112%]
  -rotate-6`. Es lo que da vida al layout.
- Placeholder sin foto: círculo blanco con el logo de marca y el ícono de categoría chico debajo,
  sobre `tintForCategory`. Nunca un gris vacío.

### Iconografía
- `lucide-react`, `strokeWidth` 2 en UI, 1.5-1.75 en placeholders grandes. Un ícono por categoría
  en `src/data/categoryIcons.ts`.
- Ícono siempre dentro de un contenedor: círculo/`rounded-xl` tintado (`bg-primary/10 text-primary`
  o `tintForCategory`), tamaño `size-8` con ícono `size-4`.

## 3. Patrones de layout (copiar de los archivos citados)

| Patrón | Dónde verlo | Cuándo usarlo |
|---|---|---|
| **Rail horizontal** con scroll-snap, sin barra (`no-scrollbar -mx-4 px-4 flex gap-3 overflow-x-auto snap-x`) | Home: productos, marcas, chips | Cualquier lista de 5+ ítems del mismo tipo en mobile |
| **Bento** (2 tiles grandes con foto + chips) | `components/home/CategoryShowcase.tsx` | Categorías / colecciones. Rompe la cuadrícula uniforme |
| **Hero carrusel** con tono `primary` / `accent` / `warning` | `components/home/HeroCarousel.tsx` | Promos. Dots debajo, no encima del CTA |
| **Stories de marca** (círculo con anillo de gradiente) | `components/home/BrandRail.tsx` | Marcas, colecciones, filtros visuales |
| **ProductCard** (foto → marca → nombre → tamaño·empaque → precio + "+"/stepper) | `components/ProductCard.tsx` | Todo listado de productos. No crear otra card |
| **Segmented option cards** con radio | `ProductDetail.tsx` → `UnitOption` | Elegir entre 2-3 opciones con precio/subtítulo |
| **Barra sticky inferior** (`fixed inset-x-0 bottom-0 bg-background/95 backdrop-blur-md`) con stepper + CTA `rounded-full h-12` | `ProductDetail.tsx` | Acción principal de la pantalla (agregar, confirmar, pagar). El `main` lleva `pb-36` |
| **Franja de estado** (`bg-success/10 ring-success/20` + check verde + link) | `ProductDetail.tsx` | Feedback persistente sin toast |
| **Ficha en tiles** (`grid grid-cols-2`, ícono tintado + label uppercase + valor) | `ProductDetail.tsx` | Specs, resumen de pedido, datos de entrega |
| **Banner de marca con difuminación** (foto familia a la derecha + degradé horizontal hacia el texto + degradé vertical hacia la página) | `Catalog.tsx` → `BrandBanner` | Cabecera de marca/colección con foto de fondo blanco. El fade hace que la grilla "salga" del banner |
| **Pasos de checkout** (círculos numerados, ✓ verde en los hechos) | `components/checkout/CheckoutSteps.tsx` | Arriba de Carrito / Entrega / Pago |
| **Nudge de bonificación** (tarjeta ámbar + botón negro "+N") | `Cart.tsx` | Cuando falta poco para un beneficio. Convierte |
| **Línea de bonificación** (verde, `ring-success/40`, "Gratis") | `Cart.tsx`, `components/checkout/OrderLines.tsx` | Regalos por reglas de precio. Nunca nombrar la regla |
| **Option cards de entrega** (radio grande + ícono + 2 líneas de detalle) | `DeliverySchedule.tsx` | Elegir dirección, método, etc. |
| **Date pills** (día · número grande · mes, activa en azul) | `DeliverySchedule.tsx` | Elegir fecha entre pocas opciones |
| **Pantalla de pago** (monto grande → QR sobre degradé → pill de countdown → lista de fases) | `PaymentQR.tsx` | Cualquier espera de confirmación externa |
| **Hero de confirmación** (bloque verde con check blanco + dato clave en pill translúcido) | `OrderStatus.tsx` | Éxito de pedido/pago |
| **Timeline vertical** (círculos + línea verde, paso actual azul) | `OrderStatus.tsx` | Seguimiento de estados |
| **Hero de saldo** (bloque ámbar con número enorme + anillo de progreso + badge de nivel) | `screens/money/PointsHome.tsx` | Saldos, metas, progreso a un rango |
| **Anillo de progreso** (`ProgressRing`) y **pill de puntos** (`PointsPill`) | `components/money/PointsUI.tsx` | Cualquier % a una meta / cualquier cantidad de puntos |
| **RedeemProductCard** (misma silueta que ProductCard pero en ámbar, "Canjear" / "Te faltan N pts") | `components/money/RedeemProductCard.tsx` | Catálogo de canje. No mezclar con la card en Bs |
| **Section header** (título + subtítulo + "Ver todo ›") | `components/home/SectionHeader.tsx` | Toda sección con más contenido detrás |
| **Header de foco** (volver + carrito con badge) | `components/chrome/FocusLayout.tsx` | Detalle, checkout, pago, estado |

Ancho: `max-w-3xl mx-auto`, padding lateral `px-4`; en `sm+` pasar a 2 columnas donde tenga sentido
(galería/info, resumen/formulario). Grillas de productos: `grid-cols-2 sm:grid-cols-3`.

## 4. Micro-interacciones (mínimo esperado)
- Tap: `active:scale-95` (chips, botones chicos) o `active:scale-[0.98]` (CTA ancho).
- Agregar al carrito: el "+" rojo se convierte en stepper azul `[− | N unidades | +]`; en 1 el "−"
  es un tacho. Badge de cantidad sobre la foto y ring azul en la card.
- CTA "Agregar" → 1.6 s en verde "✓ Agregado" y vuelve. Sin `alert`, sin toasts flotantes.
- Carrusel: autoplay 5.5 s que se pausa con hover/touch.
- Hover en foto: `group-hover:scale-105`.

## 5. Copy (tono)
- Español rioplatense/boliviano en **voseo**: "Pedí", "Reservá", "¿Cómo lo querés?", "Ahorrás".
- Directo y de negocio (B2B): "Reponé tu stock", "Entrega en tu negocio", "Precio mayorista".
  Sin "¡Hola!" genérico ni emojis en UI.
- Cifras siempre `formatBs()` → `Bs 82.50`. Empaque resumido con `packagingShort()` → "Caja x12";
  bulto desglosado con `parsePackaging()` → "8 displays × 25 unidades".
- Nombres de sección cortos (2-4 palabras) + subtítulo que explique el criterio ("Lo que más rota en
  negocios como el tuyo").

## 6. Checklist antes de entregar una pantalla
- [ ] ¿Usa foto real donde hay? ¿Placeholder de marca donde no?
- [ ] ¿La acción principal es roja, única y está siempre visible (sticky si la pantalla es larga)?
- [ ] ¿Hay al menos un bloque que rompa la cuadrícula (rail, bento, foto flotante, tile de color)?
- [ ] ¿Todo es `rounded-2xl/3xl`, `ring-foreground/5`, sombras suaves? ¿Cero bordes grises duros?
- [ ] ¿Títulos en Poppins, labels uppercase chicas, precios con `cn-font-heading`?
- [ ] ¿Mobile 375 sin scroll horizontal del body (`min-w-0` en flex-1 con `truncate`)?
- [ ] ¿Desktop 1280 aprovecha el ancho (2 columnas / 3 en grilla)?
- [ ] ¿Ningún dato inventado? ¿Preguntaste lo que no estaba definido?
- [ ] ¿`npm run build` y `npx oxlint src` limpios? ¿Screenshot revisado?
- [ ] ¿`CLAUDE.md` actualizado con la decisión y el estado?

## 7. Anti-patrones (lo que hizo fallar la v1)
- Grilla uniforme de íconos en cuadrados tintados como única forma de mostrar categorías.
- Marcas como cajas grises con texto. Chips tipográficos sin jerarquía.
- Hero de un solo color con texto y un botón gris.
- Cards con ícono en vez de foto cuando la foto existe.
- Texto de marketing inventado o datos que el catálogo no tiene.
- Toasts/alerts para feedback; dots de carrusel encima del CTA; header que desborda en 375 px.
