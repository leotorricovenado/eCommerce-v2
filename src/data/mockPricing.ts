import type { Product } from "./products"

// SIMULADO — ver memoria de proyecto `ecommerce-schema-real-vs-mockup`: el precio real NUNCA
// es un campo fijo del producto, Sales lo resuelve en vivo por cliente vía getPriceRules cada
// vez que se abre el carrito. Esto genera un precio plausible y ESTABLE (mismo producto -> mismo
// precio en cada render) solo para que las pantallas de demo tengan algo que mostrar. No mezclar
// con products.ts (datos reales de catálogo) ni tratar como fuente de verdad.

const PRICE_BAND_BY_CATEGORY: Record<string, [number, number]> = {
  "limpieza-del-hogar": [8, 95],
  "cuidado-personal": [10, 35],
  "bebidas-en-polvo": [3, 18],
  "bebidas-rtd": [5, 25],
  panificacion: [12, 90],
  salsas: [5, 90],
  culinarios: [6, 60],
  postres: [8, 40],
  cereales: [10, 45],
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mockPrice(product: Product): number {
  const [min, max] = PRICE_BAND_BY_CATEGORY[product.categoryId] ?? [10, 50]
  const t = (hashString(product.id) % 1000) / 1000
  const raw = min + t * (max - min)
  return Math.round(raw * 2) / 2
}

export function mockDiscountPercent(product: Product): number {
  const h = hashString(`discount-${product.id}`) % 100
  if (h < 78) return 0
  if (h < 93) return 10
  return 20
}
