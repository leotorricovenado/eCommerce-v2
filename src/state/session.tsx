import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

const STORAGE_KEY = "evenado.session.phone"

/**
 * Identidad mínima de la sesión: el teléfono con el que el cliente entró desde WhatsApp.
 * El bot abre la web con `#/...?phone=591XXXXXXXX` (misma convención que la v1 `evenado-catalogo`,
 * ya probada con el bot real). Se persiste en localStorage para sobrevivir recargas. En la
 * arquitectura real esto lo reemplaza el binding teléfono↔cliente (ver memoria
 * `deal-crm-boundary-pedidos`); acá solo sirve para el atajo de demo de `lib/botApi.ts`.
 */
function readInitialPhone(): string | null {
  try {
    const fromUrl = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("phone")
    if (fromUrl) {
      localStorage.setItem(STORAGE_KEY, fromUrl)
      return fromUrl
    }
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

interface SessionContextValue {
  phone: string | null
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [phone] = useState<string | null>(readInitialPhone)
  const value = useMemo(() => ({ phone }), [phone])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider")
  return ctx
}
