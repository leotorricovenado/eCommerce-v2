import { AlertTriangle, ArrowRight, Coins, Gift, Minus, Plus, ShoppingCart, Sparkles, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router"

import { CheckoutSteps } from "@/components/checkout/CheckoutSteps"
import { ProductThumb } from "@/components/checkout/OrderLines"
import { QuoteSummary } from "@/components/checkout/QuoteSummary"
import { formatPts } from "@/components/money/PointsUI"
import { pointsForNet } from "@/data/venadoMoney"
import { usePoints } from "@/state/points"
import type { QuoteLine, RedeemLine } from "@/data/priceRules"
import { formatBs, parsePackaging } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCart } from "@/state/cart"

export function Cart() {
  const navigate = useNavigate()
  const { quote, add, setQuantity, setUnit, remove, setRedeemQuantity, removeRedeem } = useCart()
  const { balance, tier } = usePoints()
  const pointsEarned = pointsForNet(quote.net, tier)
  const pointsMissing = Math.max(0, quote.pointsCost - balance)
  const canContinue = pointsMissing === 0

  if (quote.lines.length === 0 && quote.redeems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingCart className="size-9" strokeWidth={1.75} />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl">Tu carrito está vacío</h1>
          <p className="text-sm text-muted-foreground">
            Agregá productos del catálogo para armar tu pedido.
          </p>
        </div>
        <Link
          to="/catalogo"
          className="flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/30 active:scale-95"
        >
          Ir al catálogo
          <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-3 pb-24">
      <div className="flex flex-col gap-3">
        <CheckoutSteps current={1} />
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-2xl leading-none">Tu pedido</h1>
          <span className="text-xs text-muted-foreground">
            {quote.lines.length} {quote.lines.length === 1 ? "producto" : "productos"} ·{" "}
            {quote.itemCount} {quote.itemCount === 1 ? "ítem" : "ítems"}
          </span>
        </div>
      </div>

      {/* Nudges de bonificación */}
      {quote.hints.map((h) => (
        <div
          key={`${h.product.id}-${h.ruleId}`}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-warning/25 to-warning/10 p-3 ring-1 ring-warning/40"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-warning shadow-sm">
            <Sparkles className="size-4" strokeWidth={2.25} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[13px] leading-snug font-semibold">
              Te faltan {h.missingUnits} {h.missingUnits === 1 ? "unidad" : "unidades"} de{" "}
              {h.product.name}
            </span>
            <span className="text-[11px] text-muted-foreground">y te llevás {h.reward}</span>
          </div>
          <button
            type="button"
            onClick={() => add(h.product.id, h.missingUnits, "unidad")}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-foreground px-3 text-xs font-bold text-background shadow-md active:scale-95"
          >
            <Plus className="size-3.5" strokeWidth={3} />
            {h.missingUnits}
          </button>
        </div>
      ))}

      {/* Líneas */}
      <div className="flex flex-col gap-3">
        {quote.lines.map((l) => (
          <CartLineCard
            key={`${l.productId}-${l.unit}`}
            line={l}
            onQuantity={(q) => setQuantity(l.productId, q, l.unit)}
            onUnit={(u) => setUnit(l.productId, l.unit, u)}
            onRemove={() => remove(l.productId, l.unit)}
          />
        ))}

        {quote.bonuses.map((b) => (
          <div
            key={`bonus-${b.product.id}-${b.ruleId}`}
            className="flex items-center gap-3 rounded-3xl bg-success/10 p-3 ring-2 ring-success/40"
          >
            <ProductThumb product={b.product} className="size-16" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-success uppercase">
                <Gift className="size-3" strokeWidth={2.5} />
                Bonificación por tu pedido
              </span>
              <span className="truncate text-sm font-semibold">{b.product.name}</span>
              <span className="text-[11px] text-muted-foreground">
                {b.quantity} {b.quantity === 1 ? "unidad" : "unidades"} · por llevar {b.triggeredBy.name}
              </span>
            </div>
            <span className="cn-font-heading text-sm text-success">Gratis</span>
          </div>
        ))}
      </div>

      {/* Canjes con puntos (Venado Money) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <h2 className="flex items-center gap-1.5 text-base">
              <Coins className="size-4 text-money-foreground" strokeWidth={2.5} />
              Canjes con puntos
            </h2>
            <span className="text-xs text-muted-foreground">
              {quote.pointsCost > 0
                ? `Usás ${formatPts(quote.pointsCost)} de ${formatPts(balance)}`
                : `Tenés ${formatPts(balance)} para canjear productos`}
            </span>
          </div>
          <Link to="/puntos/canjear" className="text-xs font-semibold text-money-foreground hover:underline">
            {quote.redeems.length > 0 ? "Agregar más" : "Ver canjeables"}
          </Link>
        </div>
        {quote.redeems.map((r) => (
          <RedeemLineCard
            key={`redeem-${r.productId}`}
            line={r}
            onQuantity={(q) => setRedeemQuantity(r.productId, q)}
            onRemove={() => removeRedeem(r.productId)}
          />
        ))}
        {pointsMissing > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-accent/10 p-3 text-[13px] ring-1 ring-accent/30">
            <AlertTriangle className="size-4 shrink-0 text-accent" strokeWidth={2.25} />
            <span>
              Te faltan <strong>{formatPts(pointsMissing)}</strong> para estos canjes. Quitá alguno o seguí sumando puntos.
            </span>
          </div>
        )}
      </section>

      <QuoteSummary quote={quote} pointsEarned={pointsEarned} />

      <Link to="/catalogo" className="text-center text-xs font-semibold text-primary">
        Seguir comprando
      </Link>

      {/* CTA sticky (arriba del bottom nav) */}
      <div className="fixed inset-x-0 bottom-16 z-30 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pt-6 pb-3">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => navigate("/checkout/entrega")}
          className="mx-auto flex h-12 w-full max-w-3xl cursor-pointer items-center justify-between rounded-full bg-accent px-5 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            Continuar
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </span>
          <span className="tabular-nums">
            {quote.net > 0 ? formatBs(quote.net) : `${formatPts(quote.pointsCost)}`}
            {quote.net > 0 && quote.pointsCost > 0 && ` + ${formatPts(quote.pointsCost)}`}
          </span>
        </button>
      </div>
    </div>
  )
}

