import { Check, Coins, Minus, Plus, Trash2 } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Link } from "react-router"

import { productImage } from "@/data/productImages"
import type { Redeemable } from "@/data/venadoMoney"
import { formatPts } from "@/components/money/PointsUI"
import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"
import { usePoints } from "@/state/points"

interface RedeemProductCardProps {
  item: Redeemable
  className?: string
}

/**
 * Card de canje: foto, costo en puntos y botón "Canjear" que agrega el producto al carrito como
 * canje (sección "Canjes con puntos"). Si el saldo no alcanza, muestra cuántos faltan.
 *
 * Sirve para las dos cosas que se canjean: productos de la marca (con foto del catálogo y página
 * de detalle) y Grandes Premios (`item.prize`), que son externos a la marca — no tienen página de
 * producto y su foto es la de referencia del proveedor, con el ícono del premio como respaldo.
 */
export function RedeemProductCard({ item, className }: RedeemProductCardProps) {
  const { product, points, prize } = item
  const { addRedeem, setRedeemQuantity, removeRedeem, getRedeem, quote } = useCart()
  const { balance } = usePoints()
  const quantity = getRedeem(product.id)?.quantity ?? 0
  const [photoFailed, setPhotoFailed] = useState(false)
  const photo = prize ? (photoFailed ? undefined : prize.imageUrl) : productImage(product)
  const PrizeIcon = prize?.icon
  // Puntos disponibles después de lo que ya está en el carrito (sin contar esta línea).
  const committed = quote.pointsCost - quantity * points
  const available = balance - committed
  const canAddOne = available >= (quantity + 1) * points
  const missing = Math.max(0, (quantity + 1) * points - available)

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        quantity > 0 ? "ring-money/60" : "ring-foreground/5",
        className
      )}
    >
      <Frame to={prize ? undefined : `/producto/${product.id}`} className="relative block aspect-square overflow-hidden bg-card">
        {photo ? (
          <img
            src={photo}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setPhotoFailed(true)}
            className="absolute inset-0 size-full object-contain p-3 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          PrizeIcon && (
            <span className="absolute inset-0 flex items-center justify-center bg-money/10 text-money-foreground">
              <PrizeIcon className="size-14" strokeWidth={1.25} />
            </span>
          )
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-money px-2 py-0.5 text-[11px] font-bold text-money-foreground shadow-sm">
          <Coins className="size-3" strokeWidth={2.5} />
          {formatPts(points)}
        </span>
        {quantity > 0 && (
          <span className="absolute top-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-money-foreground px-1.5 text-[11px] font-bold text-card shadow-sm">
            {quantity}
          </span>
        )}
      </Frame>

      <div className="flex flex-1 flex-col gap-0.5 p-3 pt-2.5">
        {prize ? (
          <span className="text-[10px] font-bold tracking-wider text-money-foreground uppercase">Gran Premio</span>
        ) : (
          product.brand && <span className="text-[10px] font-bold tracking-wider text-primary uppercase">{product.brand}</span>
        )}
        <Frame to={prize ? undefined : `/producto/${product.id}`} className="line-clamp-2 text-[13px] leading-snug font-semibold">
          {product.name}
        </Frame>
        <span className="text-[11px] text-muted-foreground">{product.size}</span>

        <div className="mt-auto pt-2">
          {quantity === 0 ? (
            <button
              type="button"
              disabled={!canAddOne}
              onClick={() => addRedeem(product.id)}
              className={cn(
                "flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all active:scale-95",
                canAddOne
                  ? "bg-money text-money-foreground shadow-md shadow-money/30 hover:bg-money/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              {canAddOne ? (
                <>
                  <Coins className="size-3.5" strokeWidth={2.5} />
                  Canjear
                </>
              ) : (
                `Te faltan ${formatPts(missing)}`
              )}
            </button>
          ) : (
            <div className="flex h-9 items-center justify-between rounded-full bg-money-foreground p-1 text-card shadow-md">
              <button
                type="button"
                aria-label={quantity > 1 ? "Quitar uno" : "Quitar canje"}
                onClick={() => (quantity > 1 ? setRedeemQuantity(product.id, quantity - 1) : removeRedeem(product.id))}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-card/15 active:scale-90"
              >
                {quantity > 1 ? <Minus className="size-4" strokeWidth={2.5} /> : <Trash2 className="size-4" strokeWidth={2.25} />}
              </button>
              <span className="flex min-w-0 flex-1 items-center justify-center gap-1 truncate text-xs font-bold tabular-nums">
                <Check className="size-3.5" strokeWidth={3} />
                {quantity} en carrito
              </span>
              <button
                type="button"
                aria-label="Canjear uno más"
                disabled={!canAddOne}
                onClick={() => addRedeem(product.id)}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-money text-money-foreground transition-transform active:scale-90 disabled:opacity-40"
              >
                <Plus className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

/** Envoltorio que linkea al producto cuando existe (los Grandes Premios no tienen página). */
function Frame({ to, className, children }: { to?: string; className?: string; children: ReactNode }) {
  if (!to) return <span className={className}>{children}</span>
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}
