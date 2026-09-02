import { Award, Coins, Crown, Medal, type LucideIcon } from "lucide-react"

import type { Tier } from "@/data/venadoMoney"
import { cn } from "@/lib/utils"

export function formatPts(points: number): string {
  return `${points.toLocaleString("es-BO")} pts`
}

/** Pill ámbar con moneda: "520 pts". */
export function PointsPill({ points, className, size = "sm" }: { points: number; className?: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-money/15 font-bold text-money-foreground",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-sm",
        className
      )}
    >
      <Coins className={size === "sm" ? "size-3" : "size-4"} strokeWidth={2.5} />
      {formatPts(points)}
    </span>
  )
}

export const TIER_ICON: Record<Tier["key"], LucideIcon> = { bronce: Medal, plata: Award, oro: Crown }
export const TIER_TONE: Record<Tier["key"], string> = {
  bronce: "bg-[#c77b3a]/15 text-[#a35f22]",
  plata: "bg-foreground/10 text-foreground/70",
  oro: "bg-money/20 text-money-foreground",
}

export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  const Icon = TIER_ICON[tier.key]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
        TIER_TONE[tier.key],
        className
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.5} />
      Nivel {tier.label}
    </span>
  )
}

/** Anillo de progreso (0-1) con texto al centro. */
export function ProgressRing({
  value,
  size = 96,
  stroke = 9,
  className,
  children,
}: {
  value: number
  size?: number
  stroke?: number
  className?: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(1, Math.max(0, value))
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
