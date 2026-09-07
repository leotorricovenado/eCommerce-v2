import type { Product } from "./products"

// SIMULADO — ver memoria de proyecto `ecommerce-schema-real-vs-mockup`: el precio real NUNCA
// es un campo fijo del producto, Sales lo resuelve en vivo por cliente vía getPriceRules cada
// vez que se abre el carrito. Esto genera un precio plausible y ESTABLE (mismo producto -> mismo
// precio en cada render) solo para que las pantallas de demo tengan algo que mostrar. No mezclar
// con products.ts (datos reales de catálogo) ni tratar como fuente de verdad.
//
// El precio se calcula a partir del TAMAÑO del producto, no de un hash: la demo se muestra a
// ejecutivos y un pomo de 360 ml no puede salir más caro que un galón de 3,6 L. La fórmula es
//
//     precio = base + tarifa × factor(cantidad)
//
// con `base` (costo fijo del envase) y `tarifa` (Bs por kilo/litro) calibradas por subcategoría a
// precios de mercado boliviano, y `factor` sublineal: el envase grande siempre cuesta más en
// total pero menos por litro/kilo, como en la vida real. No hay ruido aleatorio: dos productos de
// la misma subcategoría y tamaño (dos sabores) valen lo mismo, igual que en una lista de precios.

/** Cantidad normalizada a gramos/ml a partir de la que se cobra. */
interface Band {
  /** Costo fijo del envase, en Bs. */
  base: number
  /** Bs por kilo / litro (precio del formato de 1 kg o 1 L, menos la base). */
  rate: number
  /** Precio fijo para productos sin tamaño medible (guantes, paños, esponjas). */
  flat?: number
}

// Calibrado por subcategoría — es donde el precio por kilo/litro realmente cambia.
const BANDS_BY_SUBCATEGORY: Record<string, Band> = {
  // Limpieza del hogar
  vajilleros: { base: 1.5, rate: 14 },
  ambientadores: { base: 6, rate: 22 },
  insecticidas: { base: 8, rate: 28 },
  lavandinas: { base: 1, rate: 6.5 },
  detergentes: { base: 1.5, rate: 14 },
  "limpia-pisos": { base: 1.5, rate: 10 },
  lustramuebles: { base: 4, rate: 26 },
  limpiadores: { base: 2, rate: 11, flat: 10 },
  "pastillas-de-bano": { base: 3, rate: 40 },
  guantes: { base: 0, rate: 0, flat: 12 },
  // Cuidado personal
  "jabones-de-manos": { base: 5, rate: 30 },
  // Bebidas en polvo
  refrescos: { base: 0.6, rate: 60 },
  "milk-shake": { base: 1, rate: 40 },
  "nectar-en-polvo": { base: 1, rate: 32 },
  "isotonicos-en-polvo": { base: 1.5, rate: 45 },
  // Bebidas listas para tomar
  "nectares-y-bebidas-con-pulpa": { base: 1.5, rate: 7 },
  "bebidas-de-fruta": { base: 1.5, rate: 6.5 },
  "bebidas-tradicionales": { base: 1.5, rate: 6 },
  agua: { base: 1.5, rate: 3 },
  "isotonicas-y-energizantes": { base: 3, rate: 12 },
  // Panificación
  levadura: { base: 2, rate: 32 },
  "polvo-para-hornear": { base: 1.5, rate: 28 },
  "mejorador-de-masa": { base: 1.5, rate: 35 },
  // Salsas
  mayonesa: { base: 2, rate: 26 },
  ketchup: { base: 1.5, rate: 20 },
  mostaza: { base: 1.5, rate: 20 },
  "salsas-especiales": { base: 1.5, rate: 35 },
  extractos: { base: 1, rate: 22 },
  "salsas-regionales": { base: 2, rate: 40 },
  // Culinarios
  "conservas-y-aceites": { base: 8, rate: 45 },
  "sopas-y-cremas": { base: 1.5, rate: 40 },
  "caldos-concentrados": { base: 1, rate: 55 },
  "pure-de-papas": { base: 1.5, rate: 42 },
  "maicena-y-gelatina": { base: 1, rate: 35 },
  "papas-prefritas-y-almidon-de-maiz": { base: 3, rate: 22 },
  // Postres
  postres: { base: 1, rate: 42 },
  achocolatados: { base: 1.5, rate: 48 },
  // Cereales
  "cereales-y-avenas": { base: 2, rate: 45 },
}

