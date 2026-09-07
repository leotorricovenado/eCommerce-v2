import { Check, Coins, Sparkles } from "lucide-react"

import { TIER_ICON, TIER_TONE, formatPts } from "@/components/money/PointsUI"
import { TIERS } from "@/data/venadoMoney"
import { cn } from "@/lib/utils"
import { usePoints } from "@/state/points"

export function Tiers() {
  const { lifetime, tier, progress } = usePoints()
  const CurrentIcon = TIER_ICON[tier.key]

  return (
    <div className="flex flex-col gap-6 px-4 pt-3 pb-8">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-money-foreground uppercase">
          <Coins className="size-3.5" strokeWidth={2.5} />
          Venado Money
        </span>
        <h1 className="text-2xl leading-none">Niveles y beneficios</h1>
      </div>

      {/* Nivel actual + progreso */}
      <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 ring-1 ring-foreground/5">
        <div className="flex items-center gap-4">
          <span className={cn("flex size-16 shrink-0 items-center justify-center rounded-full", TIER_TONE[tier.key])}>
            <CurrentIcon className="size-8" strokeWidth={2} />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Tu nivel actual</span>
            <span className="cn-font-heading text-2xl leading-none">{tier.label}</span>
            <span className="mt-1 text-xs text-muted-foreground">{formatPts(lifetime)} acumulados</span>
          </div>
        </div>
        {progress.next ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span>{tier.label}</span>
              <span>{progress.next.label}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-money to-warning transition-all duration-700" style={{ width: `${progress.pct * 100}%` }} />
            </div>
            <p className="text-center text-sm">
              ¡Te faltan <strong>{formatPts(progress.missing)}</strong> para llegar a {progress.next.label}!
            </p>
          </div>
        ) : (
          <p className="text-center text-sm font-semibold">¡Estás en el nivel máximo!</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-xl">Subí de nivel y ganá más</h2>
        <p className="text-sm text-muted-foreground">Los niveles se calculan con tus puntos acumulados, no con el saldo.</p>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pt-1 pb-3">
        {TIERS.map((t) => {
          const Icon = TIER_ICON[t.key]
          const active = t.key === tier.key
          return (
            <div
              key={t.key}
              className={cn(
                "flex w-44 shrink-0 snap-start flex-col gap-3 rounded-3xl p-4 ring-2 transition-all",
                active ? "bg-card ring-money shadow-lg shadow-money/20" : "bg-card ring-foreground/5"
              )}
            >
              <span className={cn("flex size-12 items-center justify-center rounded-full", TIER_TONE[t.key])}>
                <Icon className="size-6" strokeWidth={2} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Nivel</span>
                <span className="cn-font-heading text-xl leading-none">{t.label}</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {t.min.toLocaleString("es-BO")}
                  {t.max ? ` – ${t.max.toLocaleString("es-BO")}` : "+"} pts
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[12px] font-semibold">
                <Sparkles className="size-3.5 text-money-foreground" strokeWidth={2.5} />
                {t.benefit}
              </span>
              {active && (
                <span className="flex w-fit items-center gap-1 rounded-full bg-money/20 px-2 py-0.5 text-[10px] font-bold text-money-foreground">
                  <Check className="size-3" strokeWidth={3} /> Tu nivel
                </span>
              )}
            </div>
          )
        })}
      </div>

      <section className="flex flex-col gap-3 rounded-3xl bg-money/10 p-4 ring-1 ring-money/20">
        <h2 className="text-base">Beneficios que crecen con vos</h2>
        <ul className="flex flex-col gap-2 text-[13px]">
          {TIERS.map((t) => (
            <li key={t.key} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} />
              <span>
                <strong>{t.label}:</strong> {t.benefit}
                {t.multiplier !== 1 && ` (×${t.multiplier} sobre los puntos de cada objetivo)`}.
              </span>
            </li>
          ))}
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} />
            <span>Todos los niveles canjean productos del catálogo Venado Money dentro de su próximo pedido.</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
