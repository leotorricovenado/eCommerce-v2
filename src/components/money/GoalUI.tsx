import {
  CalendarClock,
  Check,
  ChevronRight,
  Coins,
  Layers,
  Package,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { Link } from "react-router";

import { ProductThumb } from "@/components/checkout/OrderLines";
import {
  formatGoalAmount,
  goalHeadline,
  scopeLabel,
  scopeLink,
  scopeSampleProduct,
  type GoalStatus,
} from "@/data/venadoMoney";
import { cn } from "@/lib/utils";

/**
 * Piezas compartidas de "objetivos" (Venado Money). Un objetivo es meta + progreso + premio; el
 * cliente NUNCA ve de qué tipo de estrategia salió (ticket promedio o penetración) — ver
 * `data/venadoMoney.ts`. Se usan en /puntos, /puntos/objetivos, el carrito y el detalle.
 */

export const SCOPE_ICON = {
  product: Package,
  brand: Tag,
  subcategory: Layers,
  category: ShoppingBag,
} as const;

/**
 * Barra de avance en dos tramos: lo acumulado en compras anteriores (ámbar) y lo que aporta el
 * carrito actual (verde). Ver los dos tramos juntos es lo que explica que la meta se cumple
 * sumando compras y no de una sola vez.
 */
export function GoalBar({
  status,
  className,
}: {
  status: GoalStatus;
  className?: string;
}) {
  const { strategy, before, inCart, done } = status;
  const beforePct = Math.min(1, before / strategy.goal);
  const cartPct = Math.max(0, Math.min(1 - beforePct, inCart / strategy.goal));
  return (
    <div
      className={cn(
        "flex h-2 w-full overflow-hidden rounded-full bg-foreground/10",
        className,
      )}
    >
      <span
        className={cn(
          "h-full transition-[width] duration-500",
          done ? "bg-success" : "bg-money",
        )}
        style={{ width: `${beforePct * 100}%` }}
      />
      {cartPct > 0 && (
        <span
          className="h-full bg-success transition-[width] duration-500"
          style={{ width: `${cartPct * 100}%` }}
        />
      )}
    </div>
  );
}

/** "Bs 100 de Bs 150" + lo que aporta el carrito, si aporta. */
export function GoalProgressText({
  status,
  className,
}: {
  status: GoalStatus;
  className?: string;
}) {
  const { strategy, current, inCart } = status;
  return (
    <span className={cn("text-[11px] text-muted-foreground", className)}>
      <strong className="text-foreground tabular-nums">
        {formatGoalAmount(current)}
      </strong>{" "}
      de <span className="tabular-nums">{formatGoalAmount(strategy.goal)}</span>
    </span>
  );
}

/** Pill del premio: "+20 pts" (con el multiplicador del nivel ya aplicado). */
export function GoalReward({
  status,
  multiplier = 1,
  className,
}: {
  status: GoalStatus;
  multiplier?: number;
  className?: string;
}) {
  const achieved = status.done || status.completesNow;
  const points = Math.floor(status.strategy.points * multiplier);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm",
        achieved
          ? "bg-success text-primary-foreground"
          : "bg-money text-money-foreground",
        className,
      )}
    >
      {achieved ? (
        <Check className="size-3.5" strokeWidth={3} />
      ) : (
        <Coins className="size-3.5" strokeWidth={2.5} />
      )}
      +{points} pts
    </span>
  );
}

/** Chip de vigencia: "Quedan 9 días". Rojo cuando está por vencer. */
export function GoalDeadline({
  status,
  className,
}: {
  status: GoalStatus;
  className?: string;
}) {
  if (status.daysLeft === null) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
        status.endingSoon
          ? "bg-accent/10 text-accent"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <CalendarClock className="size-3" strokeWidth={2.5} />
      {status.daysLeft === 0
        ? "Último día"
        : `Quedan ${status.daysLeft} ${status.daysLeft === 1 ? "día" : "días"}`}
    </span>
  );
}

/** Fila compacta para listas (Home de puntos). */
export function GoalRow({
  status,
  multiplier = 1,
  className,
}: {
  status: GoalStatus;
  multiplier?: number;
  className?: string;
}) {
  const { strategy } = status;
  const sample = scopeSampleProduct(strategy);
  return (
    <Link
      to={scopeLink(strategy)}
      className={cn(
        "flex items-center gap-3 rounded-3xl bg-card p-3 ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      {sample && <ProductThumb product={sample} className="size-14" />}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-semibold">
          {goalHeadline(strategy)}
        </span>
        <GoalBar status={status} />
        <GoalProgressText status={status} />
      </div>
      <GoalReward status={status} multiplier={multiplier} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

/** Card completa para la pantalla de objetivos. */
export function GoalCard({
  status,
  multiplier = 1,
}: {
  status: GoalStatus;
  multiplier?: number;
}) {
  const { strategy, done, missing } = status;
  const sample = scopeSampleProduct(strategy);
  const Icon = SCOPE_ICON[strategy.scope.kind];

  return (
    <Link
      to={scopeLink(strategy)}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-3xl p-4 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-lg",
        done ? "bg-success/10 ring-success/30" : "bg-card ring-foreground/5",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute -top-12 -right-10 size-32 rounded-full",
          done ? "bg-success/10" : "bg-money/10",
        )}
      />
      <div className="relative z-10 flex items-center gap-3">
        {sample && <ProductThumb product={sample} className="size-16" />}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            <Icon className="size-3" strokeWidth={2.5} />
            {scopeLabel(strategy)}
          </span>
          <span className="text-sm leading-snug font-bold">
            {goalHeadline(strategy)}
          </span>
          {!done && <GoalDeadline status={status} className="mt-1 w-fit" />}
        </div>
        <GoalReward status={status} multiplier={multiplier} />
      </div>

      <div className="relative z-10 flex flex-col gap-1.5">
        <GoalBar status={status} />
        <div className="flex items-center justify-between gap-2">
          <GoalProgressText status={status} />
          {done ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-success">
              <Check className="size-3.5" strokeWidth={3} />
              Objetivo cumplido
            </span>
          ) : (
            <span className="shrink-0 text-[11px] font-bold text-money-foreground">
              Te faltan {formatGoalAmount(missing)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