interface CartLineCardProps {
  line: QuoteLine
  onQuantity: (q: number) => void
  onUnit: (u: "unidad" | "caja") => void
  onRemove: () => void
}

function CartLineCard({ line, onQuantity, onUnit, onRemove }: CartLineCardProps) {
  const { product, unit, quantity } = line
  const pack = parsePackaging(product.packaging)
  const hasBulk = (pack?.units ?? 1) > 1
  return (
    <article className="flex gap-3 rounded-3xl bg-card p-3 ring-1 ring-foreground/5">
      <Link to={`/producto/${product.id}`}>
        <ProductThumb product={product} className="size-20" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            {product.brand && (
              <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                {product.brand}
              </span>
            )}
            <Link to={`/producto/${product.id}`} className="truncate text-[13px] leading-snug font-semibold">
              {product.name}
            </Link>
            <span className="text-[11px] text-muted-foreground">
              {product.size} · {formatBs(line.itemPrice)} c/{unit === "caja" ? (pack?.container.toLowerCase() ?? "caja") : "u"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Quitar del carrito"
            onClick={onRemove}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        {hasBulk && pack && (
          <div className="flex w-fit rounded-full bg-muted p-0.5 text-[11px] font-semibold">
            <UnitPill active={unit === "unidad"} onClick={() => onUnit("unidad")}>
              Unidad
            </UnitPill>
            <UnitPill active={unit === "caja"} onClick={() => onUnit("caja")}>
              {pack.container} x{pack.units}
            </UnitPill>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex h-8 items-center rounded-full bg-primary p-0.5 text-primary-foreground shadow-md shadow-primary/20">
            <button
              type="button"
              aria-label="Quitar uno"
              onClick={() => onQuantity(quantity - 1)}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/15 active:scale-90"
            >
              {quantity > 1 ? (
                <Minus className="size-3.5" strokeWidth={2.75} />
              ) : (
                <Trash2 className="size-3.5" strokeWidth={2.25} />
              )}
            </button>
            <span className="w-7 text-center text-xs font-bold tabular-nums">{quantity}</span>
            <button
              type="button"
              aria-label="Agregar uno"
              onClick={() => onQuantity(quantity + 1)}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary-foreground text-primary active:scale-90"
            >
              <Plus className="size-3.5" strokeWidth={2.75} />
            </button>
          </div>
          <div className="flex flex-col items-end leading-none">
            {line.discount > 0 && (
              <span className="text-[11px] text-muted-foreground line-through">{formatBs(line.gross)}</span>
            )}
            <span className="cn-font-heading text-[15px] tabular-nums">{formatBs(line.net)}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function RedeemLineCard({ line, onQuantity, onRemove }: { line: RedeemLine; onQuantity: (q: number) => void; onRemove: () => void }) {
  const { product, quantity } = line
  return (
    <article className="flex gap-3 rounded-3xl bg-money/10 p-3 ring-2 ring-money/40">
      <Link to={`/producto/${product.id}`}>
        <ProductThumb product={product} className="size-20 bg-card" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-money-foreground uppercase">
              <Coins className="size-3" strokeWidth={2.5} />
              Canje Venado Money
            </span>
            <Link to={`/producto/${product.id}`} className="truncate text-[13px] leading-snug font-semibold">
              {product.name}
            </Link>
            <span className="text-[11px] text-muted-foreground">
              {product.size} · {formatPts(line.pointsEach)} c/u · sin costo en Bs
            </span>
          </div>
          <button
            type="button"
            aria-label="Quitar canje"
            onClick={onRemove}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex h-8 items-center rounded-full bg-money-foreground p-0.5 text-card shadow-md">
            <button
              type="button"
              aria-label="Quitar uno"
              onClick={() => onQuantity(quantity - 1)}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-card/15 active:scale-90"
            >
              {quantity > 1 ? <Minus className="size-3.5" strokeWidth={2.75} /> : <Trash2 className="size-3.5" strokeWidth={2.25} />}
            </button>
            <span className="w-7 text-center text-xs font-bold tabular-nums">{quantity}</span>
            <button
              type="button"
              aria-label="Agregar uno"
              onClick={() => onQuantity(quantity + 1)}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-money text-money-foreground active:scale-90"
            >
              <Plus className="size-3.5" strokeWidth={2.75} />
            </button>
          </div>
          <span className="cn-font-heading text-[15px] text-money-foreground tabular-nums">−{formatPts(line.pointsTotal)}</span>
        </div>
      </div>
    </article>
  )
}

function UnitPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full px-2.5 py-1 transition-all",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
