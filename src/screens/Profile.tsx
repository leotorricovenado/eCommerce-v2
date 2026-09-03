import {
  BadgeCheck,
  Check,
  ChevronRight,
  Clock,
  Coins,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  Wallet,
} from "lucide-react";
import { Link } from "react-router";

import { formatPts } from "@/components/money/PointsUI";

import { customer, deliveryPoints } from "@/data/customer";
import { formatBs } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/state/checkout";
import { useOrders } from "@/state/order";
import { usePoints } from "@/state/points";
import { useSession } from "@/state/session";

export function Profile() {
  const { phone } = useSession();
  const { deliveryPointId, setDeliveryPointId } = useCheckout();
  const { orders } = useOrders();
  const { balance, tier } = usePoints();
  const displayPhone = phone ? `+${phone}` : customer.phone;
  const initials = customer.businessName
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div className="flex flex-col gap-5 px-4 pt-3 pb-8">
      {/* Cabecera del cliente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 p-5 text-primary-foreground shadow-lg shadow-primary/20">
        <span className="pointer-events-none absolute -top-16 -right-8 size-48 rounded-full bg-primary-foreground/10" />
        <span className="pointer-events-none absolute -bottom-20 left-24 size-40 rounded-full bg-primary-foreground/10" />
        <div className="relative z-10 flex items-center gap-4">
          <span className="cn-font-heading flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-xl text-primary shadow-md">
            {initials}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="flex w-fit items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
              <BadgeCheck className="size-3" strokeWidth={2.5} />
              Cuenta activa
            </span>
            <h1 className="truncate text-xl leading-tight">
              {customer.businessName}
            </h1>
            <span className="text-xs opacity-85">
              Cliente {customer.code} · NIT {customer.nit}
            </span>
          </div>
        </div>
        <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
          <Stat
            icon={Wallet}
            label="Límite de compra"
            value={formatBs(customer.limitBuyAmount)}
          />
          <Stat
            icon={ReceiptText}
            label="Pedidos"
            value={String(orders.length)}
          />
        </div>
      </div>

      {/* Datos de contacto */}
      <Section title="Tu cuenta">
        <Row
          icon={UserRound}
          label="Titular"
          value={`${customer.owner.name} · ${customer.owner.code}`}
        />
        <Row
          icon={Phone}
          label="WhatsApp vinculado"
          value={displayPhone}
          tone="success"
        />
      </Section>

      <Section title="Accesos">
        <Link to="/pedidos" className="flex items-center gap-3 px-4 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ReceiptText className="size-4" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-semibold">Mis pedidos</span>
            <span className="text-[11px] text-muted-foreground">
              {orders.length} en total
            </span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
        <Link to="/puntos" className="flex items-center gap-3 px-4 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-money/20 text-money-foreground">
            <Coins className="size-4" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-semibold">Venado Money</span>
            <span className="text-[11px] text-muted-foreground">
              {formatPts(balance)} · Nivel {tier.label}
            </span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </Section>

      {/* Puntos de entrega */}
      <section className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <h2 className="text-base">Puntos de entrega</h2>
          <span className="text-[11px] text-muted-foreground">
            Tocá uno para dejarlo predeterminado
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {deliveryPoints.map((p) => {
            const active = p.id === deliveryPointId;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => setDeliveryPointId(p.id)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-3xl p-4 text-left ring-2 transition-all active:scale-[0.99]",
                  active
                    ? "bg-primary/5 ring-primary"
                    : "bg-card ring-foreground/5 hover:ring-primary/30",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <MapPin className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    {p.address}
                    {active && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        Predeterminado
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.zone} · {p.city}
                  </span>
                  <span className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{p.contact}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {p.reception.from}–
                      {p.reception.to}
                    </span>
                  </span>
                </div>
                {active && (
                  <Check
                    className="mt-1 size-4 shrink-0 text-primary"
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-primary-foreground/15 px-3 py-2.5 backdrop-blur">
      <Icon className="size-4 shrink-0 opacity-90" />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-[10px] uppercase opacity-80">{label}</span>
        <span className="cn-font-heading truncate text-sm">{value}</span>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base">{title}</h2>
      <div className="flex flex-col divide-y divide-foreground/5 rounded-3xl bg-card ring-1 ring-foreground/5">
        {children}
      </div>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          tone === "success"
            ? "bg-success/15 text-success"
            : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}
