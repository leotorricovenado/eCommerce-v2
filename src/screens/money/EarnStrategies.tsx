import { Coins, Info, Layers, Package, ShoppingBag, Tag } from "lucide-react"
import { Link } from "react-router"

import { ProductThumb } from "@/components/checkout/OrderLines"
import { formatPts } from "@/components/money/PointsUI"
import {
  EARN_STRATEGIES,
  scopeLabel,
  scopeLink,
  scopeSampleProduct,
  type EarnStrategy,
} from "@/data/venadoMoney"
import { cn } from "@/lib/utils"
import { usePoints } from "@/state/points"

const SCOPE_ICON = {
  product: Package,
  brand: Tag,
  subcategory: Layers,
  category: ShoppingBag,
} as const

/**
 * "Cómo sumar puntos": la lista completa de estrategias vigentes. En real llega del microservicio
 * de estrategias de DEAL (por cliente); acá sale de `EARN_STRATEGIES`.
 */
export function EarnStrategies() {
  const { tier } = usePoints()

  return (
    <div className="flex flex-col gap-5 px-4 pt-3 pb-8">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-money-foreground uppercase">
          <Coins className="size-3.5" strokeWidth={2.5} />
          Venado Money
        </span>
        <h1 className="text-2xl leading-none">Cómo sumar puntos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los puntos se ganan por los productos que comprás, no por el monto del pedido.
        </p>
      </div>

      {tier.multiplier > 1 && (
        <div className="flex items-center gap-3 rounded-2xl bg-money/15 px-4 py-3 ring-1 ring-money/30">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-money text-money-foreground">
            <Coins className="size-4" strokeWidth={2.5} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-[13px] font-semibold">Tu nivel {tier.label} multiplica ×{tier.multiplier}</span>
            <span className="text-[11px] text-muted-foreground">
              Se aplica sobre los puntos de cada estrategia de abajo.
            </span>
          </span>
        </div>
      )}

      <section className="flex flex-col gap-3">
        {EARN_STRATEGIES.map((s) => (
          <StrategyCard key={s.id} strategy={s} multiplier={tier.multiplier} />
        ))}
      </section>

      <div className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Info className="size-4" />
        </span>
        <p className="text-[13px] leading-snug text-muted-foreground">
          Las estrategias cambian cada tanto y pueden ser distintas para cada negocio. Te avisamos por
          WhatsApp cuando haya nuevas formas de sumar.
        </p>
      </div>
    </div>
  )
}

function StrategyCard({ strategy, multiplier }: { strategy: EarnStrategy; multiplier: number }) {
  const sample = scopeSampleProduct(strategy)
  const Icon = SCOPE_ICON[strategy.scope.kind]
  const withTier = Math.floor(strategy.points * multiplier)

  return (
    <Link
      to={scopeLink(strategy)}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-card p-4 ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span className="pointer-events-none absolute -top-12 -right-10 size-32 rounded-full bg-money/10" />
      <div className="relative z-10 flex items-center gap-3">
        {sample && <ProductThumb product={sample} className="size-16" />}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            <Icon className="size-3" strokeWidth={2.5} />
            {scopeLabel(strategy)}
          </span>
          <span className="truncate text-sm font-bold">{strategy.name}</span>
          <span className="text-[11px] text-muted-foreground">
            Cada {strategy.every} unidades compradas
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between rounded-2xl bg-money-foreground px-3 py-2 text-card">
        <span className="text-[11px] font-semibold opacity-85">Sumás</span>
        <span className="flex items-baseline gap-1.5">
          <span className="cn-font-heading text-lg leading-none text-money">+{formatPts(withTier)}</span>
          {multiplier > 1 && (
            <span className="text-[10px] opacity-70 line-through">{strategy.points} pts</span>
          )}
        </span>
      </div>
    </Link>
  )
}

export { SCOPE_ICON }

/** Chip compacto reutilizable (por si otra pantalla necesita mostrar el alcance). */
export function ScopeChip({ strategy, className }: { strategy: EarnStrategy; className?: string }) {
  const Icon = SCOPE_ICON[strategy.scope.kind]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-money/15 px-2 py-0.5 text-[10px] font-bold text-money-foreground", className)}>
      <Icon className="size-3" strokeWidth={2.5} />
      {scopeLabel(strategy)}
    </span>
  )
}
