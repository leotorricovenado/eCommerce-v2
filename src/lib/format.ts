export function formatBs(amount: number): string {
  return `Bs ${amount.toFixed(2)}`
}

export const IVA_RATE = 0.13

const PACKAGING_ABBR: Record<string, string> = {
  dsp: "displays",
  display: "displays",
  bol: "bolsas",
  gal: "galones",
  unidades: "unidades",
}

/**
 * Resume la presentación del catálogo a algo legible en una card chica:
 * "Caja con 12 Unidades" → "Caja x12", "Bandeja de Cartón con 24 Unidades" → "Bandeja x24",
 * "Caja con 8 Displays de 25 Unidades" → "Caja x8", "1 Unidad de Bidón" → "Por unidad",
 * "4 Dsp" → "x4 displays". Si no hay cantidad reconocible devuelve el texto tal cual.
 */
export function packagingShort(packaging: string | null): string | null {
  if (!packaging) return null
  const p = packaging.trim().replace(/\.$/, "")
  if (/^1\s+unidad/i.test(p)) return "Por unidad"
  if (!/^\d/.test(p)) {
    const container = p.match(/^([^\d\s]+).*?(\d+)/)
    if (container) return `${container[1]} x${container[2]}`
    return p
  }
  const leading = p.match(/^(\d+)\s+(\S+)/)
  if (leading) {
    const word = PACKAGING_ABBR[leading[2]!.toLowerCase()] ?? leading[2]!.toLowerCase()
    return `x${leading[1]} ${word}`
  }
  return p
}

export interface PackagingInfo {
  /** Nombre del bulto cerrado tal como lo llama el catálogo: "Caja", "Paquete", "Bolsón"... */
  container: string
  /** Unidades sueltas que trae el bulto cerrado (producto de todos los niveles). */
  units: number
  /** Desglose cuando hay más de un nivel, ej. "8 displays × 25 unidades". */
  breakdown: string | null
}

// Palabras que cuentan piezas en la presentación del catálogo. Los pesos/volúmenes
// ("7,8 G", "500 ML") NO cuentan.
const COUNT_WORDS =
  /^(unidad(es)?|unid|displays?|dsp|pares|cajitas|sachets|estuches|bol|bolsas|gal|galones|packs?)\.?$/i

/**
 * Interpreta la presentación del catálogo como "bulto cerrado" (unidad máxima de venta):
 * "Caja con 12 Unidades" → { Caja, 12 }, "Caja con 8 Displays de 25 Unidades" → { Caja, 200 },
 * "1 Unidad de Bidón" → { Unidad, 1 } (sin opción de bulto), "4 Bol" → { Bulto, 4 }.
 * Devuelve null si no hay ninguna cantidad reconocible.
 */
export function parsePackaging(packaging: string | null): PackagingInfo | null {
  if (!packaging) return null
  const tokens = packaging.trim().replace(/\.$/, "").split(/\s+/)
  const levels: { n: number; word: string }[] = []
  for (let i = 0; i < tokens.length - 1; i++) {
    const n = Number(tokens[i])
    const word = tokens[i + 1]!
    if (Number.isInteger(n) && n > 0 && COUNT_WORDS.test(word)) {
      const w = word.replace(/\.$/, "").toLowerCase()
      levels.push({ n, word: PACKAGING_ABBR[w] ?? w })
    }
  }
  if (levels.length === 0) return null
  const units = levels.reduce((acc, l) => acc * l.n, 1)
  const first = tokens[0]!
  const container = /^\d/.test(first) ? (units > 1 ? "Bulto" : "Unidad") : first
  const breakdown = levels.length > 1 ? levels.map((l) => `${l.n} ${l.word}`).join(" × ") : null
  return { container, units, breakdown }
}
