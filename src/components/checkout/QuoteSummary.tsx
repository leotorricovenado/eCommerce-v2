import { Coins, Gift } from "lucide-react"

import type { Quote } from "@/data/priceRules"
import { formatBs } from "@/lib/format"
import { cn } from "@/lib/utils"

interface QuoteSummaryProps {
  quote: Quote
  /** Etiqueta de la última fila: "Total a pagar" (carrito/pago) o "Total pagado" (pedido). */
  totalLabel?: string
  /** Venado Money: puntos que suma este pedido (ya calculados con el nivel del cliente). */
  pointsEarned?: number
  /** Venado Money: puntos usados en canjes (default: los de la cotización). */
  pointsUsed?: number
  className?: string
}

/**
 * Resumen económico. Solo muestra EFECTOS de las reglas de precio (descuento, bonificación) —
 * nunca el nombre de la lista de precios ni de la regla (decisión del usuario 2026-09-02).
 */
export function QuoteSummary({ quote, totalLabel = "Total a pagar", pointsEarned, pointsUsed, className }: QuoteSummaryProps) {
  const bonusUnits = quote.bonuses.reduce((a, b) => a + b.quantity, 0)
  const used = pointsUsed ?? quote.pointsCost
  return (
    <div className={cn("flex flex-col gap-2 rounded-3xl bg-card p-4 ring-1 ring-foreground/5", className)}>
      <Row label="Subtotal" value={formatBs(quote.gross)} />
      {quote.discount > 0 && <Row label="Descuentos" value={`- ${formatBs(quote.discount)}`} tone="success" />}
      {bonusUnits > 0 && (
        <Row
          label={
            <span className="flex items-center gap-1.5">
              <Gift className="size-3.5" strokeWidth={2.25} />
              Bonificación
            </span>
          }
          value={`${bonusUnits} ${bonusUnits === 1 ? "producto gratis" : "productos gratis"}`}
          tone="success"
        />
      )}
      {used > 0 && (
        <Row
          label={
            <span className="flex items-center gap-1.5">
              <Coins className="size-3.5" strokeWidth={2.25} />
              Canje con puntos
            </span>
          }
          value={`− ${used.toLocaleString("es-BO")} pts`}
          tone="money"
        />
      )}
      <Row label="Envío a tu negocio" value="Sin cargo" muted />
      <div className="my-1 h-px bg-foreground/5" />
      <div className="flex items-end justify-between">
        <span className="cn-font-heading text-sm">{totalLabel}</span>
        <span className="cn-font-heading text-2xl leading-none">{formatBs(quote.net)}</span>
      </div>
      {pointsEarned !== undefined && pointsEarned > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-money/15 px-3 py-2 text-xs font-semibold text-money-foreground">
          <span className="flex items-center gap-1.5">
            <Coins className="size-3.5" strokeWidth={2.5} />
            {totalLabel === "Total pagado" ? "Este pedido te dio" : "Este pedido te suma"}
          </span>
          <span className="tabular-nums">+{pointsEarned.toLocaleString("es-BO")} pts</span>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">
        Incluye IVA 13 % ({formatBs(quote.iva)}). Precios y stock se confirman al reservar.
      </p>
    </div>
  )
}

function Row({
  label,
  value,
  tone,
  muted,
}: {
  label: React.ReactNode
  value: string
  tone?: "success" | "money"
  muted?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm",
        tone === "success" && "font-semibold text-success",
        tone === "money" && "font-semibold text-money-foreground",
        muted && "text-muted-foreground"
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
