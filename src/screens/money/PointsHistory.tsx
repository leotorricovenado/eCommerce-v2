import { ArrowDownLeft, ArrowUpRight, CalendarClock, Coins } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { TierBadge, formatPts } from "@/components/money/PointsUI"
import { EXPIRY_MONTHS } from "@/data/venadoMoney"
import { formatDateTime, formatShortDate } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { usePoints, type MovementKind } from "@/state/points"

type Filter = "todos" | MovementKind

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "abono", label: "Abonos" },
  { key: "debito", label: "Débitos" },
]

function formatExpiry(d: Date): string {
  return d.toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "")
}

export function PointsHistory() {
  const { balance, lifetime, tier, movements, lots, nextExpiry } = usePoints()
  const [filter, setFilter] = useState<Filter>("todos")
  const list = filter === "todos" ? movements : movements.filter((m) => m.kind === filter)
  const earned = movements.filter((m) => m.kind === "abono").reduce((a, m) => a + m.points, 0)
  const spent = movements.filter((m) => m.kind === "debito").reduce((a, m) => a + m.points, 0)
  const lotById = new Map(lots.map((l) => [l.movementId, l]))
  const soon = new Date()
  soon.setDate(soon.getDate() + 60)
  const expiringSoon = lots.filter((l) => l.expiresAt <= soon).reduce((a, l) => a + l.remaining, 0)

  return (
    <div className="flex flex-col gap-5 px-4 pt-3 pb-8">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-money-foreground uppercase">
          <Coins className="size-3.5" strokeWidth={2.5} />
          Venado Money
        </span>
        <h1 className="text-2xl leading-none">Extracto de puntos</h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Disponibles" value={balance} tone="money" />
        <Stat label="Ganados" value={earned} tone="success" />
        <Stat label="Canjeados" value={spent} />
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-2.5 text-xs ring-1 ring-foreground/5">
        <span className="text-muted-foreground">
          Acumulado histórico <strong className="text-foreground">{formatPts(lifetime)}</strong>
        </span>
        <Link to="/puntos/niveles">
          <TierBadge tier={tier} />
        </Link>
      </div>

      {/* Vencimiento */}
      {nextExpiry && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl px-4 py-3 ring-1",
            expiringSoon > 0 ? "bg-accent/10 ring-accent/30" : "bg-money/10 ring-money/25"
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              expiringSoon > 0 ? "bg-accent text-accent-foreground" : "bg-money text-money-foreground"
            )}
          >
            <CalendarClock className="size-4" strokeWidth={2.25} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-[13px] font-semibold">
              Próximo vencimiento: {formatPts(nextExpiry.remaining)} el {formatExpiry(nextExpiry.expiresAt)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Los puntos vencen a los {EXPIRY_MONTHS} meses. Los canjes usan primero los más antiguos.
              {expiringSoon > 0 && ` Tenés ${formatPts(expiringSoon)} por vencer en los próximos 60 días.`}
            </span>
          </div>
          {expiringSoon > 0 && (
            <Link to="/puntos/canjear" className="shrink-0 text-xs font-bold text-accent">
              Canjear
            </Link>
          )}
        </div>
      )}

      <div className="flex rounded-full bg-muted p-1 text-xs font-semibold">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex-1 cursor-pointer rounded-full py-2 transition-all",
              filter === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Sin movimientos en este filtro.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-foreground/5 rounded-3xl bg-card ring-1 ring-foreground/5">
          {list.map((m) => {
            const lot = lotById.get(m.id)
            return (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    m.kind === "abono" ? "bg-success/15 text-success" : "bg-money/20 text-money-foreground"
                  )}
                >
                  {m.kind === "abono" ? <ArrowUpRight className="size-4" strokeWidth={2.5} /> : <ArrowDownLeft className="size-4" strokeWidth={2.5} />}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={`/pedido/${m.orderId}`} className="truncate text-sm font-semibold hover:text-primary">
                    {m.description}
                  </Link>
                  <span className="text-[11px] text-muted-foreground">
                    {m.kind === "abono" ? "Puntos por compra" : "Canje de productos"} · {formatDateTime(m.at)}
                  </span>
                  {m.kind === "abono" && (
                    <span className={cn("text-[11px]", lot ? "text-money-foreground" : "text-muted-foreground")}>
                      {lot
                        ? `${lot.remaining === lot.earned ? "Vencen" : `Quedan ${formatPts(lot.remaining)} · vencen`} el ${formatExpiry(lot.expiresAt)}`
                        : "Ya canjeados"}
                    </span>
                  )}
                </div>
                <span className={cn("cn-font-heading text-sm tabular-nums", m.kind === "abono" ? "text-success" : "text-money-foreground")}>
                  {m.kind === "abono" ? "+" : "−"}
                  {formatPts(m.points)}
                </span>
              </li>
            )
          })}
        </ol>
      )}
      <p className="text-center text-[11px] text-muted-foreground">
        Último movimiento {movements[0] ? formatShortDate(movements[0].at) : "—"}
      </p>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "money" | "success" }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl p-3 ring-1",
        tone === "money" ? "bg-money/15 ring-money/30" : tone === "success" ? "bg-success/10 ring-success/20" : "bg-card ring-foreground/5"
      )}
    >
      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{label}</span>
      <span className="cn-font-heading text-lg tabular-nums">{value.toLocaleString("es-BO")}</span>
    </div>
  )
}
