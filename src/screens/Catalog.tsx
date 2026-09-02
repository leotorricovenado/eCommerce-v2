import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  BadgePercent,
  Check,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router"

import { ProductCard } from "@/components/ProductCard"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { brandFamily } from "@/data/brandFamily"
import { brandLogos } from "@/data/brandLogos"
import { brands as allBrands, categories } from "@/data/categories"
import { categoryIcons } from "@/data/categoryIcons"
import { mockDiscountPercent, mockPrice } from "@/data/mockPricing"
import { hasProductImage, productImage } from "@/data/productImages"
import { products, type Product } from "@/data/products"
import { tintForCategory } from "@/lib/categoryTint"
import { matchesQuery } from "@/lib/search"
import { useMediaQuery } from "@/lib/useMediaQuery"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 24

type SortKey = "relevancia" | "precio-asc" | "precio-desc" | "nombre"

const SORTS: { key: SortKey; label: string; icon: LucideIcon }[] = [
  { key: "relevancia", label: "Relevancia", icon: Sparkles },
  { key: "precio-asc", label: "Precio: menor a mayor", icon: ArrowUpNarrowWide },
  { key: "precio-desc", label: "Precio: mayor a menor", icon: ArrowDownWideNarrow },
  { key: "nombre", label: "Nombre A-Z", icon: ArrowDownAZ },
]

function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list]
  switch (sort) {
    case "precio-asc":
      return copy.sort((a, b) => mockPrice(a) - mockPrice(b))
    case "precio-desc":
      return copy.sort((a, b) => mockPrice(b) - mockPrice(a))
    case "nombre":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "es"))
    default:
      // Relevancia: con foto real primero, después el orden del catálogo.
      return copy.sort((a, b) => Number(hasProductImage(b)) - Number(hasProductImage(a)))
  }
}

