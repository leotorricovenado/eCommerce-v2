// VENADO MONEY — programa de puntos de Grupo Venado (SIMULADO).
//
// Referencia de producto: FarmaCLUB (Farmacorp). NO es una copia: acá el canje se hace DENTRO del
// mismo carrito/pedido (pedido mixto Bs + puntos) y cada pedido muestra cuántos puntos sumó.
//
// CÓMO SE GANAN (decisión de negocio 2026-09-04): los puntos los generan ESTRATEGIAS configuradas
// en otro microservicio de DEAL. Cada estrategia fija un ALCANCE (producto, marca,
// familia/subfamilia o categoría) y una META — en Bs o en unidades — y bonifica con N puntos
// cuando el cliente la CUMPLE. La meta se cumple acumulando compras: Bs 100 en un pedido más
// Bs 70 en otro cumplen una meta de Bs 150. La meta SIEMPRE es en dinero (confirmado por negocio
// el 2026-09-04): no existen metas por cantidad de unidades. Hay dos tipos de estrategia del negocio
// (subir el ticket promedio de un alcance que el cliente ya compra, y penetración de ítems para
// que empiece a comprar uno nuevo), pero el cliente es AGNÓSTICO a esa distinción: los dos se
// ven igual — meta, progreso y premio — y el eCommerce los llama "objetivos". Al eCommerce le
// llegan las estrategias vigentes del cliente con su progreso ya calculado; acá
// `EARN_STRATEGIES` + `goalStatuses()` lo simulan y `state/points.tsx` guarda el progreso.
//
// Otras reglas (constantes ajustables):
//   - Niveles por puntos ACUMULADOS históricos (no por saldo): Bronce / Plata / Oro. El
//     multiplicador del nivel se aplica sobre los puntos del objetivo cumplido.
//   - Los puntos VENCEN a los `EXPIRY_MONTHS` meses; los canjes consumen FIFO.
//   - Canje: 1 punto = Bs 1 de valor en producto; solo un subconjunto del catálogo es canjeable.
import { categories } from "./categories"
import { mockPrice } from "./mockPricing"
import type { Quote } from "./priceRules"
import { PRIZE_CATEGORY_ID, PRIZE_CATEGORY_LABEL, prizeAsProduct, prizes, type Prize } from "./prizes"
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
  { key: "bronce", label: "Bronce", min: 0, max: 1000, multiplier: 1, benefit: "Puntos base de cada objetivo" },
  { key: "plata", label: "Plata", min: 1001, max: 5000, multiplier: 1.2, benefit: "20 % más de puntos por objetivo" },
  { key: "oro", label: "Oro", min: 5001, max: null, multiplier: 1.5, benefit: "50 % más de puntos por objetivo" },
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

// ---- Objetivos (estrategias de generación de puntos) ------------------------------------------
//
// Un OBJETIVO es una meta sobre un alcance del catálogo (producto / marca / familia / categoría)
// que, al cumplirse, bonifica al cliente con puntos. Del lado del negocio hay dos tipos de
// estrategia — subir el ticket promedio dentro de un alcance que el cliente ya compra, y
// penetración de ítems (que empiece a comprar un alcance nuevo) — pero el cliente es AGNÓSTICO a
// esa distinción: los dos se ven igual (meta + progreso + premio) y la UI trabaja con `GoalStatus`.

export type StrategyScope =
  | { kind: "product"; productIds: string[] }
  | { kind: "brand"; brand: string }
  | { kind: "subcategory"; categoryId: string; subcategoryId: string }
  | { kind: "category"; categoryId: string }

/**
 * Tipo INTERNO de la estrategia — lenguaje comercial, NUNCA se muestra al cliente:
 *  - "ticket": el cliente ya compra el alcance y se busca que compre más (subir su ticket promedio).
 *  - "penetracion": el cliente no compra el alcance y se busca que empiece a comprarlo.
 * Solo sirve para que el mock se parezca al contrato del microservicio.
 */
export type StrategyKind = "ticket" | "penetracion"

export interface EarnStrategy {
  id: string
  /** Nombre corto y amigable del alcance: es lo único del alcance que ve el cliente. */
  name: string
  kind: StrategyKind
  scope: StrategyScope
  /** Meta a alcanzar, en Bs del neto comprado dentro del alcance. */
  goal: number
  /** Puntos que se acreditan al CUMPLIR la meta. Se gana una sola vez (no se reinicia). */
  points: number
  /** Último día de vigencia (null = sin plazo). */
  endsAt: Date | null
  /**
   * Avance que el cliente ya traía de compras anteriores. La meta se cumple ACUMULANDO compras
   * (Bs 100 en un pedido + Bs 70 en otro cumplen una meta de Bs 150), así que el progreso vive en
   * el cliente y no en el pedido. En producción lo manda el microservicio ya calculado; acá se
   * siembra para que la demo arranque con objetivos a medio camino.
   */
  initialProgress: number
}

