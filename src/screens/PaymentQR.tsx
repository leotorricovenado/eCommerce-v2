import { Check, Clock, Coins, Loader2, PackageCheck, ShieldCheck, Smartphone } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"

import { CheckoutSteps } from "@/components/checkout/CheckoutSteps"
import { OrderLines } from "@/components/checkout/OrderLines"
import { formatPts } from "@/components/money/PointsUI"
import { QRCodeMock } from "@/components/QRCodeMock"
import { deliveryPoints } from "@/data/customer"
import { pointsForNet } from "@/data/venadoMoney"
import { notifyOrderConfirmed } from "@/lib/botApi"
import { formatBs } from "@/lib/format"
import { formatShortDate } from "@/lib/dates"
import { useCountdown } from "@/lib/useCountdown"
import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"
import { useCheckout } from "@/state/checkout"
import { useOrders } from "@/state/order"
import { usePoints } from "@/state/points"
import { useSession } from "@/state/session"

type Phase = "waiting" | "paid" | "confirmed"

const RESERVATION_SECONDS = 10 * 60
// Simulación de la validación bancaria (en real: webhook Collections → Sales → evento SSE).
const SIMULATED_PAYMENT_MS = 6000
const SIMULATED_CONFIRM_MS = 1800

const PHASES: { key: Phase; label: string }[] = [
  { key: "waiting", label: "Esperando pago" },
  { key: "paid", label: "Pago recibido" },
  { key: "confirmed", label: "Pedido confirmado" },
]