export function Catalog() {
  const [params, setParams] = useSearchParams()
  const categoryId = params.get("categoria") ?? ""
  const subId = params.get("sub") ?? ""
  const brand = params.get("marca") ?? ""
  const onlyDeals = params.get("ofertas") === "1"
  const query = params.get("q") ?? ""
  const sort = (params.get("orden") as SortKey | null) ?? "relevancia"
  const wantsFocus = params.get("buscar") === "1"

  const [sheetOpen, setSheetOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const searchRef = useRef<HTMLInputElement>(null)
  const isDesktop = useMediaQuery("(min-width: 640px)")

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true })
    setVisible(PAGE_SIZE)
  }

  // La TopBar manda a /catalogo?buscar=1 para enfocar el buscador; el flag se consume una vez.
  useEffect(() => {
    if (!wantsFocus) return
    searchRef.current?.focus()
    const next = new URLSearchParams(params)
    next.delete("buscar")
    setParams(next, { replace: true })
  }, [wantsFocus, params, setParams])

  const category = categories.find((c) => c.id === categoryId)
  const subcategory = category?.subcategories.find((s) => s.id === subId)

  const filtered = useMemo(() => {
    let list = products
    if (category) list = list.filter((p) => p.categoryId === category.id)
    if (subcategory) list = list.filter((p) => p.subcategoryId === subcategory.id)
    if (brand) list = list.filter((p) => p.brand === brand)
    if (onlyDeals) list = list.filter((p) => mockDiscountPercent(p) > 0)
    if (query) list = list.filter((p) => matchesQuery(query, [p.name, p.brand, p.sku, p.size]))
    return sortProducts(list, sort)
  }, [category, subcategory, brand, onlyDeals, query, sort])

  const shown = filtered.slice(0, visible)
  const brandOptions = category ? category.brands : allBrands
  const activeFilterCount = [brand, onlyDeals ? "1" : "", sort !== "relevancia" ? "1" : ""].filter(
    Boolean
  ).length
  const bannerPhoto = category
    ? productImage(products.find((p) => p.categoryId === category.id && hasProductImage(p)) ?? { id: "", sku: null })
    : undefined
  const CategoryIcon = category ? categoryIcons[category.id] : undefined

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 pb-8">
      {/* Buscador */}
      <div className="flex h-12 items-center gap-2 rounded-full bg-card px-4 shadow-sm ring-1 ring-foreground/5 transition-all focus-within:ring-2 focus-within:ring-primary/40">
        <Search className="size-4 shrink-0 text-primary" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Buscar por nombre, marca o código"
          aria-label="Buscar productos"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => update({ q: null })}
            className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Banner de marca (entrada desde los logos del Home) */}
      {brand && (
        <BrandBanner
          brand={brand}
          count={products.filter((p) => p.brand === brand).length}
          categoryLabels={categories
            .filter((c) => c.brands.includes(brand))
            .map((c) => c.label)}
          onClear={() => update({ marca: null })}
        />
      )}

      {/* Categorías */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
        <CategoryChip
          active={!category}
          label="Todo"
          icon={LayoutGrid}
          tint="bg-primary/10 text-primary"
          onClick={() => update({ categoria: null, sub: null })}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            active={category?.id === c.id}
            label={c.label}
            icon={categoryIcons[c.id]!}
            tint={tintForCategory(c.id)}
            onClick={() => update({ categoria: c.id === category?.id ? null : c.id, sub: null })}
          />
        ))}
      </div>

      {/* Banner de categoría */}
      {category && (
        <div
          className={cn(
            "relative flex h-24 items-center overflow-hidden rounded-3xl px-5 ring-1 ring-foreground/5",
            tintForCategory(category.id)
          )}
        >
          <span className="pointer-events-none absolute -top-10 right-16 size-32 rounded-full bg-card/50" />
          <div className="relative z-10 flex max-w-[68%] items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card/80 shadow-sm">
              {CategoryIcon && <CategoryIcon className="size-5" strokeWidth={2} />}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="cn-font-heading truncate text-lg leading-tight text-foreground">
                {category.label}
              </span>
              <span className="truncate text-xs text-foreground/60">
                {category.productCount} productos ·{" "}
                {category.brands.length > 2 ? `${category.brands.length} marcas` : category.brands.join(", ")}
              </span>
            </div>
          </div>
          {bannerPhoto && (
            <img
              src={bannerPhoto}
              alt=""
              className="pointer-events-none absolute right-2 -bottom-3 h-[120%] w-[30%] rotate-6 object-contain drop-shadow-xl"
            />
          )}
        </div>
      )}

      {/* Subcategorías */}
      {category && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Pill active={!subcategory} onClick={() => update({ sub: null })}>
            Todas
          </Pill>
          {category.subcategories.map((s) => (
            <Pill
              key={s.id}
              active={subcategory?.id === s.id}
              onClick={() => update({ sub: s.id === subcategory?.id ? null : s.id })}
            >
              {s.label}
              <span className="ml-1 opacity-60">{s.productCount}</span>
            </Pill>
          ))}
        </div>
      )}

      {/* Resultado + filtros */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="cn-font-heading text-base leading-tight">
            {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {query ? `Resultados para "${query}"` : (subcategory?.label ?? category?.label ?? "Todo el catálogo")}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={cn(
            "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold shadow-sm ring-1 transition-all active:scale-95",
            activeFilterCount > 0
              ? "bg-primary text-primary-foreground ring-primary shadow-primary/20"
              : "bg-card ring-foreground/5 hover:ring-primary/30"
          )}
        >
          <SlidersHorizontal className="size-4" strokeWidth={2.25} />
          Filtros
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground px-1.5 text-[11px] font-bold text-primary">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filtros activos */}
      {(brand || onlyDeals || sort !== "relevancia") && (
        <div className="no-scrollbar -mx-4 -mt-1 flex gap-2 overflow-x-auto px-4">
          {brand && (
            <ActiveChip onRemove={() => update({ marca: null })}>Marca: {brand}</ActiveChip>
          )}
          {onlyDeals && <ActiveChip onRemove={() => update({ ofertas: null })}>Solo ofertas</ActiveChip>}
          {sort !== "relevancia" && (
            <ActiveChip onRemove={() => update({ orden: null })}>
              {SORTS.find((s) => s.key === sort)?.label}
            </ActiveChip>
          )}
        </div>
      )}

      {/* Grilla */}
      {shown.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">
                Mostrando {shown.length} de {filtered.length}
              </span>
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="h-11 cursor-pointer rounded-full bg-card px-6 text-sm font-bold text-primary shadow-sm ring-1 ring-primary/30 transition-all hover:bg-primary/5 active:scale-95"
              >
                Ver más productos
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-12 text-center ring-1 ring-foreground/5">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="cn-font-heading text-base">No encontramos productos</span>
            <span className="text-sm text-muted-foreground">
              Probá con otra palabra o quitá algún filtro.
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              update({ q: null, marca: null, ofertas: null, orden: null, sub: null, categoria: null })
            }
            className="h-10 cursor-pointer rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 active:scale-95"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Hoja de filtros */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          showCloseButton={false}
          className="max-h-[88vh] gap-0 overflow-y-auto rounded-t-3xl border-0 bg-background p-0 data-[side=right]:w-[400px] data-[side=right]:max-w-full data-[side=right]:max-h-none data-[side=right]:rounded-t-none data-[side=right]:rounded-l-3xl"
        >
          <SheetHeader className="flex-row items-center justify-between px-5 pt-4 pb-2">
            <div className="flex flex-col">
              <SheetTitle>Filtros y orden</SheetTitle>
              <SheetDescription>{filtered.length} productos coinciden</SheetDescription>
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setSheetOpen(false)}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-foreground/5"
            >
              <X className="size-4" />
            </button>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-5 py-3">
            <section className="flex flex-col gap-2">
              <FilterLabel>Ordenar por</FilterLabel>
              <div className="flex flex-col gap-1.5">
                {SORTS.map(({ key, label, icon: SortIcon }) => {
                  const active = sort === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => update({ orden: key === "relevancia" ? null : key })}
                      className={cn(
                        "flex h-11 cursor-pointer items-center gap-3 rounded-2xl px-3 text-sm font-medium ring-1 transition-all active:scale-[0.99]",
                        active
                          ? "bg-primary/5 text-primary ring-primary"
                          : "bg-card ring-foreground/5 hover:ring-primary/30"
                      )}
                    >
                      <SortIcon className="size-4" strokeWidth={2} />
                      <span className="flex-1 text-left">{label}</span>
                      {active && <Check className="size-4" strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <FilterLabel>Ofertas</FilterLabel>
              <button
                type="button"
                aria-pressed={onlyDeals}
                onClick={() => update({ ofertas: onlyDeals ? null : "1" })}
                className={cn(
                  "flex h-11 cursor-pointer items-center gap-3 rounded-2xl px-3 text-sm font-medium ring-1 transition-all",
                  onlyDeals
                    ? "bg-accent/10 text-accent ring-accent"
                    : "bg-card ring-foreground/5 hover:ring-accent/40"
                )}
              >
                <BadgePercent className="size-4" strokeWidth={2} />
                <span className="flex-1 text-left">Solo productos con descuento</span>
                <span
                  className={cn(
                    "flex h-6 w-10 items-center rounded-full p-0.5 transition-colors",
                    onlyDeals ? "bg-accent" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "size-5 rounded-full bg-card shadow-sm transition-transform",
                      onlyDeals && "translate-x-4"
                    )}
                  />
                </span>
              </button>
            </section>

            <section className="flex flex-col gap-2">
              <FilterLabel>Marca</FilterLabel>
              <div className="flex flex-wrap gap-2">
                <Pill active={!brand} onClick={() => update({ marca: null })}>
                  Todas
                </Pill>
                {brandOptions.map((b) => {
                  const logo = brandLogos[b]
                  return (
                    <Pill
                      key={b}
                      active={brand === b}
                      onClick={() => update({ marca: brand === b ? null : b })}
                    >
                      {logo && (
                        <img src={logo} alt="" className="-ml-1.5 size-5 rounded-full object-contain" />
                      )}
                      {b}
                    </Pill>
                  )
                })}
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 mt-auto flex gap-2 bg-background/95 px-5 py-4 backdrop-blur-md">
            <button
              type="button"
              onClick={() => update({ marca: null, ofertas: null, orden: null })}
              className="h-12 cursor-pointer rounded-full bg-card px-5 text-sm font-bold ring-1 ring-foreground/10 active:scale-95"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="h-12 flex-1 cursor-pointer rounded-full bg-accent text-sm font-bold text-accent-foreground shadow-lg shadow-accent/30 active:scale-[0.98]"
            >
              Ver {filtered.length} productos
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

interface BrandBannerProps {
  brand: string
  count: number
  categoryLabels: string[]
  onClear: () => void
}

/**
 * Banner de marca: foto "familia de productos" (fondo blanco) a la derecha, difuminada hacia el
 * texto con un degradé y hacia abajo hacia el fondo de la página, para que los productos de la
 * grilla parezcan salir del banner. Sin foto de familia cae a un banner con logo/monograma.
 */
function BrandBanner({ brand, count, categoryLabels, onClear }: BrandBannerProps) {
  const family = brandFamily[brand]
  const logo = brandLogos[brand]
  return (
    <div className="relative -mx-4 overflow-hidden bg-card sm:mx-0 sm:rounded-3xl sm:ring-1 sm:ring-foreground/5">
      <div className="relative flex h-48 items-stretch sm:h-64">
        {family ? (
          <img
            src={family}
            alt={`Productos ${brand}`}
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-[62%] object-cover object-[center_35%] sm:w-[55%] sm:object-contain sm:object-right"
          />
        ) : (
          <span className={cn("absolute inset-y-0 right-0 w-[50%]", tintForCategory(brand))} />
        )}
        {/* Difuminación horizontal (hacia el texto) y vertical (hacia la página) */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card from-35% via-card/85 via-55% to-transparent to-80%" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex w-[60%] flex-col justify-center gap-2 px-5 sm:w-[50%] sm:px-7">
          <div className="flex items-center gap-2.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card p-0.5 shadow-md ring-2 ring-background">
              {logo ? (
                <img src={logo} alt="" className="size-full rounded-full object-contain" />
              ) : (
                <span className="cn-font-heading text-base">{brand[0]}</span>
              )}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
              Marca oficial
            </span>
          </div>
          <h2 className="text-2xl leading-none sm:text-3xl">{brand}</h2>
          <p className="text-xs text-muted-foreground">
            {count} {count === 1 ? "producto" : "productos"}
            {categoryLabels.length > 0 && ` · ${categoryLabels.slice(0, 3).join(", ")}`}
            {categoryLabels.length > 3 && ` y ${categoryLabels.length - 3} más`}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="mt-1 flex w-fit cursor-pointer items-center gap-1 rounded-full bg-background/80 py-1.5 pr-3 pl-2 text-[11px] font-semibold ring-1 ring-foreground/10 backdrop-blur transition-all hover:ring-primary/40 active:scale-95"
          >
            <X className="size-3" strokeWidth={3} />
            Ver todas las marcas
          </button>
        </div>
      </div>
    </div>
  )
}

interface CategoryChipProps {
  active: boolean
  label: string
  icon: LucideIcon
  tint: string
  onClick: () => void
}

function CategoryChip({ active, label, icon: Icon, tint, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex shrink-0 cursor-pointer items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-[13px] font-semibold whitespace-nowrap shadow-sm ring-1 transition-all active:scale-95",
        active
          ? "bg-primary text-primary-foreground ring-primary shadow-primary/20"
          : "bg-card ring-foreground/5 hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full",
          active ? "bg-primary-foreground/20 text-primary-foreground" : tint
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.25} />
      </span>
      {label}
    </button>
  )
}

function Pill({
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
        "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold whitespace-nowrap ring-1 transition-all active:scale-95",
        active
          ? "bg-foreground text-background ring-foreground"
          : "bg-card ring-foreground/10 hover:ring-primary/40"
      )}
    >
      {children}
    </button>
  )
}

function ActiveChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary/10 pr-1.5 pl-3 text-xs font-semibold whitespace-nowrap text-primary">
      {children}
      <button
        type="button"
        aria-label="Quitar filtro"
        onClick={onRemove}
        className="flex size-5 cursor-pointer items-center justify-center rounded-full bg-primary/15 hover:bg-primary/25"
      >
        <X className="size-3" strokeWidth={3} />
      </button>
    </span>
  )
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
      {children}
    </span>
  )
}
