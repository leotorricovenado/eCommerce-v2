import { Blender, Refrigerator, Smartphone, Ticket, Tv, type LucideIcon } from "lucide-react"

import type { Product } from "./products"

// GRANDES PREMIOS — SIMULADO.
//
// Premios EXTERNOS a la marca: no son productos del catálogo de Grupo Venado (no tienen SKU, ni
// stock, ni precio de venta), son el escalón alto del canje de Venado Money — lo que el cliente
// mira cuando junta puntos durante meses. En producción los administra el microservicio de
// puntos/premios de DEAL (alta del premio, foto, costo en puntos, vigencia y cupo); acá solo se
// mockean para mostrar la pantalla.
//
// COSTO EN PUNTOS: se mantiene la regla del programa (1 punto = Bs 1 de valor), así que el costo
// es el valor de mercado del premio redondeado. Por eso todos arrancan en 1.000 pts: son los
// únicos ítems del catálogo que valen Bs 1.000 o más.
//
// FOTOS: al no ser productos del catálogo no hay archivo en `public/productos`, así que la card
// usa `imageUrl` (foto de referencia del proveedor) y, si no carga, cae al ícono del premio.

export const PRIZE_CATEGORY_ID = "grandes-premios"
export const PRIZE_CATEGORY_LABEL = "Grandes Premios"

export interface Prize {
  id: string
  name: string
  /** Qué es, en una línea. Ocupa el lugar del tamaño en las cards, el carrito y el pedido. */
  detail: string
  /** Costo del canje. Siempre >= 1.000: es el tramo aspiracional del programa. */
  points: number
  /** Foto de referencia del premio (no vive en public/productos). */
  imageUrl?: string
  /** Respaldo visual cuando no hay foto o la foto no carga. */
  icon: LucideIcon
}

export const prizes: Prize[] = [
  {
    id: "premio-vale-compra-1000",
    name: "Vale de compra Bs 1.000",
    detail: "Vale para gastar en tu próximo pedido",
    points: 1000,
    icon: Ticket,
  },
  {
    id: "premio-licuadora",
    name: "Licuadora 3 velocidades",
    detail: "Vaso de vidrio 1,5 L",
    points: 1000,
    imageUrl: "https://www.tiendaamiga.com.bo/media/catalog/product/cache/deb88dadd509903c96aaa309d3e790dc/3/8/384.gif",
    icon: Blender,
  },
  {
    id: "premio-tv-32",
    name: 'Televisor Smart 32"',
    detail: "Smart TV HD 32 pulgadas",
    points: 1800,
    imageUrl: "https://apulsovirtualshop.com/wp-content/uploads/2024/06/televisor-32-pulgadas-smart-tv-nia-imagen.jpg",
    icon: Tv,
  },
  {
    id: "premio-smartphone",
    name: "Smartphone gama media",
    detail: "128 GB, pantalla 6,5 pulgadas",
    points: 2500,
    imageUrl:
      "https://images.samsung.com/is/image/samsung/p6pim/my/s2602/gallery/my-galaxy-s26-ultra-s948-578304-sm-s948bzvcxme-thumb-550819724",
    icon: Smartphone,
  },
  {
    id: "premio-refrigerador",
    name: "Refrigerador 12 pies",
    detail: "No frost, 2 puertas",
    points: 4000,
    imageUrl:
      "https://samsung-bolivia.s3.amazonaws.com/product-family-item-image/normal/product-family-item-image_PHQSl4UfptqnTR3KxEge.png",
    icon: Refrigerator,
  },
]

/**
 * Un premio se canjea por el MISMO camino que un producto (card de canje -> carrito -> pedido),
 * así que se lo presenta con la forma de `Product`. No entra al catálogo de venta: `products.ts`
 * no lo incluye y por eso tampoco tiene página de detalle.
 */
export function prizeAsProduct(prize: Prize): Product {
  return {
    id: prize.id,
    name: prize.name,
    brand: null,
    categoryId: PRIZE_CATEGORY_ID,
    subcategoryId: PRIZE_CATEGORY_ID,
    size: prize.detail,
    sku: null,
    shelfLife: null,
    packaging: null,
  }
}
