import { ArrowRight, ChevronRight, PackageSearch, RotateCcw, Truck } from "lucide-react"
import { Link, useNavigate } from "react-router"

import { ProductThumb } from "@/components/checkout/OrderLines"
import { deliveryPoints } from "@/data/customer"
import { formatBs } from "@/lib/format"
import { formatLongDate, formatShortDate } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"
import { ORDER_STEPS, stepIndex, useOrders, type Order } from "@/state/order"

const STATUS_TONE: Record<string, string> = {
  delivered: "bg-success/10 text-success",
  in_route: "bg-primary/10 text-primary",
  dispatched: "bg-primary/10 text-primary",
  default: "bg-warning/20 text-foreground",
}

export function OrderHistory() {
  const navigate = useNavigate()
  const { orders } = useOrders()
  const { replaceAll } = useCart()

  const active = orders.filter((o) => o.status !== "delivered")
  const delivered = orders.filter((o) => o.status === "delivered")

  const repeat = (o: Order) => {
    replaceAll(
      o.quote.lines.map((l) => ({ productId: l.productId, unit: l.unit, quantity: l.quantity })),
      o.quote.redeems.map((r) => ({ productId: r.productId, quantity: r.quantity }))
    )
    navigate("/carrito")
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PackageSearch className="size-9" strokeWidth={1.75} />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl">Todavía no hiciste pedidos</h1>
          <p className="text-sm text-muted-foreground">Cuando confirmes uno, lo vas a ver acá.</p>
        </div>
        <Link
          to="/catalogo"
          className="flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/30 active:scale-95"
        >
          Ir al catálogo
          <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-3 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl leading-none">Mis pedidos</h1>
        <span className="text-xs text-muted-foreground">
          {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} · te avisamos por WhatsApp cada cambio de estado
        </span>
      </div>

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base">En curso</h2>
          {active.map((o) => (
            <OrderCard key={o.id} order={o} onRepeat={() => repeat(o)} highlight />
          ))}
        </section>
      )}

      {delivered.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base">Entregados</h2>
          {delivered.map((o) => (
            <OrderCard key={o.id} order={o} onRepeat={() => repeat(o)} />
          ))}
        </section>
      )}
    </div>
  )
}

function OrderCard({ order, onRepeat, highlight }: { order: Order; onRepeat: () => void; highlight?: boolean }) {
  const step = ORDER_STEPS[stepIndex(order.status)]!
  const point = deliveryPoints.find((p) => p.id === order.deliveryPointId)
  const products = order.quote.lines.map((l) => l.product)
  const bonusCount = order.quote.bonuses.reduce((a, b) => a + b.quantity, 0)
  const tone = STATUS_TONE[order.status] ?? STATUS_TONE.default

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-3xl bg-card p-4 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-lg",
        highlight ? "ring-primary/30 shadow-md shadow-primary/10" : "ring-foreground/5"
      )}
    >
      <Link to={`/pedido/${order.id}`} className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="cn-font-heading text-base leading-tight">Pedido #{order.id}</span>
            <span className="text-xs text-muted-foreground">{formatShortDate(order.createdAt)}</span>
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", tone)}>{step.label}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {products.slice(0, 4).map((p) => (
              <ProductThumb key={p.id} product={p} className="size-11 ring-2 ring-card" />
            ))}
            {products.length > 4 && (
              <span className="flex size-11 items-center justify-center rounded-2xl bg-muted text-xs font-bold ring-2 ring-card">
                +{products.length - 4}
              </span>
            )}
          </div>
          <div className="ml-1 flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold">
              {products.map((p) => p.name).join(", ")}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {order.quote.lines.length} {order.quote.lines.length === 1 ? "producto" : "productos"}
              {bonusCount > 0 && ` · ${bonusCount} de regalo`}
            </span>
          </div>
        </div>

        {order.status !== "delivered" && point && (
          <div className="flex items-center gap-2 rounded-2xl bg-primary/5 px-3 py-2 text-xs">
            <Truck className="size-4 shrink-0 text-primary" />
            <span>
              Llega el <strong>{formatLongDate(order.deliveryDate)}</strong> a {point.address}
            </span>
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-foreground/5 pt-3">
        <span className="cn-font-heading text-lg tabular-nums">{formatBs(order.quote.net)}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRepeat}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-card px-3 text-xs font-bold text-primary ring-1 ring-primary/30 transition-all hover:bg-primary/5 active:scale-95"
          >
            <RotateCcw className="size-3.5" strokeWidth={2.5} />
            Repetir
          </button>
          <Link
            to={`/pedido/${order.id}`}
            className="flex h-9 items-center gap-1 rounded-full bg-foreground px-3 text-xs font-bold text-background shadow-md active:scale-95"
          >
            Ver
            <ChevronRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </article>
  )
}
