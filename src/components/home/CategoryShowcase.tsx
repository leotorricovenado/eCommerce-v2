import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"

import { categoryIcons } from "@/data/categoryIcons"
import type { Category } from "@/data/categories"
import { tintForCategory } from "@/lib/categoryTint"
import { cn } from "@/lib/utils"

interface FeaturedCategory {
  category: Category
  image: string
  tagline: string
}

interface CategoryShowcaseProps {
  featured: FeaturedCategory[]
  rest: Category[]
}

/**
 * Bento de categorías: dos tiles grandes con foto real de producto + rail de chips con
 * ícono para el resto. Rompe la cuadrícula uniforme de "cuadraditos" y jerarquiza las
 * categorías que sí tienen packshot disponible.
 */
export function CategoryShowcase({ featured, rest }: CategoryShowcaseProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {featured.map(({ category, image, tagline }) => {
          const Icon = categoryIcons[category.id]
          return (
            <Link
              key={category.id}
              to={`/catalogo?categoria=${category.id}`}
              className={cn(
                "group relative flex h-36 flex-col justify-between overflow-hidden rounded-3xl p-4 ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:h-44",
                tintForCategory(category.id)
              )}
            >
              <span className="pointer-events-none absolute -right-6 -bottom-10 size-32 rounded-full bg-card/50 sm:size-40" />
              <div className="relative z-10 flex items-start justify-between">
                <span className="flex size-8 items-center justify-center rounded-full bg-card/80 shadow-sm">
                  {Icon && <Icon className="size-4" strokeWidth={2} />}
                </span>
                <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="relative z-10 flex max-w-[58%] flex-col">
                <span className="cn-font-heading text-[15px] leading-tight text-foreground">
                  {category.label}
                </span>
                <span className="text-[11px] font-medium text-foreground/60">{tagline}</span>
              </div>
              <img
                src={image}
                alt=""
                className="pointer-events-none absolute -right-2 -bottom-2 z-0 h-[78%] w-[48%] rotate-6 object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
              />
            </Link>
          )
        })}
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {rest.map((c) => {
          const Icon = categoryIcons[c.id]
          return (
            <Link
              key={c.id}
              to={`/catalogo?categoria=${c.id}`}
              className="flex shrink-0 items-center gap-2 rounded-full bg-card py-1.5 pr-4 pl-1.5 shadow-sm ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full",
                  tintForCategory(c.id)
                )}
              >
                {Icon && <Icon className="size-4" strokeWidth={2} />}
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[13px] font-semibold whitespace-nowrap">{c.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {c.productCount} productos
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
