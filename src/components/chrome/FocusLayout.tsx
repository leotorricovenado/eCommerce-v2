import { ChevronLeft, ShoppingCart } from "lucide-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"

import { useSmartBack } from "@/lib/useSmartBack"
import { useCart } from "@/state/cart"

/**
 * A dónde vuelve cada pantalla de foco. En el checkout el "atrás" es SIEMPRE el paso anterior
 * (no el historial, que puede tener idas y vueltas); en el detalle de producto vuelve por historial
 * y cae al catálogo si se abrió directo; el estado del pedido vuelve a "Mis pedidos" (el historial
 * llevaría a la pantalla de pago, que ya no existe).
 */
function backTargetFor(pathname: string): { to: string; label: string; useHistory: boolean } {
  if (pathname.startsWith("/checkout/pago")) return { to: "/checkout/entrega", label: "Entrega", useHistory: false }
  if (pathname.startsWith("/checkout/entrega")) return { to: "/carrito", label: "Carrito", useHistory: false }
  if (pathname.startsWith("/pedido/")) return { to: "/pedidos", label: "Mis pedidos", useHistory: false }
  if (pathname.startsWith("/producto/")) return { to: "/catalogo", label: "Catálogo", useHistory: true }
  return { to: "/", label: "Inicio", useHistory: true }
}

export function FocusLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { itemCount } = useCart()
  const target = backTargetFor(pathname)
  const smartBack = useSmartBack(target.to)
  const goBack = () => (target.useHistory ? smartBack() : navigate(target.to))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
          <button
            type="button"
            onClick={goBack}
            aria-label={`Volver a ${target.label}`}
            className="flex h-10 cursor-pointer items-center gap-1 rounded-full bg-card py-0 pr-3.5 pl-2 text-xs font-semibold shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/30 active:scale-95"
          >
            <ChevronLeft className="size-5" />
            {target.label}
          </button>
          <Link
            to="/carrito"
            aria-label="Carrito"
            className="relative ml-auto flex size-10 shrink-0 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/30"
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
      <main className="mx-auto max-w-3xl">
        <Outlet />
      </main>
    </div>
  )
}
