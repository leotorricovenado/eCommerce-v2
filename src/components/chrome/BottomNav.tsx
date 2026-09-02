import { Coins, LayoutGrid, House, ShoppingCart, UserRound } from "lucide-react"
import { NavLink } from "react-router"

import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"

const items = [
  { to: "/", label: "Inicio", icon: House, end: true },
  { to: "/catalogo", label: "Catálogo", icon: LayoutGrid, end: false },
  { to: "/carrito", label: "Carrito", icon: ShoppingCart, end: false },
  { to: "/puntos", label: "Puntos", icon: Coins, end: false },
  { to: "/perfil", label: "Perfil", icon: UserRound, end: false },
]

export function BottomNav() {
  const { itemCount } = useCart()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-3xl grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors",
                isActive && "text-primary"
              )
            }
          >
            <span className="relative">
              <Icon className="size-5" />
              {to === "/carrito" && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
