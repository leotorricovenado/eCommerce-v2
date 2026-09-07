import { Check, Coins, Info, Target } from "lucide-react"

import { GoalCard } from "@/components/money/GoalUI"
import { goalStatuses } from "@/data/venadoMoney"
import { usePoints } from "@/state/points"

/**
 * "Tus objetivos": todo lo que el cliente puede cumplir para ganar puntos. En real la lista llega
 * del microservicio de estrategias de DEAL, por cliente y con el progreso ya calculado; acá sale
 * de `EARN_STRATEGIES` + el progreso de `PointsProvider`.
 *
 * El cliente es agnóstico al tipo de estrategia (ticket promedio / penetración): todo se presenta
 * igual — meta, progreso y premio.
 */
export function Goals() {
  const { tier, goals } = usePoints()
  const statuses = goalStatuses(goals)
  const active = statuses.filter((g) => !g.done)
  const done = statuses.filter((g) => g.done)

  return (
    <div className="flex flex-col gap-6 px-4 pt-3 pb-8">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-money-foreground uppercase">
          <Coins className="size-3.5" strokeWidth={2.5} />
          Venado Money
        </span>
        <h1 className="text-2xl leading-none">Tus objetivos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada objetivo tiene una meta y un premio en puntos. Se cumplen sumando todas tus compras:
          no hace falta llegar en un solo pedido.
        </p>
      </div>

      {tier.multiplier > 1 && (
        <div className="flex items-center gap-3 rounded-2xl bg-money/15 px-4 py-3 ring-1 ring-money/30">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-money text-money-foreground">
            <Coins className="size-4" strokeWidth={2.5} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-[13px] font-semibold">
              Tu nivel {tier.label} multiplica ×{tier.multiplier}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Se aplica sobre los puntos de cada objetivo que cumplas.
            </span>
          </span>
        </div>
      )}

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-1.5 text-base">
            <Target className="size-4 text-money-foreground" strokeWidth={2.5} />
            En curso
          </h2>
          {active.map((status) => (
            <GoalCard key={status.strategy.id} status={status} multiplier={tier.multiplier} />
          ))}
        </section>
      )}

      {done.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-1.5 text-base">
            <Check className="size-4 text-success" strokeWidth={3} />
            Cumplidos
          </h2>
          {done.map((status) => (
            <GoalCard key={status.strategy.id} status={status} multiplier={tier.multiplier} />
          ))}
        </section>
      )}

      <div className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Info className="size-4" />
        </span>
        <p className="text-[13px] leading-snug text-muted-foreground">
          Los objetivos cambian cada tanto y son distintos para cada negocio. Te avisamos por
          WhatsApp cuando tengas objetivos nuevos o estés por cumplir alguno.
        </p>
      </div>
    </div>
  )
}
