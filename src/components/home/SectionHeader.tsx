import { ChevronRight } from "lucide-react"
import { Link } from "react-router"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  to?: string
  linkLabel?: string
}

export function SectionHeader({ title, subtitle, to, linkLabel = "Ver todo" }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="flex flex-col">
        <h2 className="text-base leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
        >
          {linkLabel}
          <ChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  )
}
