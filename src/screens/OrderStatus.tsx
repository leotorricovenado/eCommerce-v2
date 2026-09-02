import {
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  MapPin,
  Coins,
  MessageCircle,
  PackageSearch,
  RotateCcw,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"

import { OrderLines } from "@/components/checkout/OrderLines"
import { QuoteSummary } from "@/components/checkout/QuoteSummary"
import { customer, deliveryPoints } from "@/data/customer"
import { formatPts } from "@/components/money/PointsUI"
import { whatsAppChatHref } from "@/lib/botApi"
import { formatDateTime, formatLongDate } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"
import { ORDER_STEPS, useOrders } from "@/state/order"

export function OrderStatus() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrder } = useOrders()
  const { replaceAll } = useCart()
  const order = orderId ? getOrder(Number(orderId)) : undefined

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted">
          <PackageSearch className="size-6 text-muted-foreground" />
        </span>
        <h1 className="text-base">No encontramos ese pedido</h1>
        <p className="text-sm text-muted-foreground">
          Puede que se haya cerrado la sesión en la que lo hiciste.
        </p>
        <Link to="/" className="text-sm font-semibold text-primary">
          Ir al inicio
        </Link>
      </div>
    )
  }

  const point = deliveryPoints.find((p) => p.id === order.deliveryPointId)!
  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === order.status)
  const stepTime = (key: (typeof ORDER_STEPS)[number]["key"]) => order.history[key] ?? null
  const delivered = order.status === "delivered"
  const inRoute = order.status === "in_route"
  const heroTitle = delivered
    ? "¡Pedido entregado!"
    : inRoute
      ? "¡Tu pedido está en camino!"
      : "¡Tu pedido está confirmado!"
  const heroEyebrow = delivered ? "Entregado" : inRoute ? "En ruta" : "Pago recibido"
  const headline = order.history.confirmed ?? order.createdAt

  const repeatOrder = () => {
    replaceAll(
      order.quote.lines.map((l) => ({ productId: l.productId, unit: l.unit, quantity: l.quantity })),
      order.quote.redeems.map((r) => ({ productId: r.productId, quantity: r.quantity }))
    )
    navigate("/carrito")
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-2 pb-10">
      {/* Hero de confirmación */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-success via-success to-success/80 p-5 text-primary-foreground shadow-lg shadow-success/20">
        <span className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-primary-foreground/10" />
        <span className="pointer-events-none absolute -bottom-20 left-20 size-40 rounded-full bg-primary-foreground/10" />
        <div className="relative z-10 flex flex-col gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-foreground text-success shadow-md">
            <Check className="size-6" strokeWidth={3} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
              {heroEyebrow}
            </span>
            <h1 className="text-2xl leading-tight">{heroTitle}</h1>
            <p className="text-sm opacity-90">
              Pedido <strong>#{order.id}</strong> · {formatDateTime(headline)}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-primary-foreground/15 px-3 py-2 text-xs backdrop-blur">
            <CalendarDays className="size-4 shrink-0" />
            <span>
              {delivered ? "Entregado el" : "Llega el"} <strong>{formatLongDate(order.deliveryDate)}</strong>
              {!delivered && `, entre ${point.reception.from} y ${point.reception.to}`}.
            </span>
          </div>
        </div>
      </div>

      {(order.pointsEarned > 0 || order.pointsUsed > 0) && (
        <Link
          to="/puntos"
          className="flex items-center gap-3 rounded-2xl bg-money/15 px-4 py-3 ring-1 ring-money/30 transition-all hover:-translate-y-0.5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-money text-money-foreground">
            <Coins className="size-4" strokeWidth={2.5} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-semibold">
              {order.pointsEarned > 0 ? `Este pedido te dio +${formatPts(order.pointsEarned)}` : "Pedido con canje de puntos"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {order.pointsUsed > 0 ? `Usaste ${formatPts(order.pointsUsed)} en canjes · ` : ""}Venado Money
            </span>
          </span>
          <span className="text-xs font-bold text-money-foreground">Ver puntos</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-2">
        <a
          href={whatsAppChatHref}
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-foreground text-xs font-bold text-background shadow-md active:scale-95"
        >
          <MessageCircle className="size-4" />
          Volver a WhatsApp
        </a>
        <button
          type="button"
          onClick={repeatOrder}
          className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-card text-xs font-bold text-primary ring-1 ring-primary/30 active:scale-95"
        >
          <RotateCcw className="size-4" />
          Repetir pedido
        </button>
      </div>

      <div className="sm:grid sm:grid-cols-2 sm:gap-5">
        {/* Seguimiento */}
        <section className="rounded-3xl bg-card p-4 ring-1 ring-foreground/5">
          <h2 className="mb-3 text-base">Seguimiento</h2>
          <ol className="flex flex-col">
            {ORDER_STEPS.map((s, i) => {
              const done = i < currentIndex
              const current = i === currentIndex
              const time = stepTime(s.key)
              return (
                <li key={s.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full ring-2",
                        done && "bg-success text-primary-foreground ring-success",
                        current && "bg-primary text-primary-foreground ring-primary shadow-md shadow-primary/30",
                        !done && !current && "bg-card ring-foreground/10"
                      )}
                    >
                      {done || current ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : (
                        <span className="size-1.5 rounded-full bg-foreground/20" />
                      )}
                    </span>
                    {i < ORDER_STEPS.length - 1 && (
                      <span className={cn("my-1 w-0.5 flex-1 rounded-full", done ? "bg-success" : "bg-foreground/10")} />
                    )}
                  </div>
                  <div className={cn("flex flex-col pb-4", i === ORDER_STEPS.length - 1 && "pb-0")}>
                    <span
                      className={cn(
                        "text-sm leading-tight",
                        current ? "font-bold text-primary" : done ? "font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {time ? formatDateTime(time) : current ? "En curso" : s.hint}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <div className="mt-5 flex flex-col gap-5 sm:mt-0">
          {/* Entrega */}
          <section className="flex flex-col gap-3 rounded-3xl bg-card p-4 ring-1 ring-foreground/5">
            <h2 className="text-base">Entrega</h2>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="size-4" />
              </span>
              <div className="flex flex-col text-sm">
                <span className="font-semibold">{point.address}</span>
                <span className="text-xs text-muted-foreground">
                  {point.zone} · {point.city}
                </span>
                <span className="text-xs text-muted-foreground">Recibe {point.contact}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="size-4" />
              </span>
              <div className="flex flex-col text-sm">
                <span className="font-semibold">{formatLongDate(order.deliveryDate)}</span>
                <span className="text-xs text-muted-foreground">
                  Entre {point.reception.from} y {point.reception.to}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CreditCard className="size-4" />
              </span>
              <div className="flex flex-col text-sm">
                <span className="font-semibold">Pago QR · {order.paymentRef}</span>
                <span className="text-xs text-muted-foreground">
                  Factura a {customer.businessName} · NIT {customer.nit}
                </span>
              </div>
            </div>
          </section>

          {/* Ítems */}
          <section className="rounded-3xl bg-card p-4 ring-1 ring-foreground/5">
            <h2 className="mb-3 text-base">
              Productos{" "}
              <span className="text-xs font-normal text-muted-foreground">
                · {order.quote.lines.length}
              </span>
            </h2>
            <OrderLines quote={order.quote} />
          </section>

          <QuoteSummary quote={order.quote} totalLabel="Total pagado" pointsEarned={order.pointsEarned} pointsUsed={order.pointsUsed} />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Te avisamos por WhatsApp cada vez que tu pedido cambie de estado.
      </p>
    </div>
  )
}
