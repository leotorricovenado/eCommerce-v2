import {
  Barcode,
  Boxes,
  CalendarClock,
  Check,
  ChevronRight,
  Coins,
  Minus,
  Package,
  Plus,
  QrCode,
  Ruler,
  ShoppingCart,
  Tag,
  Target,
  Truck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"

import { ProductCard } from "@/components/ProductCard"
import { brandLogos } from "@/data/brandLogos"
import { categories } from "@/data/categories"
import { categoryIcons } from "@/data/categoryIcons"
import { mockPrice } from "@/data/mockPricing"
import { formatGoalAmount, goalHeadline, goalStatus, redeemableFor, strategiesFor } from "@/data/venadoMoney"
import { formatPts } from "@/components/money/PointsUI"
import { GoalBar, GoalProgressText } from "@/components/money/GoalUI"
import { usePoints } from "@/state/points"
import { hasProductImage, productImage } from "@/data/productImages"
import { products } from "@/data/products"
import { formatBs, parsePackaging } from "@/lib/format"
import { tintForCategory } from "@/lib/categoryTint"
import { cn } from "@/lib/utils"
import { unitPrice, unitsPer, useCart, type CartUnit } from "@/state/cart"

export function ProductDetail() {
  const { productId } = useParams()
  // `key` remonta la vista al cambiar de producto (ej. tocar "otra presentación"): la selección
  // de unidad/cantidad arranca limpia sin sincronizar estado a mano.
  return <ProductDetailView key={productId} productId={productId} />
}

function ProductDetailView({ productId }: { productId: string | undefined }) {
  const product = products.find((p) => p.id === productId)
  const { add, lines, addRedeem, getRedeem } = useCart()
  const { balance, goals, tier } = usePoints()

  const [unit, setUnit] = useState<CartUnit>("unidad")
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    if (!justAdded) return
    const t = window.setTimeout(() => setJustAdded(false), 1600)
    return () => window.clearTimeout(t)
  }, [justAdded])

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Package className="size-6 text-muted-foreground" />
        </span>
        <h1 className="text-base">Producto no encontrado</h1>
        <p className="text-sm text-muted-foreground">Puede que ya no esté en el catálogo.</p>
        <Link to="/catalogo" className="text-sm font-semibold text-primary">
          Ir al catálogo
        </Link>
      </div>
    )
  }

  const category = categories.find((c) => c.id === product.categoryId)
  const subcategory = category?.subcategories.find((s) => s.id === product.subcategoryId)
  const Icon = categoryIcons[product.categoryId]
  const photo = productImage(product)
  const logo = product.brand ? brandLogos[product.brand] : undefined
  const tint = tintForCategory(product.categoryId)

  const basePrice = mockPrice(product)
  const pack = parsePackaging(product.packaging)
  const hasBulk = (pack?.units ?? 1) > 1
  const selectedPrice = unitPrice(product, unit)
  const total = selectedPrice * qty

  const inCart = lines.filter((l) => l.productId === product.id)
  const inCartUnits = inCart.reduce((acc, l) => acc + l.quantity * unitsPer(product, l.unit), 0)

  // Mismo producto en otra presentación (mismo nombre, distinto tamaño) — dato real del catálogo.
  const variants = products.filter((p) => p.name === product.name && p.id !== product.id)
  // Relacionados: misma subcategoría primero, misma categoría después; con foto primero.
  const related = [
    ...products.filter(
      (p) => p.subcategoryId === product.subcategoryId && p.name !== product.name
    ),
    ...products.filter(
      (p) => p.categoryId === product.categoryId && p.subcategoryId !== product.subcategoryId
    ),
  ]
    .sort((a, b) => Number(hasProductImage(b)) - Number(hasProductImage(a)))
    .slice(0, 8)

  const specs = [
    { icon: Package, label: "Presentación", value: product.packaging },
    { icon: Ruler, label: "Tamaño", value: product.size },
    { icon: CalendarClock, label: "Vida útil", value: product.shelfLife },
    { icon: Barcode, label: "Código", value: product.sku },
    { icon: Tag, label: "Marca", value: product.brand },
    { icon: Boxes, label: "Categoría", value: subcategory?.label ?? category?.label ?? null },
  ].filter((s) => s.value)

  const unitLabel = (u: CartUnit, n: number) =>
    u === "caja"
      ? `${n} ${(pack?.container ?? "bulto").toLowerCase()}${n === 1 ? "" : pack?.container.toLowerCase().endsWith("n") ? "es" : "s"}`
      : `${n} ${n === 1 ? "unidad" : "unidades"}`

  return (
    <div className="pb-36">
      <div className="sm:grid sm:grid-cols-2 sm:gap-6 sm:px-4 sm:pt-2">
        {/* Galería */}
        <div className="px-4 pt-1 sm:px-0">
          <div
            className={cn(
              "relative aspect-square overflow-hidden rounded-3xl ring-1 ring-foreground/5",
              photo ? "bg-gradient-to-b from-muted to-card" : tint
            )}
          >
            <span className="pointer-events-none absolute -top-10 -left-10 size-48 rounded-full bg-card/60" />
            <span className="pointer-events-none absolute -right-12 -bottom-12 size-56 rounded-full bg-card/50" />
            {photo ? (
              <img
                src={photo}
                alt={product.name}
                className="absolute inset-0 size-full object-contain p-8 drop-shadow-2xl"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="flex size-28 items-center justify-center rounded-full bg-card/80 shadow-md">
                  {logo ? (
                    <img src={logo} alt="" className="size-24 rounded-full object-contain" />
                  ) : (
                    Icon && <Icon className="size-12" strokeWidth={1.5} />
                  )}
                </span>
                <span className="text-xs font-medium opacity-70">Foto en camino</span>
              </div>
            )}
            {logo && photo && (
              <span className="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full bg-card p-1 shadow-md">
                <img src={logo} alt={product.brand ?? ""} className="size-full rounded-full object-contain" />
              </span>
            )}
          </div>
        </div>

        {/* Info principal */}
        <div className="flex flex-col gap-4 px-4 pt-5 sm:px-0 sm:pt-1">
          <div className="flex flex-col gap-1.5">
            <nav className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              {category && (
                <Link to={`/catalogo?categoria=${category.id}`} className="hover:text-primary">
                  {category.label}
                </Link>
              )}
              {subcategory && (
                <>
                  <ChevronRight className="size-3" />
                  <Link
                    to={`/catalogo?categoria=${category!.id}&sub=${subcategory.id}`}
                    className="hover:text-primary"
                  >
                    {subcategory.label}
                  </Link>
                </>
              )}
            </nav>
            {product.brand && (
              <Link
                to={`/catalogo?marca=${encodeURIComponent(product.brand)}`}
                className="text-xs font-bold tracking-wider text-primary uppercase"
              >
                {product.brand}
              </Link>
            )}
            <h1 className="text-2xl leading-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[product.size, product.sku ? `Cód. ${product.sku}` : null].filter(Boolean).join(" · ")}
            </p>
          </div>

          {/* Precio */}
          <div className="flex items-end gap-3">
            <div className="flex flex-col leading-none">
              <span className="cn-font-heading text-3xl">{formatBs(selectedPrice)}</span>
              <span className="mt-1 text-xs text-muted-foreground">
                {unit === "caja"
                  ? `por ${pack!.container.toLowerCase()} · ${formatBs(basePrice)} c/u`
                  : "por unidad · precio mayorista"}
              </span>
            </div>
          </div>

          {/* Unidad de venta: mínima (unidad) / máxima (bulto cerrado) */}
          {hasBulk && pack && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                ¿Cómo lo querés?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <UnitOption
                  active={unit === "unidad"}
                  onClick={() => {
                    setUnit("unidad")
                    setQty(1)
                  }}
                  title="Por unidad"
                  subtitle="Unidad mínima"
                  price={`${formatBs(basePrice)} c/u`}
                />
                <UnitOption
                  active={unit === "caja"}
                  onClick={() => {
                    setUnit("caja")
                    setQty(1)
                  }}
                  title={`Por ${pack.container.toLowerCase()}`}
                  subtitle={pack.breakdown ?? `${pack.units} unidades`}
                  price={`${formatBs(unitPrice(product, "caja"))} c/${pack.container.toLowerCase()}`}
                />
              </div>
              {pack.breakdown && (
                <p className="text-[11px] text-muted-foreground">
                  {pack.container} cerrada = {pack.breakdown} = {pack.units} unidades.
                </p>
              )}
            </div>
          )}

          {/* Objetivos de Venado Money a los que aporta este producto (con su progreso real). */}
          {strategiesFor(product)
            .map((s) => goalStatus(s, goals))
            .filter((g) => !g.done)
            .map((g) => (
              <div key={g.strategy.id} className="flex flex-col gap-2 rounded-2xl bg-money/15 p-3 ring-1 ring-money/40">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-money text-money-foreground">
                    <Target className="size-4" strokeWidth={2.5} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="text-[13px] font-semibold">{goalHeadline(g.strategy)}</span>
                    <span className="text-[11px] text-muted-foreground">
                      Te faltan {formatGoalAmount(g.missing)} para ganar{" "}
                      {formatPts(Math.floor(g.strategy.points * tier.multiplier))}
                    </span>
                  </span>
                </div>
                <GoalBar status={g} />
                <GoalProgressText status={g} />
              </div>
            ))}

          {/* Canje con Venado Money */}
          {(() => {
            const redeemable = redeemableFor(product.id)
            if (!redeemable) return null
            const inCart = getRedeem(product.id)?.quantity ?? 0
            const canRedeem = balance >= redeemable.points * (inCart + 1)
            return (
              <div className="flex items-center gap-3 rounded-2xl bg-money/15 p-3 ring-1 ring-money/30">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-money text-money-foreground">
                  <Coins className="size-4" strokeWidth={2.5} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="text-[13px] font-semibold">Canjealo por {formatPts(redeemable.points)}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {inCart > 0 ? `${inCart} en tu carrito · ` : ""}Tenés {formatPts(balance)}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!canRedeem}
                  onClick={() => addRedeem(product.id)}
                  className="h-9 shrink-0 cursor-pointer rounded-full bg-money-foreground px-3.5 text-xs font-bold text-card shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {canRedeem ? "Canjear" : "Sin puntos"}
                </button>
              </div>
            )
          })()}

          {/* Confianza */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Truck, label: "Entrega en tu negocio" },
              { icon: QrCode, label: "Pagás con QR al confirmar" },
            ].map(({ icon: TrustIcon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 ring-1 ring-foreground/5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrustIcon className="size-3.5" strokeWidth={2} />
                </span>
                <span className="text-[11px] leading-tight font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-7 px-4 pt-7">
        {/* Otras presentaciones (dato real: mismo nombre, otro tamaño) */}
        {variants.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-base">Otras presentaciones</h2>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              <span className="flex shrink-0 items-center rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20">
                {product.size ?? "Esta"}
              </span>
              {variants.map((v) => (
                <Link
                  key={v.id}
                  to={`/producto/${v.id}`}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-card py-1.5 pr-3.5 pl-1.5 text-xs font-semibold shadow-sm ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {productImage(v) ? (
                      <img src={productImage(v)} alt="" className="size-full object-contain p-0.5" />
                    ) : (
                      Icon && <Icon className="size-3.5 opacity-60" />
                    )}
                  </span>
                  {v.size ?? v.sku}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Ficha (solo datos reales del catálogo) */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base">Ficha del producto</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {specs.map(({ icon: SpecIcon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-2.5 rounded-2xl bg-card p-3 ring-1 ring-foreground/5"
              >
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl", tint)}>
                  <SpecIcon className="size-4" strokeWidth={2} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {label}
                  </span>
                  <span className="text-[13px] leading-snug font-semibold break-words">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Relacionados */}
        {related.length > 0 && (
          <section>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-base">Te puede interesar</h2>
                <p className="text-xs text-muted-foreground">
                  Más de {subcategory?.label ?? category?.label}
                </p>
              </div>
              {category && (
                <Link
                  to={`/catalogo?categoria=${category.id}`}
                  className="flex items-center gap-0.5 text-xs font-semibold text-primary"
                >
                  Ver todo
                  <ChevronRight className="size-3.5" />
                </Link>
              )}
            </div>
            <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pt-1 pb-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} className="w-40 shrink-0 snap-start" />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Barra de compra sticky */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 pt-2 pb-4">
          {inCart.length > 0 && (
            <Link
              to="/carrito"
              className="flex items-center gap-2 rounded-2xl bg-success/10 px-3 py-2 text-xs font-medium text-foreground ring-1 ring-success/20"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-success text-primary-foreground">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1 truncate">
                En tu carrito: {inCart.map((l) => unitLabel(l.unit, l.quantity)).join(" + ")}
                {inCart.some((l) => l.unit === "caja") && ` (${inCartUnits} unidades)`}
              </span>
              <span className="flex shrink-0 items-center gap-0.5 font-bold text-primary">
                Ver carrito
                <ChevronRight className="size-3.5" />
              </span>
            </Link>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-12 items-center rounded-full bg-card p-1 shadow-sm ring-1 ring-foreground/10">
              <button
                type="button"
                aria-label="Quitar uno"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus className="size-4" strokeWidth={2.5} />
              </button>
              <span className="w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
              <button
                type="button"
                aria-label="Agregar uno"
                onClick={() => setQty((q) => q + 1)}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted"
              >
                <Plus className="size-4" strokeWidth={2.5} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                add(product.id, qty, unit)
                setJustAdded(true)
                setQty(1)
              }}
              className={cn(
                "flex h-12 flex-1 cursor-pointer items-center justify-between rounded-full px-5 text-sm font-bold shadow-lg transition-all active:scale-[0.98]",
                justAdded
                  ? "bg-success text-primary-foreground shadow-success/30"
                  : "bg-accent text-accent-foreground shadow-accent/30 hover:bg-accent/90"
              )}
            >
              {justAdded ? (
                <>
                  <span className="flex items-center gap-2">
                    <Check className="size-4" strokeWidth={3} />
                    Agregado
                  </span>
                  <span className="text-xs font-semibold opacity-90">{unitLabel(unit, 1)}</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="size-4" strokeWidth={2.5} />
                    Agregar
                  </span>
                  <span className="tabular-nums">{formatBs(total)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface UnitOptionProps {
  active: boolean
  onClick: () => void
  title: string
  subtitle: string
  price: string
}

function UnitOption({ active, onClick, title, subtitle, price }: UnitOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex cursor-pointer flex-col items-start gap-0.5 rounded-2xl p-3 text-left ring-2 transition-all active:scale-[0.98]",
        active
          ? "bg-primary/5 ring-primary shadow-md shadow-primary/10"
          : "bg-card ring-foreground/5 hover:ring-primary/30"
      )}
    >
      <span className="flex w-full items-center justify-between">
        <span className={cn("text-sm font-bold", active && "text-primary")}>{title}</span>
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-full ring-2",
            active ? "bg-primary ring-primary" : "ring-foreground/20"
          )}
        >
          {active && <Check className="size-2.5 text-primary-foreground" strokeWidth={4} />}
        </span>
      </span>
      <span className="text-[11px] text-muted-foreground">{subtitle}</span>
      <span className="mt-1 text-xs font-semibold">{price}</span>
    </button>
  )
}
