/** Normaliza para búsqueda: minúsculas y sin acentos ("Limón" → "limon"). */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

/** true si TODAS las palabras de `query` aparecen en alguno de los `fields`. */
export function matchesQuery(query: string, fields: (string | null | undefined)[]): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const haystack = normalize(fields.filter(Boolean).join(" "))
  return words.every((w) => haystack.includes(w))
}
