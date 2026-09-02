import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

import { progressToNext, tierFor, type Tier } from "@/data/venadoMoney"

export type MovementKind = "abono" | "debito"

export interface PointsMovement {
  id: string
  kind: MovementKind
  points: number
  at: Date
  /** Pedido que originó el movimiento (abono por compra o débito por canje). */
  orderId: number
  description: string
}

interface PointsContextValue {
  balance: number
  /** Puntos acumulados históricos (suma de abonos) — define el nivel. */
  lifetime: number
  tier: Tier
  progress: ReturnType<typeof progressToNext>
  movements: PointsMovement[]
  earn: (points: number, orderId: number) => void
  redeem: (points: number, orderId: number) => void
}

const PointsContext = createContext<PointsContextValue | null>(null)

const DAY = 24 * 60 * 60 * 1000

/**
 * Movimientos de DEMO, coherentes con los pedidos sembrados en `state/order.tsx` (48171, 48197,
 * 48212) más historial anterior, para que el saldo y el progreso de nivel tengan sentido:
 * acumulado ≈ 760 pts (76 % hacia Plata), un canje de 240 → saldo ≈ 520.
 */
function seedMovements(now: Date): PointsMovement[] {
  const at = (daysAgo: number) => new Date(now.getTime() - daysAgo * DAY)
  const abono = (orderId: number, points: number, daysAgo: number): PointsMovement => ({
    id: `m-${orderId}-a`,
    kind: "abono",
    points,
    at: at(daysAgo),
    orderId,
    description: `Pedido #${orderId}`,
  })
  return [
    abono(48212, 112, 1),
    abono(48197, 39, 9),
    {
      id: "m-48185-d",
      kind: "debito",
      points: 240,
      at: at(14),
      orderId: 48185,
      description: "Canje en pedido #48185",
    },
    abono(48185, 61, 14),
    abono(48171, 158, 23),
    abono(48140, 204, 41),
    abono(48098, 186, 58),
  ]
}

export function PointsProvider({ children }: { children: ReactNode }) {
  const [movements, setMovements] = useState<PointsMovement[]>(() => seedMovements(new Date()))

  const { balance, lifetime } = useMemo(() => {
    let balance = 0
    let lifetime = 0
    for (const m of movements) {
      if (m.kind === "abono") {
        balance += m.points
        lifetime += m.points
      } else {
        balance -= m.points
      }
    }
    return { balance, lifetime }
  }, [movements])

  const earn = (points: number, orderId: number) => {
    if (points <= 0) return
    setMovements((prev) => [
      { id: `m-${orderId}-a`, kind: "abono", points, at: new Date(), orderId, description: `Pedido #${orderId}` },
      ...prev,
    ])
  }

  const redeem = (points: number, orderId: number) => {
    if (points <= 0) return
    setMovements((prev) => [
      {
        id: `m-${orderId}-d`,
        kind: "debito",
        points,
        at: new Date(),
        orderId,
        description: `Canje en pedido #${orderId}`,
      },
      ...prev,
    ])
  }

  const tier = tierFor(lifetime)
  const progress = progressToNext(lifetime)

  return (
    <PointsContext.Provider value={{ balance, lifetime, tier, progress, movements, earn, redeem }}>
      {children}
    </PointsContext.Provider>
  )
}

export function usePoints() {
  const ctx = useContext(PointsContext)
  if (!ctx) throw new Error("usePoints debe usarse dentro de PointsProvider")
  return ctx
}
