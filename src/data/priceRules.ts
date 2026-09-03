// MOTOR DE REGLAS DE PRECIO — SIMULADO.
//
// En real, el eCommerce manda el carrito a Sales (O3 "Bonificaciones y descuentos", equivalente a
// `POST /api/getPriceRules`) y recibe POR LÍNEA: price, originalPrice, discountAmount, bonus,
// bonusRuleId, rulesApplied... Las reglas en sí (listas de precio, escalas, combos) son un tema
// complejo de Sales que a eVenado NO le interesa: al eCommerce solo le llegan sus EFECTOS. Una
// regla puede dar descuento, bonificación, o ambos a la vez. Por eso acá:
//   - las reglas son datos opacos con un `id` interno que nunca se muestra al cliente,
//   - la UI solo muestra "Bonificación" (nunca "Mayorista A" ni nombres de regla),
//   - **no hay descuentos**: decisión de negocio 2026-09-03 — el eCommerce no muestra descuentos
//     (ni porcentaje, ni precio tachado, ni fila "Descuentos"). El precio que se ve es el precio
//     del cliente y punto; el efecto visible de las reglas es la bonificación. Si algún día Sales
//     manda `discountAmount`, hay que volver a preguntarle a negocio antes de mostrarlo.
//   - la bonificación es una LÍNEA APARTE gratis (`is_bonus` en sale_order_details), aunque sea
//     del mismo producto que se compra ("2 líneas por producto", nota del schema real).
// Decisión del usuario 2026-09-02. Reemplazar `quoteCart` por la llamada real cuando exista O3.
import { mockPrice } from "./mockPricing"
import { products, type Product } from "./products"
import { redeemableFor } from "./venadoMoney"
import { parsePackaging } from "@/lib/format"

export type CartUnit = "unidad" | "caja"

export interface CartLineInput {
  productId: string
  unit: CartUnit
  quantity: number
}

interface Rule {
  id: string
  /** Productos a los que aplica; vacío = todos. */
  productIds: string[]
  /** Cada `every` unidades sueltas regala `bonusQty` de `bonusProductId` (o del mismo producto). */
  every?: number
  bonusQty?: number
  bonusProductId?: string
  /** Mínimo de unidades para que la regla aplique (si no hay `every`). */
  minUnits?: number
  /** Cuántas unidades antes del umbral empezamos a avisar "te faltan N". */
  hintWindow?: number
}

const RULES: Rule[] = [
  // Escala 12+1 en salsas doypack KRIS: cada 12 unidades, 1 gratis del mismo producto.
  {
    id: "PR-ESCALA-12-1",
    productIds: ["mayonesa-doypack-300986", "ketchup-doypack-301049"],
    every: 12,
    bonusQty: 1,
    hintWindow: 6,
  },
  // Combo Bristar: desde 1 caja (12) de lavavajillas doypack → un vajillero 2 L gratis.
  {
    id: "PR-COMBO-BRISTAR",
    productIds: ["lavavajillas-limon-bristar-doypack-301278"],
    minUnits: 12,
    bonusQty: 1,
    bonusProductId: "vajillero-limon-bristar-301033",
    hintWindow: 6,
  },
]

export interface QuoteLine extends CartLineInput {
  product: Product
  /** Unidades sueltas que representa la línea (qty × unidades del bulto). */
  units: number
  /** Precio unitario (por unidad suelta) antes de reglas. */
  unitPrice: number
  /** Precio del bulto/unidad elegida antes de reglas. */
  itemPrice: number
  gross: number
  net: number
  rulesApplied: string[]
}

export interface BonusLine {
  product: Product
  quantity: number
  ruleId: string
  /** Producto comprado que disparó la bonificación. */
  triggeredBy: Product
}

export interface QuoteHint {
  product: Product
  missingUnits: number
  ruleId: string
  /** Qué se gana al completar el umbral. */
  reward: string
}

export interface RedeemLineInput {
  productId: string
  quantity: number
}

/** Producto canjeado con puntos Venado Money (va en el mismo pedido, sin costo en Bs). */
export interface RedeemLine extends RedeemLineInput {
  product: Product
  pointsEach: number
  pointsTotal: number
}

