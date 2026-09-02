// VENADO MONEY — programa de puntos de Grupo Venado (SIMULADO, decisiones del usuario 2026-09-02).
//
// Referencia de producto: FarmaCLUB (Farmacorp): saldo de puntos, progreso al siguiente nivel,
// extracto, categorías canjeables y catálogo con costo en puntos. NO es una copia: acá el canje
// se hace DENTRO del mismo carrito/pedido (pedido mixto Bs + puntos) y cada pedido normal muestra
// cuántos puntos sumó.
//
// Reglas (todas en constantes para poder ajustarlas):
//   - Se gana 1 punto por cada Bs 10 del neto pagado, al CONFIRMAR el pedido (prepago).
//   - Niveles por puntos ACUMULADOS históricos (no por saldo): Bronce / Plata / Oro, con
//     multiplicador de ganancia como beneficio visible.
//   - Canje: 1 punto = Bs 1 de valor en producto (cost = precio mock redondeado a 5). Solo un
//     subconjunto del catálogo es canjeable (categorías y productos con foto, ver `redeemables`).
import { categories } from "./categories"
import { mockPrice } from "./mockPricing"
import { hasProductImage } from "./productImages"
import { products, type Product } from "./products"

export const POINTS_PER_BS = 1 / 10
export const REDEEM_BS_PER_POINT = 1

export interface Tier {
  key: "bronce" | "plata" | "oro"
  label: string
  /** Puntos acumulados desde los que aplica. */
  min: number
  /** Último punto del rango (null = sin tope). */
  max: number | null
  multiplier: number
  benefit: string
}

export const TIERS: Tier[] = [
  { key: "bronce", label: "Bronce", min: 0, max: 1000, multiplier: 1, benefit: "1 punto por cada Bs 10" },
  { key: "plata", label: "Plata", min: 1001, max: 5000, multiplier: 1.2, benefit: "20 % más de puntos por pedido" },
  { key: "oro", label: "Oro", min: 5001, max: null, multiplier: 1.5, benefit: "50 % más de puntos por pedido" },
]

export function tierFor(lifetime: number): Tier {
  return [...TIERS].reverse().find((t) => lifetime >= t.min) ?? TIERS[0]!
}

export function nextTier(tier: Tier): Tier | null {
  const i = TIERS.findIndex((t) => t.key === tier.key)
  return TIERS[i + 1] ?? null
}

/** Progreso (0-1) dentro del nivel actual y puntos que faltan para el siguiente. */
export function progressToNext(lifetime: number): { tier: Tier; next: Tier | null; pct: number; missing: number } {
  const tier = tierFor(lifetime)
  const next = nextTier(tier)
  if (!next) return { tier, next, pct: 1, missing: 0 }
  const span = next.min - tier.min
  const pct = Math.min(1, Math.max(0, (lifetime - tier.min) / span))
  return { tier, next, pct, missing: Math.max(0, next.min - lifetime) }
}

/** Puntos que suma un pedido según su neto en Bs y el nivel del cliente. */
export function pointsForNet(net: number, tier: Tier): number {
  return Math.floor(net * POINTS_PER_BS * tier.multiplier)
}

/** Costo en puntos de un producto canjeable (redondeado a múltiplos de 5). */
export function pointsCost(product: Product): number {
  return Math.max(5, Math.round((mockPrice(product) / REDEEM_BS_PER_POINT) / 5) * 5)
}

export interface Redeemable {
  product: Product
  points: number
}

/** Categorías donde se puede canjear (no todo el catálogo participa). */
export const REDEEM_CATEGORY_IDS = ["salsas", "bebidas-rtd", "bebidas-en-polvo", "limpieza-del-hogar", "postres", "culinarios"]
const PER_CATEGORY = 4

/** Catálogo de canje: los primeros N productos CON FOTO de cada categoría participante. */
export const redeemables: Redeemable[] = REDEEM_CATEGORY_IDS.flatMap((categoryId) =>
  products
    .filter((p) => p.categoryId === categoryId && hasProductImage(p))
    .slice(0, PER_CATEGORY)
    .map((product) => ({ product, points: pointsCost(product) }))
)

export const redeemCategories = categories.filter((c) => REDEEM_CATEGORY_IDS.includes(c.id))

const byProductId = new Map(redeemables.map((r) => [r.product.id, r]))

export function redeemableFor(productId: string): Redeemable | undefined {
  return byProductId.get(productId)
}
