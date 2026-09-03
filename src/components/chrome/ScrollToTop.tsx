import { useEffect } from "react"
import { useLocation, useNavigationType } from "react-router"

/**
 * Sube al tope al ENTRAR a una pantalla nueva (PUSH/REPLACE). Al volver atrás (POP) no toca el
 * scroll, así el navegador restaura la posición donde el usuario estaba (ej. volver del detalle
 * al catálogo cae en el mismo producto, no arriba de todo). Los cambios de query dentro de una
 * misma pantalla (filtros del catálogo) tampoco scrollean.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  useEffect(() => {
    if (navigationType === "POP") return
    window.scrollTo({ top: 0 })
  }, [pathname, navigationType])
  return null
}
