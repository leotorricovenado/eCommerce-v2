import { BadgePercent, QrCode, Truck } from "lucide-react"

import { BrandRail } from "@/components/home/BrandRail"
import { CategoryShowcase } from "@/components/home/CategoryShowcase"
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel"
import { PointsCard } from "@/components/home/PointsCard"
import { RecommendedProducts } from "@/components/home/RecommendedProducts"
import { SectionHeader } from "@/components/home/SectionHeader"
import { ProductCard } from "@/components/ProductCard"
import { brands, categories, type Category } from "@/data/categories"
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
    id: "venado-money",
    eyebrow: "Venado Money",
    title: "Cada pedido suma puntos",
    subtitle: "Comprá los productos de la lista y canjeá tus puntos.",
    cta: "Ver mis puntos",
    to: "/puntos",
    image: photoOf("raptor-analcoholico-600217"),
    tone: "warning",
  },
  {
    id: "bebidas",
    eyebrow: "Listas para vender",
    title: "Bebidas que rotan solas",
    subtitle: "Frussion, De la Granja, Speranza y más, en paquetes para tu heladera.",
    cta: "Ver bebidas",
    to: "/catalogo?categoria=bebidas-rtd",
    image: photoOf("refresco-frussion-naranja-600113"),
    tone: "accent",
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
  { category: byId("salsas"), image: photoOf("ketchup-doypack-301049"), tagline: tagline(byId("salsas")), tint: "bg-accent/10 text-accent" },
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

      <RecommendedProducts />

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

    </div>
  )
}
