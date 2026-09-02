const LOCALE = "es-BO"

/** "jue 3 sep" */
export function formatShortDate(d: Date): string {
  return d.toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "")
}

/** "jueves 3 de septiembre" */
export function formatLongDate(d: Date): string {
  return d.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" })
}

/** "3 sep 2026, 14:22" */
export function formatDateTime(d: Date): string {
  const date = d.toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "")
  const time = d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })
  return `${date}, ${time}`
}

export function weekdayLabel(d: Date): string {
  return d.toLocaleDateString(LOCALE, { weekday: "long" })
}
