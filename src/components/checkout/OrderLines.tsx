import { Coins, Gift } from "lucide-react"

import { categoryIcons } from "@/data/categoryIcons"
import type { Quote } from "@/data/priceRules"
import { productImage } from "@/data/productImages"
import type { Product } from "@/data/products"
import { formatBs, parsePackaging } from "@/lib/format"
import { tintForCategory } from "@/lib/categoryTint"
import { cn } from "@/lib/utils"

export function ProductThumb({ product, className }: { product: Product; className?: string }) {
  const photo = productImage(product)
  const Icon = categoryIcons[product.categoryId]
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl",
        photo ? "bg-card ring-1 ring-foreground/5" : tintForCategory(product.categoryId),
        className
      )}
    >
      {photo ? (
        <img src={photo} alt="" className="size-full object-contain p-1.5" />
      ) : (
        Icon && <Icon className="size-5 opacity-70" strokeWidth={1.75} />
      )}
    </span>
  )
}

export function unitLabel(product: Product, unit: "unidad" | "caja", quantity: number): string {
  if (unit === "unidad") return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`
  const pack = parsePackaging(product.packaging)
  const name = (pack?.container ?? "bulto").toLowerCase()
  const plural = quantity === 1 ? name : name.endsWith("n") ? `${name}es` : `${name}s`
  return `${quantity} ${plural}${pack ? ` · ${quantity * pack.units} unidades` : ""}`
}

/** Lista compacta de líneas + bonificaciones de una cotización (pago, estado del pedido). */
export function OrderLines({ quote }: { quote: Quote }) {
  return (
    <ul className="flex flex-col gap-3">
      {quote.lines.map((l) => (
        <li key={`${l.productId}-${l.unit}`} className="flex items-center gap-3">
          <ProductThumb product={l.product} className="size-12" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold">{l.product.name}</span>
            <span className="text-[11px] text-muted-foreground">
              {[l.product.size, unitLabel(l.product, l.unit, l.quantity)].filter(Boolean).join(" · ")}
            </span>
          </div>
          <div className="flex flex-col items-end leading-none">
            {l.discount > 0 && (
              <span className="text-[11px] text-muted-foreground line-through">{formatBs(l.gross)}</span>
            )}
            <span className="text-[13px] font-bold tabular-nums">{formatBs(l.net)}</span>
          </div>
        </li>
      ))}
      {quote.redeems.map((r) => (
        <li key={`redeem-${r.productId}`} className="flex items-center gap-3 rounded-2xl bg-money/10 p-2 ring-1 ring-money/30">
          <ProductThumb product={r.product} className="size-10" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-money-foreground uppercase">
              <Coins className="size-3" strokeWidth={2.5} />
              Canje Venado Money
            </span>
            <span className="truncate text-[13px] font-semibold">{r.product.name}</span>
            <span className="text-[11px] text-muted-foreground">
              {r.quantity} {r.quantity === 1 ? "unidad" : "unidades"} · {r.pointsEach.toLocaleString("es-BO")} pts c/u
            </span>
          </div>
          <span className="text-[13px] font-bold text-money-foreground tabular-nums">−{r.pointsTotal.toLocaleString("es-BO")} pts</span>
        </li>
      ))}
      {quote.bonuses.map((b) => (
        <li
          key={`bonus-${b.product.id}-${b.ruleId}`}
          className="flex items-center gap-3 rounded-2xl bg-success/10 p-2 ring-1 ring-success/20"
        >
          <ProductThumb product={b.product} className="size-10" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-success uppercase">
              <Gift className="size-3" strokeWidth={2.5} />
              Bonificación
            </span>
            <span className="truncate text-[13px] font-semibold">{b.product.name}</span>
            <span className="text-[11px] text-muted-foreground">
              {b.quantity} {b.quantity === 1 ? "unidad" : "unidades"} de regalo
            </span>
          </div>
          <span className="text-[13px] font-bold text-success">Gratis</span>
        </li>
      ))}
    </ul>
  )
}
