import { Coins, Minus, Plus, Trash2 } from "lucide-react"
import { Link } from "react-router"

import { brandLogos } from "@/data/brandLogos"
import { categoryIcons } from "@/data/categoryIcons"
import { mockDiscountPercent, mockPrice } from "@/data/mockPricing"
import { productImage } from "@/data/productImages"
import type { Product } from "@/data/products"
import { earnRuleFor, redeemableFor } from "@/data/venadoMoney"
import { formatBs, packagingShort } from "@/lib/format"
import { tintForCategory } from "@/lib/categoryTint"
import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  // La card opera siempre en unidad mínima (unidad suelta); el bulto cerrado se elige en el detalle.
  const { add, setQuantity, remove, getLine } = useCart()
  const quantity = getLine(product.id, "unidad")?.quantity ?? 0

  const Icon = categoryIcons[product.categoryId]
  const photo = productImage(product)
  const logo = product.brand ? brandLogos[product.brand] : undefined
  const price = mockPrice(product)
  const discount = mockDiscountPercent(product)
  const originalPrice = discount > 0 ? price / (1 - discount / 100) : null
  const pack = packagingShort(product.packaging)
  const redeemable = redeemableFor(product.id)
  const earnRule = earnRuleFor(product)

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        quantity > 0 ? "ring-primary/40" : "ring-foreground/5",
        className
      )}
    >
      <Link
        to={`/producto/${product.id}`}
        className={cn(
          "relative block aspect-square overflow-hidden",
          photo ? "bg-card" : tintForCategory(product.categoryId)
        )}
      >
        {photo ? (
          <img
            src={photo}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 size-full object-contain p-3 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="flex size-14 items-center justify-center rounded-full bg-card/80 shadow-sm">
              {logo ? (
                <img src={logo} alt="" className="size-11 rounded-full object-contain" />
              ) : (
                Icon && <Icon className="size-7" strokeWidth={1.6} />
              )}
            </span>
            {Icon && logo && <Icon className="size-4 opacity-50" strokeWidth={1.75} />}
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground shadow-sm">
            -{discount}%
          </span>
        )}
        {earnRule && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-0.5 rounded-full bg-money-foreground px-1.5 py-0.5 text-[10px] font-bold text-card shadow-sm">
            <Coins className="size-2.5" strokeWidth={2.5} />
            {earnRule.label}
          </span>
        )}
        {redeemable && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-money px-1.5 py-0.5 text-[10px] font-bold text-money-foreground shadow-sm">
            <Coins className="size-2.5" strokeWidth={2.5} />
            {redeemable.points} pts
          </span>
        )}
        {quantity > 0 && (
          <span className="absolute top-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground shadow-sm">
            {quantity}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-0.5 p-3 pt-2.5">
        {product.brand && (
          <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
            {product.brand}
          </span>
        )}
        <Link
          to={`/producto/${product.id}`}
          className="line-clamp-2 text-[13px] leading-snug font-semibold"
        >
          {product.name}
        </Link>
        <span className="truncate text-[11px] text-muted-foreground">
          {[product.size, pack].filter(Boolean).join(" · ")}
        </span>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col leading-none">
              {originalPrice && (
                <span className="text-[11px] text-muted-foreground line-through">
                  {formatBs(originalPrice)}
                </span>
              )}
              <span className="cn-font-heading text-[15px]">{formatBs(price)}</span>
            </div>
            {quantity === 0 && (
              <button
                type="button"
                aria-label={`Agregar ${product.name}`}
                onClick={() => add(product.id)}
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md transition-all hover:bg-accent/90 active:scale-90"
              >
                <Plus className="size-4" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {quantity > 0 && (
            <div className="flex h-9 items-center justify-between rounded-full bg-primary p-1 text-primary-foreground shadow-md">
              <button
                type="button"
                aria-label={quantity > 1 ? "Quitar uno" : "Quitar del carrito"}
                onClick={() => (quantity > 1 ? setQuantity(product.id, quantity - 1) : remove(product.id))}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/15 active:scale-90"
              >
                {quantity > 1 ? (
                  <Minus className="size-4" strokeWidth={2.5} />
                ) : (
                  <Trash2 className="size-4" strokeWidth={2.25} />
                )}
              </button>
              <span className="min-w-0 flex-1 truncate text-center text-xs font-bold tabular-nums">
                {quantity} {quantity === 1 ? "unidad" : "unidades"}
              </span>
              <button
                type="button"
                aria-label="Agregar uno más"
                onClick={() => add(product.id)}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform active:scale-90"
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
