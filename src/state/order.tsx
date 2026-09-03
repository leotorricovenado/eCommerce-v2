import { createContext, useContext, useState, type ReactNode } from "react"

import { quoteCart, type Quote } from "@/data/priceRules"
import { TIERS, pointsForQuote } from "@/data/venadoMoney"

/**
 * Pasos del canal de autogestión (kickoff DEAL, diapositiva 6 — flujo PREPAGO): el pago va
 * primero y recién después existe el pedido confirmado. No hay paso "Cobrado".
 */
export const ORDER_STEPS = [
  { key: "created", label: "Pedido realizado", hint: "Desde el eCommerce de WhatsApp" },
  { key: "paid", label: "Pago QR validado", hint: "Validación bancaria" },
  { key: "confirmed", label: "Pedido confirmado", hint: "Stock reservado y facturación" },
  { key: "planned", label: "Planificado", hint: "Asignado a una ruta de reparto" },
  { key: "picking", label: "Picking", hint: "Preparando tu pedido en almacén" },
  { key: "dispatched", label: "Despachado", hint: "Salió del centro de distribución" },
  { key: "in_route", label: "En ruta", hint: "El camión está en camino" },
  { key: "delivered", label: "Entregado", hint: "Recibido en tu punto de entrega" },
] as const

export type OrderStepKey = (typeof ORDER_STEPS)[number]["key"]

export function stepIndex(key: OrderStepKey): number {
  return ORDER_STEPS.findIndex((s) => s.key === key)
}

export interface Order {
  /** Sales usa `orderId` entero — no un código tipo "VN-2024-001". */
  id: number
  createdAt: Date
  /** Snapshot de la cotización al momento de pagar (precios congelados en el pedido, no en el carrito). */
  quote: Quote
  deliveryPointId: number
  deliveryDate: Date
  status: OrderStepKey
  /** Fecha/hora en que se alcanzó cada paso (solo los ya cumplidos). */
  history: Partial<Record<OrderStepKey, Date>>
  /** Referencia de pago simulada (en real: transactionUuid / collectionPaymentId de Collections). */
  paymentRef: string
  /** Venado Money: puntos que sumó este pedido y puntos usados en canjes. */
  pointsEarned: number
  pointsUsed: number
}

interface OrderContextValue {
  orders: Order[]
  placeOrder: (input: Pick<Order, "quote" | "deliveryPointId" | "deliveryDate" | "pointsEarned" | "pointsUsed">) => Order
  getOrder: (id: number) => Order | undefined
}

const OrderContext = createContext<OrderContextValue | null>(null)

const DAY = 24 * 60 * 60 * 1000
const minutesAgo = (base: Date, min: number) => new Date(base.getTime() - min * 60 * 1000)

function paymentRef(at: Date): string {
  return `QR-${at.getFullYear()}${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getTime()).slice(-6)}`
}

/**
 * Pedidos anteriores de DEMO para que Historial/Estado tengan algo que mostrar (en real: O8
 * `GET /orders?customerId=…` de Sales). Se arman con productos reales y el mismo motor de reglas;
 * las fechas son relativas a hoy para que nunca queden "viejas".
 */
function seedOrders(now: Date): Order[] {
  const build = (
    id: number,
    daysAgo: number,
    status: OrderStepKey,
    deliveryPointId: number,
    lines: Parameters<typeof quoteCart>[0]
  ): Order => {
    const createdAt = new Date(now.getTime() - daysAgo * DAY)
    // "En ruta" = llega hoy; entregados = llegaron 2 días después de pedirse.
    const deliveryDate = status === "delivered" ? new Date(createdAt.getTime() + 2 * DAY) : new Date(now)
    deliveryDate.setHours(0, 0, 0, 0)
    const history: Order["history"] = {}
    const reached = stepIndex(status)
    const checkoutEnd = createdAt.getTime() + 6 * 60 * 1000
    const logisticsEnd = status === "delivered" ? deliveryDate.getTime() + 11 * 60 * 60 * 1000 : now.getTime() - 20 * 60 * 1000
    const logisticsSteps = Math.max(reached - 2, 1)
    ORDER_STEPS.forEach((s, i) => {
      if (i > reached) return
      // Los 3 primeros pasos son casi simultáneos (checkout); los logísticos se reparten entre el
      // checkout y ahora (o la entrega), siempre en el pasado.
      history[s.key] =
        i < 3
          ? new Date(createdAt.getTime() + i * 3 * 60 * 1000)
          : new Date(checkoutEnd + ((i - 2) / logisticsSteps) * (logisticsEnd - checkoutEnd))
    })
    const quote = quoteCart(lines)
    return {
      id,
      createdAt,
      quote,
      pointsEarned: pointsForQuote(quote, TIERS[0]!),
      pointsUsed: 0,
      deliveryPointId,
      deliveryDate,
      status,
      history,
      paymentRef: paymentRef(createdAt),
    }
  }
  return [
    build(48212, 1, "in_route", 501, [
      { productId: "mayonesa-doypack-300986", unit: "caja", quantity: 1 },
      { productId: "ketchup-doypack-301049", unit: "unidad", quantity: 6 },
      { productId: "refresco-frussion-naranja-600113", unit: "caja", quantity: 2 },
    ]),
    build(48197, 9, "delivered", 502, [
      { productId: "lavavajillas-limon-bristar-doypack-301278", unit: "caja", quantity: 1 },
      { productId: "gelatina-frambuesa-bolsa-300853", unit: "unidad", quantity: 10 },
    ]),
    build(48171, 23, "delivered", 501, [
      { productId: "mostaza-doypack-301053", unit: "unidad", quantity: 12 },
      { productId: "salsa-golf-pomo-300179", unit: "caja", quantity: 1 },
      { productId: "mayonesa-doypack-300986", unit: "unidad", quantity: 4 },
    ]),
  ]
}

let nextId = 48213

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => seedOrders(new Date()))

  const placeOrder: OrderContextValue["placeOrder"] = (input) => {
    const now = new Date()
    const order: Order = {
      id: nextId++,
      createdAt: minutesAgo(now, 0.15),
      status: "confirmed",
      history: { created: minutesAgo(now, 0.15), paid: minutesAgo(now, 0.05), confirmed: now },
      paymentRef: paymentRef(now),
      ...input,
    }
    setOrders((prev) => [order, ...prev])
    return order
  }

  const getOrder = (id: number) => orders.find((o) => o.id === id)

  return (
    <OrderContext.Provider value={{ orders, placeOrder, getOrder }}>{children}</OrderContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error("useOrders debe usarse dentro de OrderProvider")
  return ctx
}
