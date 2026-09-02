import { createContext, useContext, useState, type ReactNode } from "react"

import { deliveryPoints, nextDeliveryDates } from "@/data/customer"

/**
 * Selección de entrega del checkout (punto + fecha). Vive aparte del carrito para que el carrito
 * siga siendo solo `{productId, unit, quantity}` como `shopping_cart_item` real.
 */
interface CheckoutContextValue {
  deliveryPointId: number
  setDeliveryPointId: (id: number) => void
  deliveryDate: Date
  setDeliveryDate: (d: Date) => void
  availableDates: Date[]
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [availableDates] = useState(() => nextDeliveryDates(4))
  const [deliveryPointId, setDeliveryPointId] = useState(deliveryPoints[0]!.id)
  const [deliveryDate, setDeliveryDate] = useState<Date>(() => availableDates[0]!)

  return (
    <CheckoutContext.Provider
      value={{ deliveryPointId, setDeliveryPointId, deliveryDate, setDeliveryDate, availableDates }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error("useCheckout debe usarse dentro de CheckoutProvider")
  return ctx
}