const BANDS_BY_CATEGORY: Record<string, Band> = {
  "limpieza-del-hogar": { base: 2, rate: 13, flat: 12 },
  "cuidado-personal": { base: 5, rate: 30, flat: 18 },
  "bebidas-en-polvo": { base: 1, rate: 45, flat: 4 },
  "bebidas-rtd": { base: 1.5, rate: 7, flat: 8 },
  panificacion: { base: 2, rate: 30, flat: 15 },
  salsas: { base: 1.5, rate: 25, flat: 10 },
  culinarios: { base: 1.5, rate: 40, flat: 10 },
  postres: { base: 1, rate: 42, flat: 8 },
  cereales: { base: 2, rate: 45, flat: 15 },
}

const DEFAULT_BAND: Band = { base: 2, rate: 25, flat: 12 }

/** Unidades por kilo/litro: todo se normaliza a gramos o mililitros. */
const UNIT_FACTOR: Record<string, number> = { ml: 1, cc: 1, g: 1, l: 1000, kg: 1000 }

/**
 * Cantidad del envase en gramos/ml. Acepta lo que traen los catálogos: "360ML", "3600 ML",
 * "1000 G.", "2,25 KG", "3L.", "1 Kg", "200 Cc.". Devuelve null para tallas o envases sin medida.
 */
function parseSize(raw: string | null): number | null {
  if (!raw) return null
  const m = /(\d+(?:[.,]\d+)?)\s*(ml|cc|kg|g|l)\b\.?/i.exec(raw)
  if (!m) return null
  // La coma es separador de miles cuando la siguen 3 dígitos ("2,900 G") y decimal cuando la
  // siguen 1 o 2 ("2,25 KG", "46,8 G"): los catálogos mezclan las dos convenciones.
  const number = /,\d{3}(?!\d)/.test(m[1]!) ? m[1]!.replace(/,/g, "") : m[1]!.replace(",", ".")
  const value = Number(number)
  const unit = m[2]!.toLowerCase()
  if (!Number.isFinite(value) || value <= 0) return null
  // El catálogo tiene erratas de unidad ("500 L." por 500 ml en el mocochinchi): nadie vende
  // bebidas de 500 litros, así que un valor absurdo en L/KG se lee como la unidad chica.
  if ((unit === "l" || unit === "kg") && value >= 100) return value
  return value * UNIT_FACTOR[unit]!
}

/** Algunos productos no traen `size` pero sí llevan la medida en el nombre ("... 900 Ml Ni"). */
function quantityOf(product: Product): number | null {
  return parseSize(product.size) ?? parseSize(product.name)
}

// A partir de 5 kg/L el precio por kilo baja más rápido (formato industrial: bolsón, bidón).
const BULK_PIVOT = 5
const SMALL_EXPONENT = 0.85
const BULK_EXPONENT = 0.5

/** Factor sublineal: más grande siempre cuesta más, pero cada vez menos por kilo/litro. */
function sizeFactor(kilos: number): number {
  if (kilos <= BULK_PIVOT) return Math.pow(kilos, SMALL_EXPONENT)
  return Math.pow(BULK_PIVOT, SMALL_EXPONENT) * Math.pow(kilos / BULK_PIVOT, BULK_EXPONENT)
}

function bandFor(product: Product): Band {
  return (
    BANDS_BY_SUBCATEGORY[product.subcategoryId] ?? BANDS_BY_CATEGORY[product.categoryId] ?? DEFAULT_BAND
  )
}

export function mockPrice(product: Product): number {
  const band = bandFor(product)
  const quantity = quantityOf(product)
  if (quantity === null) {
    const flat = band.flat ?? BANDS_BY_CATEGORY[product.categoryId]?.flat ?? DEFAULT_BAND.flat!
    return flat
  }
  const raw = band.base + band.rate * sizeFactor(quantity / 1000)
  return Math.round(raw * 2) / 2
}
