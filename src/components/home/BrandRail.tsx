import { Link } from "react-router"

import { brandLogos } from "@/data/brandLogos"
import { tintForCategory } from "@/lib/categoryTint"
import { cn } from "@/lib/utils"

interface BrandRailProps {
  brands: string[]
}

function monogram(brand: string): string {
  const words = brand.split(/\s+/)
  const significant = words.length > 1 ? words.filter((w) => w.length > 2) : words
  return significant
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("")
}

/**
 * Marcas como "stories" grandes: círculo con logo real donde existe, monograma tintado donde no
 * (no se inventan isotipos). Las que tienen logo van primero para que el rail abra fuerte.
 */
export function BrandRail({ brands }: BrandRailProps) {
  const ordered = [...brands].sort((a, b) => Number(!!brandLogos[b]) - Number(!!brandLogos[a]))

  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pt-1 pb-2 sm:gap-5">
      {ordered.map((b) => {
        const logo = brandLogos[b]
        return (
          <Link
            key={b}
            to={`/catalogo?marca=${encodeURIComponent(b)}`}
            className="group flex w-24 shrink-0 flex-col items-center gap-2 sm:w-28"
          >
            <span className="rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-accent/40 p-[3px] shadow-md shadow-primary/10 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg group-active:scale-95">
              <span
                className={cn(
                  "flex size-[86px] items-center justify-center rounded-full ring-[3px] ring-background sm:size-24",
                  logo ? "bg-card" : tintForCategory(b)
                )}
              >
                {logo ? (
                  <img src={logo} alt={b} className="size-full rounded-full object-contain" />
                ) : (
                  <span className="cn-font-heading text-2xl">{monogram(b)}</span>
                )}
              </span>
            </span>
            <span className="w-full truncate text-center text-xs font-semibold">{b}</span>
          </Link>
        )
      })}
    </div>
  )
}
