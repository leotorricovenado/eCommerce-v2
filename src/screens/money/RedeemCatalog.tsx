import { ArrowRight, Coins, LayoutGrid } from "lucide-react"
import { Link, useSearchParams } from "react-router"

import { PointsPill } from "@/components/money/PointsUI"
import { RedeemProductCard } from "@/components/money/RedeemProductCard"
import { categoryIcons } from "@/data/categoryIcons"
import { redeemCategories, redeemables } from "@/data/venadoMoney"
import { tintForCategory } from "@/lib/categoryTint"
import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"
import { usePoints } from "@/state/points"

export function RedeemCatalog() {
  const [params, setParams] = useSearchParams()
  const categoryId = params.get("categoria") ?? ""
  const { balance } = usePoints()
  const { quote } = useCart()
  const list = categoryId ? redeemables.filter((r) => r.product.categoryId === categoryId) : redeemables
  const remaining = balance - quote.pointsCost

  const select = (id: string | null) => {
    const next = new URLSearchParams(params)
    if (id) next.set("categoria", id)
    else next.delete("categoria")
    setParams(next, { replace: true })
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 pb-24">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-money-foreground uppercase">
            <Coins className="size-3.5" strokeWidth={2.5} />
            Venado Money
          </span>
          <h1 className="text-2xl leading-none">Canjeá productos</h1>
        </div>
        <PointsPill points={remaining} size="md" />
      </div>
      <p className="text-xs text-muted-foreground">
        Los canjes se agregan a tu carrito y viajan con tu próximo pedido, sin costo en Bs.
        {quote.pointsCost > 0 && ` Ya tenés ${quote.pointsCost.toLocaleString("es-BO")} pts en canjes.`}
      </p>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
        <Chip active={!categoryId} label="Todo" icon={LayoutGrid} tint="bg-money/15 text-money-foreground" onClick={() => select(null)} />
        {redeemCategories.map((c) => (
          <Chip
            key={c.id}
            active={categoryId === c.id}
            label={c.label}
            icon={categoryIcons[c.id]!}
            tint={tintForCategory(c.id)}
            onClick={() => select(categoryId === c.id ? null : c.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((r) => (
          <RedeemProductCard key={r.product.id} item={r} />
        ))}
      </div>

      {quote.pointsCost > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pt-6 pb-3">
          <Link
            to="/carrito"
            className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between rounded-full bg-money-foreground px-5 text-sm font-bold text-card shadow-lg transition-all active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              Ver carrito
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </span>
            <span className="tabular-nums">{quote.pointsCost.toLocaleString("es-BO")} pts en canjes</span>
          </Link>
        </div>
      )}
    </div>
  )
}

function Chip({
  active,
  label,
  icon: Icon,
  tint,
  onClick,
}: {
  active: boolean
  label: string
  icon: typeof LayoutGrid
  tint: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex shrink-0 cursor-pointer items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-[13px] font-semibold whitespace-nowrap shadow-sm ring-1 transition-all active:scale-95",
        active ? "bg-money-foreground text-card ring-money-foreground" : "bg-card ring-foreground/5 hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <span className={cn("flex size-7 items-center justify-center rounded-full", active ? "bg-card/20 text-card" : tint)}>
        <Icon className="size-3.5" strokeWidth={2.25} />
      </span>
      {label}
    </button>
  )
}
