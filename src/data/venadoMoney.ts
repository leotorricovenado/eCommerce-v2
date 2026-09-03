// VENADO MONEY — programa de puntos de Grupo Venado (SIMULADO).
//
// Referencia de producto: FarmaCLUB (Farmacorp). NO es una copia: acá el canje se hace DENTRO del
// mismo carrito/pedido (pedido mixto Bs + puntos) y cada pedido muestra cuántos puntos sumó.
//
// CÓMO SE GANAN (decisión de negocio 2026-09-03, tras la presentación): los puntos NO dependen del
// monto. Los genera un motor de ESTRATEGIAS configurado en otro microservicio de DEAL: cada
// estrategia apunta a un producto, marca, familia/subfamilia (subcategoría) o categoría y dice
// "por cada X unidades compradas → N puntos". Sirve, por ejemplo, para que un cliente que compra A
// empiece a comprar B (la estrategia premia B). Al eCommerce le llega la lista de estrategias
// vigentes para el cliente y los puntos ya calculados por pedido; acá `EARN_STRATEGIES` +
// `earnBreakdown()` simulan ambas cosas. El cliente ve la lista como "Productos que suman puntos".
//
// Otras reglas (constantes ajustables):
//   - Niveles por puntos ACUMULADOS históricos (no por saldo): Bronce / Plata / Oro. El
//     multiplicador del nivel se aplica sobre los puntos de las estrategias (beneficio visible).
//   - Los puntos VENCEN a los `EXPIRY_MONTHS` meses; los canjes consumen FIFO.
//   - Canje: 1 punto = Bs 1 de valor en producto; solo un subconjunto del catálogo es canjeable.
import { categories } from "./categories"
import { mockPrice } from "./mockPricing"
import type { Quote } from "./priceRules"
import { hasProductImage } from "./productImages"
import { products, type Product } from "./products"

export const REDEEM_BS_PER_POINT = 1
export const EXPIRY_MONTHS = 12

// ---- Niveles ----------------------------------------------------------------------------------

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
  { key: "bronce", label: "Bronce", min: 0, max: 1000, multiplier: 1, benefit: "Puntos base de cada estrategia" },
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

// ---- Estrategias de generación de puntos ------------------------------------------------------

export type StrategyScope =
  | { kind: "product"; productIds: string[] }
  | { kind: "brand"; brand: string }
  | { kind: "subcategory"; categoryId: string; subcategoryId: string }
  | { kind: "category"; categoryId: string }

export interface EarnStrategy {
  id: string
  /** Nombre corto que ve el cliente. */
  name: string
  scope: StrategyScope
  /** Cada `every` unidades sueltas compradas del alcance… */
  every: number
  /** …suma `points` puntos. */
  points: number
  /** Desde cuántas unidades antes del próximo múltiplo avisamos "te faltan N". */
  hintWindow: number
}

export const EARN_STRATEGIES: EarnStrategy[] = [
  {
    id: "VM-MAYONESA-CAJA",
    name: "Mayonesa Doypack 980 ml",
    scope: { kind: "product", productIds: ["mayonesa-doypack-300986"] },
    every: 12,
    points: 50,
    hintWindow: 6,
  },
  {
    id: "VM-KETCHUP-6",
    name: "Ketchup Doypack",
    scope: { kind: "product", productIds: ["ketchup-doypack-301049", "ketchup-doypack-301048"] },
    every: 6,
    points: 20,
    hintWindow: 3,
  },
  {
    // Ejemplo de estrategia "A → B": queremos que quien compra bebidas pruebe Raptor.
    id: "VM-RAPTOR-6",
    name: "Energizantes Raptor",
    scope: { kind: "brand", brand: "Raptor" },
    every: 6,
    points: 30,
    hintWindow: 3,
  },
  {
    id: "VM-DETERGENTES-12",
    name: "Detergentes Bristar y Pulpín",
    scope: { kind: "subcategory", categoryId: "limpieza-del-hogar", subcategoryId: "detergentes" },
    every: 12,
    points: 30,
    hintWindow: 6,
  },
  {
    id: "VM-BEBIDAS-RTD-6",
    name: "Bebidas listas para beber",
    scope: { kind: "category", categoryId: "bebidas-rtd" },
    every: 6,
    points: 10,
    hintWindow: 3,
  },
]

