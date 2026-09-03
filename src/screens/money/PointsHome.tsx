import { ArrowDownLeft, ArrowUpRight, CalendarClock, ChevronRight, Coins, Gift, Medal, ReceiptText, ShoppingBag, Sparkles, Truck, Zap } from "lucide-react"
import { Link } from "react-router"

import { SectionHeader } from "@/components/home/SectionHeader"
import { PointsPill, ProgressRing, TierBadge, formatPts } from "@/components/money/PointsUI"
import { RedeemProductCard } from "@/components/money/RedeemProductCard"
import { EXPIRY_MONTHS, POINTS_PER_BS, REDEEM_BS_PER_POINT, promoProducts, redeemables } from "@/data/venadoMoney"
import { ProductThumb } from "@/components/checkout/OrderLines"
import { formatBs } from "@/lib/format"
import { formatShortDate } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { usePoints } from "@/state/points"

export function PointsHome() {
  const { balance, tier, progress, movements, nextExpiry } = usePoints()
  const affordableFirst = [...redeemables].sort((a, b) => Number(b.points <= balance) - Number(a.points <= balance)).slice(0, 8)

  return (
    <div className="flex flex-col gap-7 px-4 pt-3 pb-8">
      {/* Hero de saldo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-money via-money to-warning p-5 text-money-foreground shadow-lg shadow-money/30">
        <span className="pointer-events-none absolute -top-16 -right-10 size-52 rounded-full bg-card/20" />
        <span className="pointer-events-none absolute -bottom-24 left-16 size-44 rounded-full bg-card/15" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase opacity-80">
              <Coins className="size-3.5" strokeWidth={2.5} />
              Venado Money
            </span>
            <div className="flex flex-col leading-none">
              <span className="cn-font-heading text-5xl tabular-nums">{balance.toLocaleString("es-BO")}</span>
              <span className="mt-1 text-sm font-semibold">puntos disponibles</span>
            </div>
            <span className="text-xs opacity-85">≈ {formatBs(balance * REDEEM_BS_PER_POINT)} en productos</span>
            <TierBadge tier={tier} className="w-fit bg-card/80" />
          </div>
          <ProgressRing value={progress.pct} size={104} className="text-money-foreground">
            <span className="cn-font-heading text-xl leading-none">{Math.round(progress.pct * 100)}%</span>
            <span className="text-[10px] font-semibold opacity-80">{progress.next ? `a ${progress.next.label}` : "máximo"}</span>
          </ProgressRing>
        </div>
        {progress.next && (
          <Link
            to="/puntos/niveles"
            className="relative z-10 mt-4 flex items-center justify-between rounded-2xl bg-card/80 px-3 py-2 text-xs font-semibold backdrop-blur transition-all hover:bg-card"
          >
            <span>
              Te faltan <strong>{formatPts(progress.missing)}</strong> para llegar a {progress.next.label}
            </span>
            <ChevronRight className="size-4" />
          </Link>
        )}
      </div>

      {nextExpiry && (
        <div className="-mt-3 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-[11px] ring-1 ring-foreground/5">
          <CalendarClock className="size-3.5 shrink-0 text-money-foreground" />
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            Próximo vencimiento: <strong className="text-foreground">{formatPts(nextExpiry.remaining)}</strong> el{" "}
            {nextExpiry.expiresAt.toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "")} · vencen a los {EXPIRY_MONTHS} meses
          </span>
        </div>
      )}

      {/* Accesos */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { to: "/puntos/canjear", icon: Gift, label: "Canjear", hint: `${redeemables.length} productos` },
          { to: "/puntos/extracto", icon: ReceiptText, label: "Extracto", hint: `${movements.length} movimientos` },
          { to: "/puntos/niveles", icon: Medal, label: "Niveles", hint: tier.benefit },
        ].map(({ to, icon: Icon, label, hint }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1.5 rounded-3xl bg-card p-3 text-center ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-money/15 text-money-foreground">
              <Icon className="size-5" strokeWidth={2} />
            </span>
            <span className="text-[13px] font-bold">{label}</span>
            <span className="line-clamp-1 text-[10px] text-muted-foreground">{hint}</span>
          </Link>
        ))}
      </div>

      {/* Canjeables */}
      <section>
        <SectionHeader title="Canjeá con tus puntos" subtitle="Se suman a tu próximo pedido, sin costo en Bs" to="/puntos/canjear" linkLabel="Ver todo" />
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pt-1 pb-3">
          {affordableFirst.map((r) => (
            <RedeemProductCard key={r.product.id} item={r} className="w-40 shrink-0 snap-start" />
          ))}
        </div>
      </section>

      {/* Promos de puntos */}
      {promoProducts.length > 0 && (
        <section>
          <SectionHeader title="Promos de puntos" subtitle="Productos que suman más" to={`/catalogo?marca=${encodeURIComponent(promoProducts[0]!.product.brand ?? "")}`} linkLabel="Ver todo" />
          <div className="flex flex-col gap-2">
            {promoProducts.slice(0, 3).map(({ product, rule }) => (
              <Link
                key={product.id}
                to={`/producto/${product.id}`}
                className="flex items-center gap-3 rounded-3xl bg-money-foreground p-3 text-card shadow-lg transition-all hover:-translate-y-0.5"
              >
                <ProductThumb product={product} className="size-14 bg-card" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-money uppercase">
                    <Zap className="size-3" strokeWidth={2.5} />
                    {rule.label}
                  </span>
                  <span className="truncate text-sm font-semibold">{product.name}</span>
                  <span className="truncate text-[11px] opacity-75">{rule.description}</span>
                </div>
                <ChevronRight className="size-4 shrink-0 opacity-70" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Movimientos */}
      <section>
        <SectionHeader title="Últimos movimientos" to="/puntos/extracto" linkLabel="Ver extracto" />
        <div className="flex flex-col divide-y divide-foreground/5 rounded-3xl bg-card ring-1 ring-foreground/5">
          {movements.slice(0, 3).map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  m.kind === "abono" ? "bg-success/15 text-success" : "bg-money/20 text-money-foreground"
                )}
              >
                {m.kind === "abono" ? <ArrowUpRight className="size-4" strokeWidth={2.5} /> : <ArrowDownLeft className="size-4" strokeWidth={2.5} />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold">{m.description}</span>
                <span className="text-[11px] text-muted-foreground">{formatShortDate(m.at)}</span>
              </div>
              <span className={cn("cn-font-heading text-sm tabular-nums", m.kind === "abono" ? "text-success" : "text-money-foreground")}>
                {m.kind === "abono" ? "+" : "−"}
                {formatPts(m.points)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="flex flex-col gap-3 rounded-3xl bg-money/10 p-4 ring-1 ring-money/20">
        <h2 className="text-base">¿Cómo funciona?</h2>
        {[
          { icon: ShoppingBag, text: `Cada pedido pagado suma 1 punto por cada Bs ${Math.round(1 / POINTS_PER_BS)}. Los ves acreditados al confirmarse.` },
          { icon: Sparkles, text: "Subís de nivel con los puntos acumulados y ganás más puntos por pedido." },
          { icon: Truck, text: "Canjeás productos desde el catálogo de canje: viajan en tu próximo pedido, sin costo en Bs." },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card text-money-foreground shadow-sm">
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <p className="text-[13px] leading-snug">{text}</p>
          </div>
        ))}
        <PointsPill points={balance} size="md" className="w-fit bg-card" />
      </section>
    </div>
  )
}
