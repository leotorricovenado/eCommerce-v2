import { Sparkles, Star } from "lucide-react"
import { useSearchParams } from "react-router"

import { SectionHeader } from "@/components/home/SectionHeader"
import { ProductCard } from "@/components/ProductCard"
import { brandLogos } from "@/data/brandLogos"
import { categoryIcons } from "@/data/categoryIcons"
import {
  RECOMMENDATION_GROUPS,
  groupLink,
  productsForGroup,
  recommendedForYou,
  type RecommendationGroup,
} from "@/data/recommendations"
import { tintForCategory } from "@/lib/categoryTint"
import { cn } from "@/lib/utils"

const ALL = "para-vos"

/**
 * "Productos recomendados" con chips de grupo. Los grupos vienen del microservicio de estrategias
 * (ver data/recommendations.ts) y pueden ser de marca, categoría, subcategoría o lista de
 * productos — por eso el chip resuelve su ícono según el scope: logo real si es marca, ícono
 * tintado si es categoría. El primer chip ("Para vos") mezcla todos los grupos.
 */
export function RecommendedProducts() {
  // El grupo activo vive en la URL (`?reco=`) como el resto del estado de filtros del proyecto:
  // así, si el cliente entra a un producto y vuelve, la grilla sigue en el mismo grupo.
  const [params, setParams] = useSearchParams()
  const activeId = params.get("reco") ?? ALL
  const group = RECOMMENDATION_GROUPS.find((g) => g.id === activeId)
  const items = group ? productsForGroup(group) : recommendedForYou()

  const select = (id: string) => {
    const next = new URLSearchParams(params)
    if (id === ALL) next.delete("reco")
    else next.set("reco", id)
    setParams(next, { replace: true })
  }

  return (
    <section>
      <SectionHeader
        title="Productos recomendados"
        subtitle={group ? group.subtitle : "Elegidos para tu negocio"}
        to={group ? groupLink(group) : "/catalogo"}
      />

      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 py-0.5">
        <GroupChip
          active={!group}
          label="Para vos"
          icon={<Sparkles className="size-3.5" strokeWidth={2.25} />}
          tint="bg-primary/10 text-primary"
          onClick={() => select(ALL)}
        />
        {RECOMMENDATION_GROUPS.map((g) => (
          <GroupChip
            key={g.id}
            active={g.id === activeId}
            label={g.label}
            icon={<GroupIcon group={g} />}
            tint={g.scope.kind === "category" ? tintForCategory(g.scope.categoryId) : "bg-primary/10 text-primary"}
            onClick={() => select(g.id === activeId ? ALL : g.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

/** Logo real si el grupo es de marca, ícono de categoría si es de categoría, estrella si es lista. */
function GroupIcon({ group }: { group: RecommendationGroup }) {
  if (group.scope.kind === "brand") {
    const logo = brandLogos[group.scope.brand]
    return logo ? (
      <img src={logo} alt="" className="size-full rounded-full object-contain" />
    ) : (
      <span className="text-[10px] font-bold">{group.label.slice(0, 2).toUpperCase()}</span>
    )
  }
  if (group.scope.kind === "category") {
    const Icon = categoryIcons[group.scope.categoryId]
    return Icon ? <Icon className="size-3.5" strokeWidth={2.25} /> : null
  }
  return <Star className="size-3.5" strokeWidth={2.25} />
}

function GroupChip({
  active,
  label,
  icon,
  tint,
  onClick,
}: {
  active: boolean
  label: string
  icon: React.ReactNode
  tint: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full pr-3.5 pl-1.5 text-[13px] font-semibold whitespace-nowrap shadow-sm ring-1 transition-all active:scale-95",
        active
          ? "bg-primary text-primary-foreground ring-primary shadow-primary/20"
          : "bg-card ring-foreground/5 hover:ring-primary/30"
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full",
          active ? "bg-primary-foreground/15 text-primary-foreground" : tint
        )}
      >
        {icon}
      </span>
      {label}
    </button>
  )
}
