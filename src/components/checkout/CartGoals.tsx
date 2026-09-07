import { ArrowRight, Check, Target } from "lucide-react";
import { Link } from "react-router";

import {
  GoalBar,
  GoalDeadline,
  GoalProgressText,
} from "@/components/money/GoalUI";
import { formatPts } from "@/components/money/PointsUI";
import {
  formatGoalAmount,
  goalHeadline,
  goalStatuses,
  scopeLink,
  type GoalStatus,
} from "@/data/venadoMoney";
import { cn } from "@/lib/utils";
import { useCart } from "@/state/cart";
import { usePoints } from "@/state/points";

/** Cuántos objetivos se muestran en el carrito (los más avanzados). */
const MAX_IN_CART = 3;

/**
 * "Tus objetivos" dentro del carrito: la conversión de Venado Money. Muestra qué objetivos completa
 * este pedido y cuánto falta para los demás — en Bs o en unidades según la meta. El cliente no ve
 * ninguna palabra del negocio ("estrategia", "penetración", "ticket promedio"), solo meta,
 * progreso y premio; ver `data/venadoMoney.ts`.
 */
export function CartGoals() {
  const { quote } = useCart();
  const { goals, tier } = usePoints();
  // `goalStatuses` ya ordena: primero los que este pedido completa, después por avance.
  const statuses = goalStatuses(goals, quote)
    .filter((g) => !g.done)
    .slice(0, MAX_IN_CART);
  if (statuses.length === 0) return null;
  const single = statuses.length === 1;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-money/20 text-money-foreground">
          <Target className="size-4" strokeWidth={2.25} />
        </span>
        <div className="flex flex-col">
          <h2 className="text-base leading-tight">Suma puntos</h2>
          <p className="text-xs text-muted-foreground">
            Se cumplen sumando tus compras · al lograrlos ganás puntos
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex gap-3",
          !single && "no-scrollbar -mx-4 snap-x overflow-x-auto px-4 pb-1",
        )}
      >
        {statuses.map((status) => (
          <CartGoalCard
            key={status.strategy.id}
            status={status}
            multiplier={tier.multiplier}
            className={
              single ? "w-full" : "w-[86%] shrink-0 snap-start sm:w-80"
            }
          />
        ))}
      </div>
    </section>
  );
}

function CartGoalCard({
  status,
  multiplier,
  className,
}: {
  status: GoalStatus;
  multiplier: number;
  className?: string;
}) {
  const { strategy, completesNow, missing } = status;
  const points = Math.floor(strategy.points * multiplier);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl p-3 ring-1",
        completesNow
          ? "bg-success/10 ring-success/40"
          : "bg-money/15 ring-money/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-[13px] leading-snug font-semibold">
          {goalHeadline(strategy)}
        </span>
        {!completesNow && <GoalDeadline status={status} />}
      </div>

      <GoalBar status={status} />
      <GoalProgressText status={status} />

      {completesNow ? (
        <div className="flex items-center gap-2 rounded-xl bg-success px-3 py-2 text-primary-foreground">
          <Check className="size-4 shrink-0" strokeWidth={3} />
          <span className="min-w-0 flex-1 text-[13px] leading-tight font-bold">
            ¡Lo cumplís con este pedido!
          </span>
          <span className="shrink-0 text-[13px] font-bold tabular-nums">
            +{formatPts(points)}
          </span>
        </div>
      ) : (
        <Link
          to={scopeLink(strategy)}
          className="flex items-center gap-2 rounded-xl bg-money-foreground px-3 py-2 text-card transition-all active:scale-[0.98]"
        >
          <span className="min-w-0 flex-1 text-[13px] leading-tight font-semibold">
            Te faltan <strong>{formatGoalAmount(missing)}</strong> para ganar{" "}
            {formatPts(points)}
          </span>
          <ArrowRight className="size-4 shrink-0" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}