export interface Quote {
  lines: QuoteLine[]
  bonuses: BonusLine[]
  hints: QuoteHint[]
  redeems: RedeemLine[]
  /** Puntos Venado Money que consume este pedido. */
  pointsCost: number
  gross: number
  net: number
  /** IVA 13 % incluido en el neto (informativo). */
  iva: number
  itemCount: number
}

const IVA = 0.13

export function unitsPer(product: Product, unit: CartUnit): number {
  return unit === "caja" ? (parsePackaging(product.packaging)?.units ?? 1) : 1
}

export function quoteCart(input: CartLineInput[], redeemInput: RedeemLineInput[] = []): Quote {
  const byId = new Map(products.map((p) => [p.id, p]))
  const lines: QuoteLine[] = []
  const bonuses: BonusLine[] = []
  const hints: QuoteHint[] = []

  // Unidades totales por producto (sumando líneas en unidad y en caja) — las escalas se evalúan
  // sobre el total del producto, no por línea.
  const unitsByProduct = new Map<string, number>()
  for (const l of input) {
    const p = byId.get(l.productId)
    if (!p) continue
    unitsByProduct.set(p.id, (unitsByProduct.get(p.id) ?? 0) + l.quantity * unitsPer(p, l.unit))
  }

  for (const l of input) {
    const product = byId.get(l.productId)
    if (!product) continue
    const units = l.quantity * unitsPer(product, l.unit)
    const unitPrice = mockPrice(product)
    const gross = unitPrice * units
    const rulesApplied: string[] = []
    lines.push({
      ...l,
      product,
      units,
      unitPrice,
      itemPrice: unitPrice * unitsPer(product, l.unit),
      gross: round2(gross),
      net: round2(gross),
      rulesApplied,
    })
  }

  for (const [productId, units] of unitsByProduct) {
    const product = byId.get(productId)!
    for (const r of RULES) {
      if (!r.bonusQty) continue
      if (!r.productIds.includes(productId)) continue
      const bonusProduct = r.bonusProductId ? byId.get(r.bonusProductId) : product
      if (!bonusProduct) continue
      const reward =
        bonusProduct.id === product.id
          ? `${r.bonusQty} ${bonusProduct.name} gratis`
          : `${r.bonusQty} ${bonusProduct.name} ${bonusProduct.size ?? ""} gratis`.replace(/\s+/g, " ")

      if (r.every) {
        const times = Math.floor(units / r.every)
        if (times > 0) {
          bonuses.push({ product: bonusProduct, quantity: times * r.bonusQty, ruleId: r.id, triggeredBy: product })
        }
        const rest = units % r.every
        if (rest > 0 && r.hintWindow && rest >= r.every - r.hintWindow) {
          hints.push({ product, missingUnits: r.every - rest, ruleId: r.id, reward })
        }
      } else if (r.minUnits) {
        if (units >= r.minUnits) {
          bonuses.push({ product: bonusProduct, quantity: r.bonusQty, ruleId: r.id, triggeredBy: product })
        } else if (r.hintWindow && units >= r.minUnits - r.hintWindow) {
          hints.push({ product, missingUnits: r.minUnits - units, ruleId: r.id, reward })
        }
      }
    }
  }

  const redeems: RedeemLine[] = []
  for (const r of redeemInput) {
    const redeemable = redeemableFor(r.productId)
    if (!redeemable || r.quantity <= 0) continue
    redeems.push({ ...r, product: redeemable.product, pointsEach: redeemable.points, pointsTotal: redeemable.points * r.quantity })
  }
  const pointsCost = redeems.reduce((a, r) => a + r.pointsTotal, 0)

  const gross = round2(lines.reduce((a, l) => a + l.gross, 0))
  const net = gross
  const iva = round2(net - net / (1 + IVA))
  const itemCount = input.reduce((a, l) => a + l.quantity, 0) + redeems.reduce((a, r) => a + r.quantity, 0)

  return { lines, bonuses, hints, redeems, pointsCost, gross, net, iva, itemCount }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
