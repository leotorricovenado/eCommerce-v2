import { Coins, Plus, Sparkles } from "lucide-react"

import type { QuoteHint } from "@/data/priceRules"
import type { EarnHint } from "@/data/venadoMoney"
import type { Product } from "@/data/products"
import { cn } from "@/lib/utils"

interface Nudge {
  key: string
  product: Product
  missingUnits: number
  /** Qué gana el cliente al completar; puede combinar bonificación + puntos. */
  rewards: { kind: "bonus" | "points"; text: string }[]
}

/**
 * Consolida los avisos "te faltan N unidades" de bonificaciones y de estrategias de puntos.
 * Cuando ambos apuntan al mismo producto con la misma cantidad faltante se fusionan en una sola
 * tarjeta, y si queda más de una se muestran en un rail horizontal para no empujar los productos
 * fuera de la pantalla.
 */
function buildNudges(bonusHints: QuoteHint[], earnHints: EarnHint[]): Nudge[] {
  const byKey = new Map<string, Nudge>()
  const push = (product: Product, missingUnits: number, reward: Nudge["rewards"][number]) => {
    const key = `${product.id}-${missingUnits}`
    const existing = byKey.get(key)
    if (existing) {
      existing.rewards.push(reward)
      return
    }
    byKey.set(key, { key, product, missingUnits, rewards: [reward] })
  }
  for (const h of bonusHints) push(h.product, h.missingUnits, { kind: "bonus", text: h.reward })
  for (const h of earnHints) {
    push(h.product, h.missingUnits, { kind: "points", text: `${h.strategy.points} puntos Venado Money` })
  }
  return [...byKey.values()].sort((a, b) => a.missingUnits - b.missingUnits)
}

interface CartNudgesProps {
  bonusHints: QuoteHint[]
  earnHints: EarnHint[]
  onAdd: (productId: string, units: number) => void
}

export function CartNudges({ bonusHints, earnHints, onAdd }: CartNudgesProps) {
  const nudges = buildNudges(bonusHints, earnHints)
  if (nudges.length === 0) return null
  const single = nudges.length === 1

  return (
    <div
      className={cn(
        "flex gap-2",
        !single && "no-scrollbar -mx-4 snap-x overflow-x-auto px-4 pb-1"
      )}
    >
      {nudges.map((n) => {
        const hasPoints = n.rewards.some((r) => r.kind === "points")
        const hasBonus = n.rewards.some((r) => r.kind === "bonus")
        // Bonificación manda el color (verde/ámbar de regalo); si es solo puntos, va en ámbar money.
        const tone = hasBonus ? "warning" : "money"
        return (
          <div
            key={n.key}
            className={cn(
              "flex items-center gap-3 rounded-2xl p-3 ring-1",
              single ? "w-full" : "w-[85%] shrink-0 snap-start sm:w-80",
              tone === "warning"
                ? "bg-gradient-to-r from-warning/25 to-warning/10 ring-warning/40"
                : "bg-money/15 ring-money/40"
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full shadow-sm",
                tone === "warning" ? "bg-card text-warning" : "bg-money text-money-foreground"
              )}
            >
              {tone === "warning" ? (
                <Sparkles className="size-4" strokeWidth={2.25} />
              ) : (
                <Coins className="size-4" strokeWidth={2.25} />
              )}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="line-clamp-2 text-[13px] leading-snug font-semibold">
                Te faltan {n.missingUnits} {n.missingUnits === 1 ? "unidad" : "unidades"} de{" "}
                {n.product.name}
              </span>
              <span className="line-clamp-2 text-[11px] text-muted-foreground">
                y {hasPoints && hasBonus ? "te llevás" : hasBonus ? "te llevás" : "sumás"}{" "}
                {n.rewards.map((r) => r.text).join(" + ")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onAdd(n.product.id, n.missingUnits)}
              className={cn(
                "flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-bold shadow-md active:scale-95",
                tone === "warning" ? "bg-foreground text-background" : "bg-money-foreground text-card"
              )}
            >
              <Plus className="size-3.5" strokeWidth={3} />
              {n.missingUnits}
            </button>
          </div>
        )
      })}
    </div>
  )
}
