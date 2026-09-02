import { CalendarDays, Check, Clock, MapPin, Phone, ShieldCheck } from "lucide-react"
import { useEffect } from "react"
import { useNavigate } from "react-router"

import { CheckoutSteps } from "@/components/checkout/CheckoutSteps"
import { customer, deliveryPoints } from "@/data/customer"
import { formatBs } from "@/lib/format"
import { formatLongDate } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"
import { useCheckout } from "@/state/checkout"

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]

export function DeliverySchedule() {
  const navigate = useNavigate()
  const { quote } = useCart()
  const { deliveryPointId, setDeliveryPointId, deliveryDate, setDeliveryDate, availableDates } =
    useCheckout()

  useEffect(() => {
    if (quote.lines.length === 0) navigate("/carrito", { replace: true })
  }, [quote.lines.length, navigate])

  const point = deliveryPoints.find((p) => p.id === deliveryPointId)!

  return (
    <div className="flex flex-col gap-6 px-4 pt-2 pb-32">
      <div className="flex flex-col gap-2">
        <CheckoutSteps current={2} />
        <h1 className="text-2xl leading-tight">¿Dónde y cuándo lo recibís?</h1>
        <p className="text-sm text-muted-foreground">
          Entregamos en tus puntos registrados, los días habilitados para tu zona.
        </p>
      </div>

      {/* Punto de entrega */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base">Punto de entrega</h2>
          <span className="text-[11px] font-semibold text-muted-foreground">{customer.businessName}</span>
        </div>
        <div className="flex flex-col gap-2">
          {deliveryPoints.map((p) => {
            const active = p.id === deliveryPointId
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => setDeliveryPointId(p.id)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-3xl p-4 text-left ring-2 transition-all active:scale-[0.99]",
                  active ? "bg-primary/5 ring-primary shadow-md shadow-primary/10" : "bg-card ring-foreground/5 hover:ring-primary/30"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}
                >
                  <MapPin className="size-5" strokeWidth={2} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-bold">{p.address}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.zone} · {p.city}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" /> {p.contact}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> Recibe {p.reception.from}–{p.reception.to}
                    </span>
                  </span>
                </div>
                <span
                  className={cn(
                    "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full ring-2",
                    active ? "bg-primary ring-primary" : "ring-foreground/20"
                  )}
                >
                  {active && <Check className="size-3 text-primary-foreground" strokeWidth={4} />}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Fecha */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col">
          <h2 className="text-base">Fecha de entrega</h2>
          <span className="text-xs text-muted-foreground">
            Tu zona recibe martes y jueves. Elegí el día que te convenga.
          </span>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pt-1 pb-1">
          {availableDates.map((d) => {
            const active = d.getTime() === deliveryDate.getTime()
            return (
              <button
                key={d.toISOString()}
                type="button"
                aria-pressed={active}
                onClick={() => setDeliveryDate(d)}
                className={cn(
                  "flex w-20 shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-3xl py-3 ring-2 transition-all active:scale-95",
                  active
                    ? "bg-primary text-primary-foreground ring-primary shadow-md shadow-primary/25"
                    : "bg-card ring-foreground/5 hover:ring-primary/30"
                )}
              >
                <span className={cn("text-[11px] font-semibold uppercase", !active && "text-muted-foreground")}>
                  {WEEKDAYS[d.getDay()]}
                </span>
                <span className="cn-font-heading text-2xl leading-none">{d.getDate()}</span>
                <span className={cn("text-[11px] font-medium", !active && "text-muted-foreground")}>
                  {MONTHS[d.getMonth()]}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2.5 text-xs ring-1 ring-foreground/5">
          <CalendarDays className="size-4 shrink-0 text-primary" />
          <span>
            Llega el <strong>{formatLongDate(deliveryDate)}</strong> a {point.address}, entre{" "}
            {point.reception.from} y {point.reception.to}.
          </span>
        </div>
      </section>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0" />
        Al confirmar se reserva el stock por 10 minutos para que pagues con QR.
      </div>

      {/* CTA sticky */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pt-2 pb-4">
          <div className="flex flex-col leading-none">
            <span className="text-[11px] text-muted-foreground">Total a pagar</span>
            <span className="cn-font-heading text-lg tabular-nums">{formatBs(quote.net)}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/checkout/pago")}
            className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            Confirmar y reservar
          </button>
        </div>
      </div>
    </div>
  )
}
