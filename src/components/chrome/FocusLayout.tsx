import { ChevronLeft, ShoppingCart } from "lucide-react"
import { Link, Outlet, useNavigate } from "react-router"

import { useCart } from "@/state/cart"

interface FocusLayoutProps {
  title?: string
}

export function FocusLayout({ title }: FocusLayoutProps) {
  const navigate = useNavigate()
  const { itemCount } = useCart()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-foreground/5 transition-all hover:ring-primary/30 active:scale-95"
          >
            <ChevronLeft className="size-5" />
          </button>
          {title && <h1 className="text-sm font-semibold">{title}</h1>}
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
