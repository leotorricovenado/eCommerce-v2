import { ChevronRight, Coins } from "lucide-react"
import { Link } from "react-router"

import { ProductThumb } from "@/components/checkout/OrderLines"
import { EARN_STRATEGIES, scopeLabel, scopeLink, scopeSampleProduct, type EarnStrategy } from "@/data/venadoMoney"
import { cn } from "@/lib/utils"

/**
 * "Productos que suman puntos": la lista de estrategias vigentes tal como la vería el cliente.
 * Cada fila = alcance (producto / marca / subfamilia / categoría) + regla "cada X unidades → N pts".
 */
export function EarnStrategyList({ strategies = EARN_STRATEGIES, compact }: { strategies?: EarnStrategy[]; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {strategies.map((s) => {
        const sample = scopeSampleProduct(s)
        return (
          <Link
            key={s.id}
            to={scopeLink(s)}
            className={cn(
              "flex items-center gap-3 rounded-3xl bg-card ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-md",
              compact ? "p-2.5" : "p-3"
            )}
          >
            {sample && <ProductThumb product={sample} className={compact ? "size-12" : "size-14"} />}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{scopeLabel(s)}</span>
              <span className="truncate text-sm font-semibold">{s.name}</span>
              <span className="text-[11px] text-muted-foreground">
                Cada {s.every} unidades
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-money px-2.5 py-1 text-xs font-bold text-money-foreground shadow-sm">
              <Coins className="size-3.5" strokeWidth={2.5} />+{s.points} pts
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        )
      })}
    </div>
  )
}
