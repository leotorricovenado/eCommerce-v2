import { BadgePercent, QrCode, Truck } from "lucide-react"
import { Link } from "react-router"

import { BrandRail } from "@/components/home/BrandRail"
import { CategoryShowcase } from "@/components/home/CategoryShowcase"
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel"
import { PointsCard } from "@/components/home/PointsCard"
import { SectionHeader } from "@/components/home/SectionHeader"
import { ProductCard } from "@/components/ProductCard"
import { brands, categories, type Category } from "@/data/categories"
import { mockDiscountPercent } from "@/data/mockPricing"
import { hasProductImage, productImage } from "@/data/productImages"
import { products, type Product } from "@/data/products"

const productById = (id: string): Product => products.find((p) => p.id === id)!
const photoOf = (id: string) => productImage(productById(id))!

const heroSlides: HeroSlide[] = [
  {
    id: "salsas",
    eyebrow: "Directo de fábrica",
    title: "Las salsas N°1 de los bolivianos, en tu negocio",
    subtitle: "Reservá, pagá con QR y recibí en tu punto de entrega.",
    cta: "Pedir ahora",
    to: "/catalogo?categoria=salsas",
    image: photoOf("mayonesa-doypack-300986"),
    tone: "primary",
  },
  {
    id: "ofertas",
    eyebrow: "Ofertas de la semana",
    title: "Hasta 20% OFF en KRIS",
    subtitle: "Precios mayoristas para reponer tu stock sin salir del local.",
    cta: "Ver ofertas",
    to: "/catalogo?ofertas=1",
    image: photoOf("ketchup-doypack-301049"),
    tone: "accent",
  },
  {
    id: "bebidas",
    eyebrow: "Listas para vender",
    title: "Bebidas que rotan solas",
    subtitle: "Frussion, Speranza, Raptor y más, en paquetes para tu heladera.",
    cta: "Ver bebidas",
    to: "/catalogo?categoria=bebidas-rtd",
    image: photoOf("refresco-frussion-naranja-600113"),
    tone: "warning",
  },
]

const valueProps = [
  { icon: Truck, label: "Entrega en tu negocio", hint: "En tu punto habitual" },
  { icon: QrCode, label: "Pago con QR", hint: "Confirmación al instante" },
  { icon: BadgePercent, label: "Precio mayorista", hint: "Directo de fábrica" },
]

const byId = (id: string) => categories.find((c) => c.id === id)!

const tagline = (c: Category) =>
  `${c.productCount} productos · ${c.brands.length > 2 ? `${c.brands.length} marcas` : c.brands.join(", ")}`

const featuredCategories = [
  { category: byId("salsas"), image: photoOf("mostaza-doypack-301053"), tagline: tagline(byId("salsas")) },
  { category: byId("bebidas-rtd"), image: photoOf("refresco-frussion-naranja-600113"), tagline: tagline(byId("bebidas-rtd")) },
]
const restCategories = categories.filter(
  (c) => !featuredCategories.some((f) => f.category.id === c.id)
)

// Reparte una lista entre categorías (round-robin) para que ninguna sección quede monopolizada
// por la primera categoría del archivo. Prioriza productos con foto real.
function spreadByCategory(pool: Product[], limit: number): Product[] {
  const byCategory = new Map<string, Product[]>()
  for (const p of [...pool].sort((a, b) => Number(hasProductImage(b)) - Number(hasProductImage(a)))) {
    const list = byCategory.get(p.categoryId) ?? []
    list.push(p)
    byCategory.set(p.categoryId, list)
  }
  const buckets = [...byCategory.values()]
  const out: Product[] = []
  for (let i = 0; out.length < limit && buckets.some((b) => b.length > i); i++) {
    for (const b of buckets) if (b[i] && out.length < limit) out.push(b[i]!)
  }
  return out
}

// Rail "Los más pedidos": mezcla de categorías, con foto real. (Cuando exista integración, la base
// legítima para esta sección es el flag real `isPareto` de sale.products — ver CLAUDE.md.)
const mostOrdered = spreadByCategory(products.filter(hasProductImage), 10)

// Ofertas: productos con descuento simulado, repartidos por categoría.
const deals = spreadByCategory(products.filter((p) => mockDiscountPercent(p) > 0), 6)

export function Home() {
  return (
    <div className="flex flex-col gap-8 px-4 pt-4 pb-6">
      <HeroCarousel slides={heroSlides} />

      <section className="no-scrollbar -mx-4 -mt-4 flex gap-2 overflow-x-auto px-4">
        {valueProps.map(({ icon: Icon, label, hint }) => (
          <div
            key={label}
            className="flex shrink-0 items-center gap-2.5 rounded-2xl bg-card py-2 pr-4 pl-2 shadow-sm ring-1 ring-foreground/5"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[10px] text-muted-foreground">{hint}</span>
            </span>
          </div>
        ))}
      </section>

      <PointsCard />

      <section>
        <SectionHeader
          title="Categorías"
          subtitle="375 productos de 9 categorías"
          to="/catalogo"
          linkLabel="Ver todas"
        />
        <CategoryShowcase featured={featuredCategories} rest={restCategories} />
      </section>

      <section>
        <SectionHeader
          title="Los más pedidos"
          subtitle="Lo que más rota en negocios como el tuyo"
          to="/catalogo"
        />
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pt-1 pb-3">
          {mostOrdered.map((p) => (
            <ProductCard key={p.id} product={p} className="w-40 shrink-0 snap-start" />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Nuestras marcas" subtitle="Industria boliviana" />
        <BrandRail brands={brands} />
      </section>

      <section>
        <Link
          to="/catalogo?ofertas=1"
          className="group relative flex h-32 items-center overflow-hidden rounded-3xl bg-gradient-to-r from-accent to-accent/80 p-5 text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5"
        >
          <span className="pointer-events-none absolute -top-10 right-20 size-40 rounded-full bg-accent-foreground/10" />
          <div className="relative z-10 flex max-w-[60%] flex-col gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
              Solo esta semana
            </span>
            <span className="cn-font-heading text-xl leading-tight">
              Ofertas para reponer tu stock
            </span>
            <span className="text-xs opacity-85">Hasta 20% en productos seleccionados</span>
          </div>
          <img
            src={photoOf("salsa-golf-pomo-300179")}
            alt=""
            className="pointer-events-none absolute right-3 -bottom-2 h-[108%] w-[36%] -rotate-12 object-contain drop-shadow-2xl transition-transform group-hover:scale-105"
          />
        </Link>
      </section>

      <section>
        <SectionHeader
          title="Ofertas de la semana"
          subtitle="Descuentos sobre precio mayorista"
          to="/catalogo?ofertas=1"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

    </div>
  )
}
