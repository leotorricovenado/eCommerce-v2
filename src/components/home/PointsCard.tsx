import { ChevronRight, Coins, Gift } from "lucide-react"
import { Link } from "react-router"

import { ProgressRing, TierBadge, formatPts } from "@/components/money/PointsUI"
import { usePoints } from "@/state/points"

/** Card de Venado Money para el Home: saldo, nivel, progreso y acceso al canje. */
export function PointsCard() {
  const { balance, tier, progress } = usePoints()
  return (
    <Link
      to="/puntos"
      className="group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-money via-money to-warning p-4 text-money-foreground shadow-lg shadow-money/25 transition-all hover:-translate-y-0.5"
    >
      <span className="pointer-events-none absolute -top-10 right-24 size-32 rounded-full bg-card/20" />
      <ProgressRing value={progress.pct} size={64} stroke={7} className="relative z-10 text-money-foreground">
        <span className="cn-font-heading text-sm leading-none">{Math.round(progress.pct * 100)}%</span>
      </ProgressRing>
      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase opacity-80">
          <Coins className="size-3" strokeWidth={2.5} />
          Venado Money
        </span>
        <span className="cn-font-heading text-2xl leading-none tabular-nums">{formatPts(balance)}</span>
        <span className="flex items-center gap-2 text-[11px]">
          <TierBadge tier={tier} className="bg-card/70 px-2 py-0.5" />
          {progress.next && <span className="truncate opacity-85">faltan {formatPts(progress.missing)} para {progress.next.label}</span>}
        </span>
      </div>
      <span className="relative z-10 flex shrink-0 items-center gap-1 rounded-full bg-money-foreground px-3 py-2 text-xs font-bold text-card shadow-md transition-all group-hover:gap-2">
        <Gift className="size-3.5" strokeWidth={2.5} />
        Canjear
        <ChevronRight className="size-3.5" />
      </span>
    </Link>
  )
}
