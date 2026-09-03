import { ChevronLeft, Search, ShoppingCart } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router"

import { groupLogoWhite } from "@/data/brandLogos"
import { useCart } from "@/state/cart"

/**
 * Sub-pantallas dentro del Layout con bottom nav: en vez del logo muestran un botón "volver" al
 * padre lógico (no al historial), así "atrás" siempre lleva a un lugar esperable.
 */
function parentFor(pathname: string): { to: string; label: string } | null {
  if (pathname.startsWith("/puntos/")) return { to: "/puntos", label: "Puntos" }
  if (pathname === "/pedidos") return { to: "/perfil", label: "Perfil" }
  return null
}

export function TopBar() {
  const { itemCount } = useCart()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const parent = parentFor(pathname)

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
        {parent ? (
          <button
            type="button"
            onClick={() => navigate(parent.to)}
            aria-label={`Volver a ${parent.label}`}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/30 active:scale-95"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 shadow-md shadow-primary/25">
              <img src={groupLogoWhite} alt="" className="h-6 w-auto" />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="cn-font-heading text-sm uppercase">Grupo Venado</span>
              <span className="text-[10px] text-muted-foreground">Pedidos para tu negocio</span>
            </span>
          </Link>
        )}

        <Link
          to="/catalogo?buscar=1"
          className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-3.5 text-sm text-muted-foreground shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/30"
        >
          <Search className="size-4 shrink-0 text-primary" />
          <span className="truncate">Buscar mayonesa, detergente, jugos...</span>
        </Link>

        <Link
          to="/carrito"
          aria-label="Carrito"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/30"
        >
          <ShoppingCart className="size-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground ring-2 ring-background">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