export function strategyMatches(s: EarnStrategy, product: Product): boolean {
  switch (s.scope.kind) {
    case "product":
      return s.scope.productIds.includes(product.id)
    case "brand":
      return product.brand === s.scope.brand
    case "subcategory":
      return product.categoryId === s.scope.categoryId && product.subcategoryId === s.scope.subcategoryId
    case "category":
      return product.categoryId === s.scope.categoryId
  }
}

/** Estrategias que premian a un producto (para badges y el detalle). */
export function strategiesFor(product: Product): EarnStrategy[] {
  return EARN_STRATEGIES.filter((s) => strategyMatches(s, product))
}

/** Etiqueta del alcance para la lista "Productos que suman puntos". */
export function scopeLabel(s: EarnStrategy): string {
  const scope = s.scope
  switch (scope.kind) {
    case "product":
      return scope.productIds.length > 1 ? "Productos seleccionados" : "Producto"
    case "brand":
      return `Marca ${scope.brand}`
    case "subcategory": {
      const cat = categories.find((c) => c.id === scope.categoryId)
      const sub = cat?.subcategories.find((x) => x.id === scope.subcategoryId)
      return `${sub?.label ?? "Subcategoría"} · ${cat?.label ?? ""}`.trim()
    }
    case "category": {
      const cat = categories.find((c) => c.id === scope.categoryId)
      return `Categoría ${cat?.label ?? ""}`.trim()
    }
  }
}

/** A dónde lleva la estrategia en el catálogo. */
export function scopeLink(s: EarnStrategy): string {
  const scope = s.scope
  switch (scope.kind) {
    case "product":
      return scope.productIds.length === 1 ? `/producto/${scope.productIds[0]}` : "/catalogo"
    case "brand":
      return `/catalogo?marca=${encodeURIComponent(scope.brand)}`
    case "subcategory":
      return `/catalogo?categoria=${scope.categoryId}&sub=${scope.subcategoryId}`
    case "category":
      return `/catalogo?categoria=${scope.categoryId}`
  }
}

/** Producto de muestra (con foto) para ilustrar la estrategia. */
export function scopeSampleProduct(s: EarnStrategy): Product | undefined {
  return products.find((p) => strategyMatches(s, p) && hasProductImage(p)) ?? products.find((p) => strategyMatches(s, p))
}

export interface EarnBreakdownLine {
  strategy: EarnStrategy
  /** Unidades sueltas del alcance en el pedido. */
  units: number
  times: number
  /** Puntos base (sin nivel). */
  points: number
}

export interface EarnHint {
  strategy: EarnStrategy
  missingUnits: number
  /** Producto sugerido para completar (el del carrito que más aporta al alcance). */
  product: Product
}

export interface EarnBreakdown {
  lines: EarnBreakdownLine[]
  hints: EarnHint[]
  /** Puntos base de estrategias. */
  base: number
  /** Puntos finales con el multiplicador del nivel. */
  total: number
}

/** Puntos que suma un pedido: por estrategia, con detalle y avisos "te faltan N". */
export function earnBreakdown(quote: Pick<Quote, "lines">, tier: Tier): EarnBreakdown {
  const lines: EarnBreakdownLine[] = []
  const hints: EarnHint[] = []
  for (const s of EARN_STRATEGIES) {
    let units = 0
    let top: { product: Product; units: number } | null = null
    for (const l of quote.lines) {
      if (!strategyMatches(s, l.product)) continue
      units += l.units
      if (!top || l.units > top.units) top = { product: l.product, units: l.units }
    }
    if (units === 0) continue
    const times = Math.floor(units / s.every)
    if (times > 0) lines.push({ strategy: s, units, times, points: times * s.points })
    const rest = units % s.every
    if (rest > 0 && rest >= s.every - s.hintWindow && top) {
      hints.push({ strategy: s, missingUnits: s.every - rest, product: top.product })
    }
  }
  const base = lines.reduce((a, l) => a + l.points, 0)
  return { lines, hints, base, total: Math.floor(base * tier.multiplier) }
}

/** Puntos que suma un pedido completo (los canjes no suman). */
export function pointsForQuote(quote: Pick<Quote, "lines">, tier: Tier): number {
  return earnBreakdown(quote, tier).total
}

/** Fecha de vencimiento de puntos ganados en `at`. */
export function expiryFor(at: Date): Date {
  const d = new Date(at)
  d.setMonth(d.getMonth() + EXPIRY_MONTHS)
  return d
}

// ---- Canje ------------------------------------------------------------------------------------

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
