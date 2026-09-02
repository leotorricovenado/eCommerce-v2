import { useEffect } from "react"
import { useLocation } from "react-router"

/**
 * Sube al tope al cambiar de pantalla (pathname). Sin esto, al tocar un logo del Home estando
 * scrolleado abajo, el Catálogo aparecía a mitad de página. Los cambios de query dentro de una
 * misma pantalla (filtros del catálogo) NO scrollean.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}
