import { Plus, Sparkles } from "lucide-react"

import type { QuoteHint } from "@/data/priceRules"
import type { Product } from "@/data/products"
import { cn } from "@/lib/utils"

interface Nudge {
  key: string
  product: Product
  missingUnits: number
  /** Qué se lleva el cliente al completar (bonificación de las reglas de precio). */
  rewards: { text: string }[]
}

/**
 * Avisos "te faltan N unidades de X y te llevás Y gratis" de las reglas de precio. Los objetivos
 * de Venado Money NO entran acá: su meta es de alcance (marca/categoría) y en Bs o unidades, así
 * que tienen su propio bloque con barra de progreso (`CartGoals`). Si hay más de un aviso van en
 * un rail horizontal para no empujar los productos fuera de la pantalla.
 */
function buildNudges(bonusHints: QuoteHint[]): Nudge[] {
  const byKey = new Map<string, Nudge>()
  for (const h of bonusHints) {
    const key = `${h.product.id}-${h.missingUnits}`
    const existing = byKey.get(key)
    if (existing) {
      existing.rewards.push({ text: h.reward })
      continue
    }
    byKey.set(key, { key, product: h.product, missingUnits: h.missingUnits, rewards: [{ text: h.reward }] })
  }
  return [...byKey.values()].sort((a, b) => a.missingUnits - b.missingUnits)
}

interface CartNudgesProps {
  bonusHints: QuoteHint[]
  onAdd: (productId: string, units: number) => void
}

export function CartNudges({ bonusHints, onAdd }: CartNudgesProps) {
  const nudges = buildNudges(bonusHints)
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
        return (
          <div
            key={n.key}
            className={cn(
              "flex items-center gap-3 rounded-2xl p-3 ring-1",
              single ? "w-full" : "w-[85%] shrink-0 snap-start sm:w-80",
              "bg-gradient-to-r from-warning/25 to-warning/10 ring-warning/40"
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-warning shadow-sm">
              <Sparkles className="size-4" strokeWidth={2.25} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="line-clamp-2 text-[13px] leading-snug font-semibold">
                Te faltan {n.missingUnits} {n.missingUnits === 1 ? "unidad" : "unidades"} de{" "}
                {n.product.name}
              </span>
              <span className="line-clamp-2 text-[11px] text-muted-foreground">
                y te llevás {n.rewards.map((r) => r.text).join(" + ")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onAdd(n.product.id, n.missingUnits)}
              className="flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-foreground px-3 text-xs font-bold text-background shadow-md active:scale-95"
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
