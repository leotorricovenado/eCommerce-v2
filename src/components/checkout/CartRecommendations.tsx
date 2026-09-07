import { Minus, Plus, Sparkles, Target, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { brandLogos } from "@/data/brandLogos"
import { categoryIcons } from "@/data/categoryIcons"
import { mockPrice } from "@/data/mockPricing"
import { productImage } from "@/data/productImages"
import type { Product } from "@/data/products"
import { recommendedForCart } from "@/data/recommendations"
import { strategiesFor } from "@/data/venadoMoney"
import { tintForCategory } from "@/lib/categoryTint"
import { formatBs } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"

/**
 * "Sumá a tu pedido": recomendados del cliente dentro del carrito (decisión del usuario,
 * 2026-09-04). Vienen del microservicio de estrategias igual que los del Home —
 * `recommendedForCart` en data/recommendations.ts — descartando lo que ya está en el pedido.
 *
 * La lista se congela al entrar al carrito (`useState` con inicializador): si se recalculara con
 * cada cambio del carrito, el producto que el cliente acaba de agregar desaparecería del rail bajo
 * su dedo y no podría subir la cantidad. Al agregar, la card pasa a stepper como en ProductCard.
 */
export function CartRecommendations() {
  const { lines } = useCart()
  const [items] = useState(() => recommendedForCart(lines.map((l) => l.productId)))
  if (items.length === 0) return null

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-4" strokeWidth={2.25} />
        </span>
        <div className="flex flex-col">
          <h2 className="text-base leading-tight">Sumá a tu pedido</h2>
          <p className="text-xs text-muted-foreground">Recomendados para tu negocio</p>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
        {items.map((p) => (
          <RecommendedCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

/** Card chica del rail: misma silueta que ProductCard pero compacta, para no tapar el resumen. */
function RecommendedCard({ product }: { product: Product }) {
  const { add, setQuantity, remove, getLine } = useCart()
  const quantity = getLine(product.id, "unidad")?.quantity ?? 0

  const Icon = categoryIcons[product.categoryId]
  const photo = productImage(product)
  const logo = product.brand ? brandLogos[product.brand] : undefined
  const strategy = strategiesFor(product)[0]

  return (
    <article
      className={cn(
        "flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:w-40",
        quantity > 0 ? "ring-primary/40" : "ring-foreground/5"
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
            className="absolute inset-0 size-full object-contain p-2.5 drop-shadow-md"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-card/80 shadow-sm">
              {logo ? (
                <img src={logo} alt="" className="size-9 rounded-full object-contain" />
              ) : (
                Icon && <Icon className="size-6" strokeWidth={1.6} />
              )}
            </span>
          </div>
        )}
        {strategy && (
          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-0.5 rounded-full bg-money-foreground px-1.5 py-0.5 text-[10px] font-bold text-card shadow-sm">
            <Target className="size-2.5" strokeWidth={2.5} />
            Objetivo +{strategy.points} pts
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-0.5 p-2.5 pt-2">
        {product.brand && (
          <span className="truncate text-[10px] font-bold tracking-wider text-primary uppercase">
            {product.brand}
          </span>
        )}
        <Link
          to={`/producto/${product.id}`}
          className="line-clamp-2 text-[12px] leading-snug font-semibold"
        >
          {product.name}
        </Link>
        {product.size && <span className="truncate text-[11px] text-muted-foreground">{product.size}</span>}

        <div className="mt-auto pt-2">
          {quantity === 0 ? (
            <div className="flex items-center justify-between gap-1">
              <span className="cn-font-heading text-[13px] tabular-nums">{formatBs(mockPrice(product))}</span>
              <button
                type="button"
                aria-label={`Agregar ${product.name}`}
                onClick={() => add(product.id)}
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md shadow-accent/30 transition-all hover:bg-accent/90 active:scale-90"
              >
                <Plus className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="flex h-8 items-center justify-between rounded-full bg-primary p-0.5 text-primary-foreground shadow-md shadow-primary/20">
              <button
                type="button"
                aria-label={quantity > 1 ? "Quitar uno" : "Quitar del carrito"}
                onClick={() => (quantity > 1 ? setQuantity(product.id, quantity - 1) : remove(product.id))}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/15 active:scale-90"
              >
                {quantity > 1 ? (
                  <Minus className="size-3.5" strokeWidth={2.75} />
                ) : (
                  <Trash2 className="size-3.5" strokeWidth={2.25} />
                )}
              </button>
              {/* Solo el número: "N unidades" no entra en una card de 144 px sin cortarse. */}
              <span className="min-w-0 flex-1 truncate text-center text-xs font-bold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Agregar uno más"
                onClick={() => add(product.id)}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-foreground text-primary active:scale-90"
              >
                <Plus className="size-3.5" strokeWidth={2.75} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
