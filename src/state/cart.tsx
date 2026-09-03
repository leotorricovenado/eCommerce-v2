import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

import { mockPrice } from "@/data/mockPricing"
import {
  quoteCart,
  unitsPer as unitsPerProduct,
  type CartUnit,
  type Quote,
  type RedeemLineInput,
} from "@/data/priceRules"
import type { Product } from "@/data/products"

export type { CartUnit }

/**
 * Unidad de venta elegida por el cliente mayorista (decisión del usuario, 2026-09-02):
 * - "unidad": la unidad mínima, una pieza suelta.
 * - "caja":   la unidad máxima, el bulto cerrado tal como lo describe `packaging` en el catálogo
 *             (caja / paquete / bolsón...). Los niveles intermedios (displays) no se venden aparte.
 * El precio del bulto en el mock es unidad × unidades del bulto, sin descuento (no inventar).
 */
export interface CartLine {
  productId: string
  unit: CartUnit
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  /** Canjes con puntos Venado Money (mismo pedido, sin costo en Bs). */
  redeems: RedeemLineInput[]
  addRedeem: (productId: string, quantity?: number) => void
  setRedeemQuantity: (productId: string, quantity: number) => void
  removeRedeem: (productId: string) => void
  getRedeem: (productId: string) => RedeemLineInput | undefined
  add: (productId: string, quantity?: number, unit?: CartUnit) => void
  setQuantity: (productId: string, quantity: number, unit?: CartUnit) => void
  /** Mueve una línea de unidad a caja (o al revés) conservando la cantidad. */
  setUnit: (productId: string, from: CartUnit, to: CartUnit) => void
  remove: (productId: string, unit?: CartUnit) => void
  replaceAll: (lines: CartLine[], redeems?: RedeemLineInput[]) => void
  clear: () => void
  getLine: (productId: string, unit?: CartUnit) => CartLine | undefined
  /** Cantidad de bultos/unidades cargados (lo que muestra el badge del carrito). */
  itemCount: number
  /** Cotización con bonificaciones y canjes (motor mock, ver data/priceRules.ts). */
  quote: Quote
}

/** Unidades sueltas que representa 1 línea en esa unidad de venta. */
export function unitsPer(product: Product, unit: CartUnit): number {
  return unitsPerProduct(product, unit)
}

/** Precio simulado de 1 bulto/unidad según la unidad de venta (antes de reglas). */
export function unitPrice(product: Product, unit: CartUnit): number {
  return mockPrice(product) * unitsPer(product, unit)
}

const CartContext = createContext<CartContextValue | null>(null)

const same = (l: CartLine, productId: string, unit: CartUnit) =>
  l.productId === productId && l.unit === unit

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [redeems, setRedeems] = useState<RedeemLineInput[]>([])

  const add = (productId: string, quantity = 1, unit: CartUnit = "unidad") => {
    setLines((prev) => {
      const existing = prev.find((l) => same(l, productId, unit))
      if (existing) {
        return prev.map((l) =>
          same(l, productId, unit) ? { ...l, quantity: l.quantity + quantity } : l
        )
      }
      return [...prev, { productId, unit, quantity }]
    })
  }

  const setQuantity = (productId: string, quantity: number, unit: CartUnit = "unidad") => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => !same(l, productId, unit))
      return prev.map((l) => (same(l, productId, unit) ? { ...l, quantity } : l))
    })
  }

  const setUnit = (productId: string, from: CartUnit, to: CartUnit) => {
    if (from === to) return
    setLines((prev) => {
      const source = prev.find((l) => same(l, productId, from))
      if (!source) return prev
      const rest = prev.filter((l) => !same(l, productId, from))
      const target = rest.find((l) => same(l, productId, to))
      if (target) {
        return rest.map((l) =>
          same(l, productId, to) ? { ...l, quantity: l.quantity + source.quantity } : l
        )
      }
      // Mantiene la posición de la línea original para que no "salte" en la lista.
      const index = prev.findIndex((l) => same(l, productId, from))
      const next = [...rest]
      next.splice(index, 0, { productId, unit: to, quantity: source.quantity })
      return next
    })
  }

  const remove = (productId: string, unit: CartUnit = "unidad") =>
    setLines((prev) => prev.filter((l) => !same(l, productId, unit)))

  const addRedeem = (productId: string, quantity = 1) =>
    setRedeems((prev) => {
      const existing = prev.find((r) => r.productId === productId)
      if (existing) return prev.map((r) => (r.productId === productId ? { ...r, quantity: r.quantity + quantity } : r))
      return [...prev, { productId, quantity }]
    })
  const setRedeemQuantity = (productId: string, quantity: number) =>
    setRedeems((prev) =>
      quantity <= 0 ? prev.filter((r) => r.productId !== productId) : prev.map((r) => (r.productId === productId ? { ...r, quantity } : r))
    )
  const removeRedeem = (productId: string) => setRedeems((prev) => prev.filter((r) => r.productId !== productId))
  const getRedeem = (productId: string) => redeems.find((r) => r.productId === productId)

  const replaceAll = (next: CartLine[], nextRedeems: RedeemLineInput[] = []) => {
    setLines(next)
    setRedeems(nextRedeems)
  }
  const clear = () => {
    setLines([])
    setRedeems([])
  }

  const getLine = (productId: string, unit: CartUnit = "unidad") =>
    lines.find((l) => same(l, productId, unit))

  const quote = useMemo(() => quoteCart(lines, redeems), [lines, redeems])
  const itemCount = quote.itemCount

  return (
    <CartContext.Provider
      value={{
        lines,
        redeems,
        add,
        setQuantity,
        setUnit,
        remove,
        addRedeem,
        setRedeemQuantity,
        removeRedeem,
        getRedeem,
        replaceAll,
        clear,
        getLine,
        itemCount,
        quote,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}

