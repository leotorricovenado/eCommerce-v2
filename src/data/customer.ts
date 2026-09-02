// Cliente autenticado de DEMO (en real llega identificado desde WhatsApp — ver memoria
// `deal-crm-boundary-pedidos`). Misma identidad mock que usaba la v1 (`evenado-catalogo`),
// alineada al formato real de Collections ("672242 - ELENA CHOQUE" en sus capturas).
// NO se muestra el nombre de la lista de precios: las reglas de precio son de Sales y al
// eCommerce solo le llegan sus efectos (descuento / bonificación) — decisión del usuario 2026-09-02.
export const customer = {
  code: "672242",
  businessName: "Comercial Los Andes",
  nit: "890987654",
  phone: "+591 75 34 60 50",
  owner: { code: "114957", name: "Marta Rodríguez" },
  /** `sale.customer_details.limit_buy_amount` — campo REAL (ver memoria ecommerce-schema-real-vs-mockup). */
  limitBuyAmount: 2450,
  /** Empleado vinculado al cliente (Sales resuelve el vínculo empleado↔cliente). No se muestra en Perfil (pedido del usuario 2026-09-02). */
  advisor: { name: "Carlos Mendoza", role: "Asesor comercial" },
}

/**
 * Puntos de entrega del cliente. Espejo de `sale.delivery_points` (schema real de Sales): cuelgan
 * del owner, tienen contacto, dirección y horario de recepción — y NO tienen `name`, por eso se
 * etiquetan por contacto + dirección, nunca con un nombre de sucursal inventado.
 */
export interface DeliveryPoint {
  id: number
  contact: string
  phone: string
  address: string
  zone: string
  city: string
  /** start_hour_reception / end_hour_reception */
  reception: { from: string; to: string }
}

export const deliveryPoints: DeliveryPoint[] = [
  {
    id: 501,
    contact: "Marta Rodríguez",
    phone: "+591 75 34 60 50",
    address: "Av. Cañoto #245",
    zone: "Zona Central",
    city: "Santa Cruz de la Sierra",
    reception: { from: "08:00", to: "18:00" },
  },
  {
    id: 502,
    contact: "Julio Rodríguez",
    phone: "+591 70 21 88 14",
    address: "Av. Banzer y 6to Anillo",
    zone: "Zona Norte",
    city: "Santa Cruz de la Sierra",
    reception: { from: "07:30", to: "12:30" },
  },
  {
    id: 503,
    contact: "Depósito · Sr. Mamani",
    phone: "+591 76 55 01 92",
    address: "Av. Grigotá y 4to Anillo",
    zone: "Zona Este",
    city: "Santa Cruz de la Sierra",
    reception: { from: "09:00", to: "17:00" },
  },
]

/**
 * Días de entrega habilitados para el canal de autogestión (kickoff DEAL: "fecha de entrega
 * condicionada por canal de ventas, ej. martes y jueves"). 0 = domingo … 6 = sábado.
 */
export const DELIVERY_WEEKDAYS = [2, 4]

/** Próximas `count` fechas de entrega a partir de mañana. */
export function nextDeliveryDates(count = 4, from = new Date()): Date[] {
  const out: Date[] = []
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  while (out.length < count) {
    if (DELIVERY_WEEKDAYS.includes(d.getDay())) out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}