/** Un objetivo se marca "por vencer" cuando le quedan estos días o menos. */
export const GOAL_ENDING_SOON_DAYS = 15

const endsInDays = (days: number): Date => {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  d.setDate(d.getDate() + days)
  return d
}

export const EARN_STRATEGIES: EarnStrategy[] = [
  {
    // Ticket promedio: el cliente ya compra KRIS por ~Bs 100, se busca llevarlo a Bs 150.
    id: "VM-KRIS-150",
    name: "KRIS",
    kind: "ticket",
    scope: { kind: "brand", brand: "KRIS" },
    goal: 150,
    points: 20,
    endsAt: endsInDays(18),
    initialProgress: 100,
  },
  {
    // Penetración: el cliente compra KRIS pero nunca Pulpín; alcanza con que compre una cantidad.
    id: "VM-PULPIN-80",
    name: "Pulpín",
    kind: "penetracion",
    scope: { kind: "brand", brand: "Pulpín" },
    goal: 80,
    points: 20,
    endsAt: endsInDays(11),
    initialProgress: 0,
  },
  {
    id: "VM-VAJILLEROS-24",
    name: "Vajilleros",
    kind: "penetracion",
    scope: { kind: "subcategory", categoryId: "limpieza-del-hogar", subcategoryId: "vajilleros" },
    goal: 300,
    points: 30,
    endsAt: endsInDays(9),
    initialProgress: 265,
  },
  {
    id: "VM-SALSAS-400",
    name: "Salsas",
    kind: "ticket",
    scope: { kind: "category", categoryId: "salsas" },
    goal: 400,
    points: 50,
    endsAt: endsInDays(32),
    initialProgress: 240,
  },
  {
    id: "VM-RAPTOR-12",
    name: "Energizantes Raptor",
    kind: "penetracion",
    scope: { kind: "brand", brand: "Raptor" },
    goal: 150,
    points: 30,
    endsAt: endsInDays(25),
    initialProgress: 40,
  },
  {
    // Ya cumplido: sirve para ver el estado "logrado" en /puntos/objetivos.
    id: "VM-BEBIDAS-RTD-200",
    name: "Bebidas listas para beber",
    kind: "ticket",
    scope: { kind: "category", categoryId: "bebidas-rtd" },
    goal: 200,
    points: 25,
    endsAt: endsInDays(40),
    initialProgress: 200,
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

/** Objetivos a los que aporta un producto (para badges y el detalle). */
export function strategiesFor(product: Product): EarnStrategy[] {
  return EARN_STRATEGIES.filter((s) => strategyMatches(s, product))
}

/** Etiqueta del alcance. */
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

/** A dónde lleva el objetivo en el catálogo. */
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

/** Producto de muestra (con foto) para ilustrar el objetivo. */
export function scopeSampleProduct(s: EarnStrategy): Product | undefined {
  return products.find((p) => strategyMatches(s, p) && hasProductImage(p)) ?? products.find((p) => strategyMatches(s, p))
}

/** Importe de una meta o de un avance, redondeado: "Bs 150". */
export function formatGoalAmount(value: number): string {
  return `Bs ${Math.round(value).toLocaleString("es-BO")}`
}

/** La meta tal como la lee el cliente: "Llevá Bs 150 en KRIS". */
export function goalHeadline(s: EarnStrategy): string {
  return `Llevá ${formatGoalAmount(s.goal)} en ${s.name}`
}

/** Progreso acumulado por objetivo (id → avance). Lo mantiene `PointsProvider`. */
export type GoalProgressMap = Record<string, number>

/** Progreso inicial de todos los objetivos (lo que el microservicio mandaría al abrir la app). */
export function initialGoalProgress(): GoalProgressMap {
  return Object.fromEntries(EARN_STRATEGIES.map((s) => [s.id, s.initialProgress]))
}

/** Cuánto aporta una cotización al alcance de un objetivo (Bs del neto de sus líneas). */
export function contribution(s: EarnStrategy, quote: Pick<Quote, "lines"> | null): number {
  if (!quote) return 0
  let total = 0
  for (const l of quote.lines) {
    if (strategyMatches(s, l.product)) total += l.net
  }
  return total
}

export interface GoalStatus {
  strategy: EarnStrategy
  /** Acumulado por compras anteriores. */
  before: number
  /** Lo que aporta el carrito/pedido en curso. */
  inCart: number
  /** Avance a mostrar (topeado en la meta). */
  current: number
  /** Lo que falta para cumplir, contando lo que hay en el carrito. */
  missing: number
  /** 0-1 para la barra de progreso. */
  pct: number
  /** Ya estaba cumplido antes de este carrito (no vuelve a pagar puntos). */
  done: boolean
  /** Este carrito lo completa: acá es donde se ganan los puntos. */
  completesNow: boolean
  daysLeft: number | null
  endingSoon: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

export function goalStatus(
  s: EarnStrategy,
  progress: GoalProgressMap,
  quote: Pick<Quote, "lines"> | null = null
): GoalStatus {
  const before = Math.min(progress[s.id] ?? s.initialProgress, s.goal)
  const done = before >= s.goal
  const inCart = done ? 0 : contribution(s, quote)
  const raw = before + inCart
  const current = Math.min(raw, s.goal)
  // Piso: si vence al final de hoy + 9 días, quedan 9 (no 10 por las horas sueltas de hoy).
  const daysLeft = s.endsAt ? Math.max(0, Math.floor((s.endsAt.getTime() - Date.now()) / DAY_MS)) : null
  return {
    strategy: s,
    before,
    inCart,
    current,
    missing: Math.max(0, s.goal - raw),
    pct: Math.min(1, current / s.goal),
    done,
    completesNow: !done && raw >= s.goal,
    daysLeft,
    endingSoon: daysLeft !== null && daysLeft <= GOAL_ENDING_SOON_DAYS,
  }
}

/** Estado de todos los objetivos: primero los que el carrito completa, después por avance. */
export function goalStatuses(progress: GoalProgressMap, quote: Pick<Quote, "lines"> | null = null): GoalStatus[] {
  return EARN_STRATEGIES.map((s) => goalStatus(s, progress, quote)).sort((a, b) => {
    if (a.completesNow !== b.completesNow) return a.completesNow ? -1 : 1
    if (a.done !== b.done) return a.done ? 1 : -1
    return b.pct - a.pct
  })
}

export interface EarnBreakdown {
  /** Objetivos que este pedido completa: los únicos que pagan puntos. */
  completed: GoalStatus[]
  /** Objetivos que avanzan pero todavía no llegan a la meta. */
  inProgress: GoalStatus[]
  /** Puntos base de los objetivos cumplidos (sin nivel). */
  base: number
  /** Puntos finales con el multiplicador del nivel. */
  total: number
}

/** Qué objetivos cumple un pedido y cuántos puntos deja. */
export function earnBreakdown(quote: Pick<Quote, "lines">, tier: Tier, progress: GoalProgressMap): EarnBreakdown {
  const all = goalStatuses(progress, quote)
  const completed = all.filter((g) => g.completesNow)
  const inProgress = all.filter((g) => !g.completesNow && !g.done)
  const base = completed.reduce((a, g) => a + g.strategy.points, 0)
  return { completed, inProgress, base, total: Math.floor(base * tier.multiplier) }
}

/** Puntos que deja un pedido (los canjes no suman). */
export function pointsForQuote(quote: Pick<Quote, "lines">, tier: Tier, progress: GoalProgressMap): number {
  return earnBreakdown(quote, tier, progress).total
}

/** Progreso después de confirmar un pedido: cada objetivo suma lo que aportó, topeado en su meta. */
export function applyQuoteToGoals(progress: GoalProgressMap, quote: Pick<Quote, "lines">): GoalProgressMap {
  const next: GoalProgressMap = { ...progress }
  for (const s of EARN_STRATEGIES) {
    const before = next[s.id] ?? s.initialProgress
    if (before >= s.goal) continue
    next[s.id] = Math.min(s.goal, before + contribution(s, quote))
  }
  return next
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
  /**
   * Premio EXTERNO a la marca (Grandes Premios). Ausente en los productos del catálogo. Cuando
   * está, el ítem no tiene página de producto y la foto sale de `prize.imageUrl`.
   */
  prize?: Prize
}

/** Categorías donde se puede canjear (no todo el catálogo participa). */
export const REDEEM_CATEGORY_IDS = ["salsas", "bebidas-rtd", "bebidas-en-polvo", "limpieza-del-hogar", "postres", "culinarios"]
const PER_CATEGORY = 4

/** Productos canjeables: los primeros N CON FOTO de cada categoría participante. */
const redeemableProducts: Redeemable[] = REDEEM_CATEGORY_IDS.flatMap((categoryId) =>
  products
    .filter((p) => p.categoryId === categoryId && hasProductImage(p))
    .slice(0, PER_CATEGORY)
    .map((product) => ({ product, points: pointsCost(product) }))
)

/** Grandes Premios: canjes que no son de la marca (electro, tecnología, vales). Siempre 1.000+. */
export const redeemablePrizes: Redeemable[] = prizes.map((prize) => ({
  product: prizeAsProduct(prize),
  points: prize.points,
  prize,
}))

/** Catálogo de canje completo: productos de la marca primero, Grandes Premios al final. */
export const redeemables: Redeemable[] = [...redeemableProducts, ...redeemablePrizes]

/** Filtros del catálogo de canje: las categorías del catálogo + los Grandes Premios. */
export const redeemCategories: { id: string; label: string }[] = [
  ...categories.filter((c) => REDEEM_CATEGORY_IDS.includes(c.id)).map((c) => ({ id: c.id, label: c.label })),
  { id: PRIZE_CATEGORY_ID, label: PRIZE_CATEGORY_LABEL },
]

const byProductId = new Map(redeemables.map((r) => [r.product.id, r]))

export function redeemableFor(productId: string): Redeemable | undefined {
  return byProductId.get(productId)
}
