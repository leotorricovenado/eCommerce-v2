import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

import { expiryFor, progressToNext, tierFor, type Tier } from "@/data/venadoMoney"

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

/** Lote de puntos ganados en un abono, con lo que le queda sin canjear y su vencimiento. */
export interface PointsLot {
  movementId: string
  earned: number
  remaining: number
  earnedAt: Date
  expiresAt: Date
  orderId: number
}

interface PointsContextValue {
  balance: number
  /** Puntos acumulados históricos (suma de abonos) — define el nivel. */
  lifetime: number
  tier: Tier
  progress: ReturnType<typeof progressToNext>
  movements: PointsMovement[]
  /** Lotes con saldo, del más viejo al más nuevo (los canjes consumen FIFO). */
  lots: PointsLot[]
  /** Próximo lote en vencer (el más viejo con saldo), si hay. */
  nextExpiry: PointsLot | null
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

/** Reconstruye los lotes aplicando los débitos FIFO (primero vencen/se consumen los más viejos). */
function buildLots(movements: PointsMovement[]): PointsLot[] {
  const chronological = [...movements].sort((a, b) => a.at.getTime() - b.at.getTime())
  const lots: PointsLot[] = []
  for (const m of chronological) {
    if (m.kind === "abono") {
      lots.push({ movementId: m.id, earned: m.points, remaining: m.points, earnedAt: m.at, expiresAt: expiryFor(m.at), orderId: m.orderId })
      continue
    }
    let left = m.points
    for (const lot of lots) {
      if (left <= 0) break
      const take = Math.min(lot.remaining, left)
      lot.remaining -= take
      left -= take
    }
  }
  return lots
}

export function PointsProvider({ children }: { children: ReactNode }) {
  const [movements, setMovements] = useState<PointsMovement[]>(() => seedMovements(new Date()))

  const { balance, lifetime, lots } = useMemo(() => {
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
    const lots = buildLots(movements).filter((l) => l.remaining > 0)
    return { balance, lifetime, lots }
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
      { id: `m-${orderId}-d`, kind: "debito", points, at: new Date(), orderId, description: `Canje en pedido #${orderId}` },
      ...prev,
    ])
  }

  const tier = tierFor(lifetime)
  const progress = progressToNext(lifetime)
  const nextExpiry = lots[0] ?? null

  return (
    <PointsContext.Provider value={{ balance, lifetime, tier, progress, movements, lots, nextExpiry, earn, redeem }}>
      {children}
    </PointsContext.Provider>
  )
}

export function usePoints() {
  const ctx = useContext(PointsContext)
  if (!ctx) throw new Error("usePoints debe usarse dentro de PointsProvider")
  return ctx
}