export function PaymentQR() {
  const navigate = useNavigate()
  const { quote, clear } = useCart()
  const { deliveryPointId, deliveryDate } = useCheckout()
  const { placeOrder } = useOrders()
  const { phone } = useSession()
  const { tier, earn, redeem } = usePoints()
  const [phase, setPhase] = useState<Phase>("waiting")
  const { label, expired } = useCountdown(RESERVATION_SECONDS, phase === "waiting")
  const quoteRef = useRef(quote)
  const point = deliveryPoints.find((p) => p.id === deliveryPointId)!
  const empty = quote.lines.length === 0 && quote.redeems.length === 0
  // Pedido 100 % con puntos: no hay nada que cobrar, se confirma directo (sin QR ni banco).
  const onlyPoints = !empty && quote.net === 0 && quote.pointsCost > 0
  const pointsEarned = pointsForNet(quote.net, tier)

  useEffect(() => {
    if (empty && phase === "waiting") navigate("/carrito", { replace: true })
  }, [empty, phase, navigate])

  // Congela la cotización al entrar: el pedido se crea con estos precios aunque el carrito cambie.
  useEffect(() => {
    if (phase === "waiting" && !empty) quoteRef.current = quote
  }, [quote, phase, empty])

  // Simula la confirmación bancaria automática (solo cuando hay algo que cobrar).
  useEffect(() => {
    if (phase !== "waiting" || empty || expired || onlyPoints) return
    const t = window.setTimeout(() => setPhase("paid"), SIMULATED_PAYMENT_MS)
    return () => window.clearTimeout(t)
  }, [phase, empty, expired, onlyPoints])

  useEffect(() => {
    if (phase !== "paid") return
    const t = window.setTimeout(() => {
      const q = quoteRef.current
      const order = placeOrder({
        quote: q,
        deliveryPointId,
        deliveryDate,
        pointsEarned: pointsForNet(q.net, tier),
        pointsUsed: q.pointsCost,
      })
      // Venado Money: se acreditan los puntos ganados y se debitan los canjeados al confirmar.
      earn(order.pointsEarned, order.id)
      redeem(order.pointsUsed, order.id)
      // Atajo de demo heredado de la v1: el bot le manda al cliente el WhatsApp de confirmación.
      if (phone) void notifyOrderConfirmed({ phone, orderNumber: String(order.id), total: order.quote.net })
      setPhase("confirmed")
      clear()
      navigate(`/pedido/${order.id}`, { replace: true })
    }, SIMULATED_CONFIRM_MS)
    return () => window.clearTimeout(t)
  }, [phase, placeOrder, deliveryPointId, deliveryDate, clear, navigate, phone, tier, earn, redeem])

  const phaseIndex = PHASES.findIndex((p) => p.key === phase)
  const seed = `${quote.net}-${deliveryPointId}-${deliveryDate.toDateString()}`

  return (
    <div className="flex flex-col gap-5 px-4 pt-2 pb-28">
      <div className="flex flex-col gap-2">
        <CheckoutSteps current={3} />
        <h1 className="text-2xl leading-tight">{onlyPoints ? "Confirmá tu canje" : "Pagá con QR"}</h1>
      </div>

      {/* Reserva */}
      <div className="flex items-center gap-3 rounded-2xl bg-success/10 px-3 py-2.5 ring-1 ring-success/20">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-primary-foreground">
          <PackageCheck className="size-4" strokeWidth={2.25} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-[13px] font-semibold">Stock reservado</span>
          <span className="text-[11px] text-muted-foreground">
            Tu pedido está separado en almacén. Entrega {formatShortDate(deliveryDate)} en {point.address}.
          </span>
        </div>
      </div>

      <div className="sm:grid sm:grid-cols-2 sm:gap-5">
        {/* QR o confirmación de canje */}
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-card p-5 ring-1 ring-foreground/5">
          {onlyPoints ? (
            <>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Canje con puntos</span>
              <span className="cn-font-heading text-4xl leading-none tabular-nums text-money-foreground">
                {quote.pointsCost.toLocaleString("es-BO")} pts
              </span>
              <span className="flex size-24 items-center justify-center rounded-full bg-money/15 text-money-foreground">
                {phase === "waiting" ? <Coins className="size-12" strokeWidth={1.75} /> : <Check className="size-12" strokeWidth={3} />}
              </span>
              <p className="text-center text-xs text-muted-foreground">
                No hay nada que pagar: este pedido se cubre 100 % con tus puntos Venado Money.
              </p>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Monto a pagar</span>
              <span className="cn-font-heading text-4xl leading-none tabular-nums">{formatBs(quote.net)}</span>

              <div
                className={cn(
                  "relative mt-1 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15 p-3 transition-all",
                  phase !== "waiting" && "opacity-40 grayscale"
                )}
              >
                <QRCodeMock seed={seed} size={200} className="rounded-2xl" />
                {phase !== "waiting" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-success text-primary-foreground shadow-lg">
                      <Check className="size-8" strokeWidth={3} />
                    </span>
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold",
                  expired && phase === "waiting" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                )}
              >
                <Clock className="size-3.5" />
                {phase === "waiting" ? (expired ? "La reserva expiró" : `Reserva válida por ${label}`) : "Pago validado"}
              </div>

              <p className="flex items-center gap-1.5 text-center text-xs text-muted-foreground">
                <Smartphone className="size-3.5 shrink-0" />
                Escaneá con la app de tu banco o billetera.
              </p>
            </>
          )}

          {(pointsEarned > 0 || quote.pointsCost > 0) && (
            <div className="flex w-full items-center justify-between rounded-2xl bg-money/15 px-3 py-2 text-xs font-semibold text-money-foreground">
              <span className="flex items-center gap-1.5">
                <Coins className="size-3.5" strokeWidth={2.5} />
                Venado Money
              </span>
              <span className="tabular-nums">
                {pointsEarned > 0 && `+${formatPts(pointsEarned)}`}
                {pointsEarned > 0 && quote.pointsCost > 0 && " · "}
                {quote.pointsCost > 0 && `−${formatPts(quote.pointsCost)}`}
              </span>
            </div>
          )}
        </div>

        {/* Estado + resumen */}
        <div className="mt-5 flex flex-col gap-4 sm:mt-0">
          {!onlyPoints && (
            <ol className="flex flex-col gap-2 rounded-3xl bg-card p-4 ring-1 ring-foreground/5">
              {PHASES.map((p, i) => {
                const done = i < phaseIndex
                const current = i === phaseIndex
                return (
                  <li key={p.key} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full ring-2 transition-colors",
                        done && "bg-success text-primary-foreground ring-success",
                        current && "bg-primary text-primary-foreground ring-primary",
                        !done && !current && "bg-card ring-foreground/10"
                      )}
                    >
                      {done ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : current ? (
                        <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
                      ) : (
                        <span className="size-1.5 rounded-full bg-foreground/20" />
                      )}
                    </span>
                    <span className={cn("text-sm", current ? "font-bold" : done ? "font-medium" : "text-muted-foreground")}>
                      {p.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}

          <div className="rounded-3xl bg-card p-4 ring-1 ring-foreground/5">
            <h2 className="mb-3 text-sm">Resumen del pedido</h2>
            <OrderLines quote={quote} />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" />
            {onlyPoints ? "Tus puntos se descuentan recién al confirmar." : "Pago procesado por tu banco. Nunca guardamos datos de tu cuenta."}
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 pt-2 pb-4">
          <button
            type="button"
            onClick={() => navigate("/carrito")}
            disabled={phase !== "waiting"}
            className="h-11 cursor-pointer rounded-full px-4 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            Cancelar y volver al carrito
          </button>
          {phase === "waiting" && !expired && (
            onlyPoints ? (
              <button
                type="button"
                onClick={() => setPhase("paid")}
                className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-money text-sm font-bold text-money-foreground shadow-lg shadow-money/30 transition-all active:scale-[0.98]"
              >
                <Coins className="size-4" strokeWidth={2.5} />
                Confirmar canje · {formatPts(quote.pointsCost)}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPhase("paid")}
                className="h-11 cursor-pointer rounded-full bg-card px-4 text-xs font-semibold text-muted-foreground ring-1 ring-foreground/10 transition-all hover:text-foreground active:scale-95"
                title="Solo para la demo: simula la confirmación del banco"
              >
                Simular pago
              </button>
            )
          )}
          {phase !== "waiting" && onlyPoints && (
            <span className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-success text-sm font-bold text-primary-foreground">
              <Check className="size-4" strokeWidth={3} />
              Canje confirmado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
