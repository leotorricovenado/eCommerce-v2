import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const STEPS = ["Carrito", "Entrega", "Pago"]

/** Indicador de progreso del checkout (1 Carrito → 2 Entrega → 3 Pago). */
export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-[11px] font-bold ring-2 transition-colors",
                done && "bg-success text-primary-foreground ring-success",
                active && "bg-primary text-primary-foreground ring-primary",
                !done && !active && "bg-card text-muted-foreground ring-foreground/10"
              )}
            >
              {done ? <Check className="size-3" strokeWidth={3} /> : n}
            </span>
            <span
              className={cn(
                "text-xs font-semibold",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className={cn("h-px w-6 rounded-full", done ? "bg-success" : "bg-foreground/10")} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
