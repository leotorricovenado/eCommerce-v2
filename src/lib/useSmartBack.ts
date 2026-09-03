import { useNavigate } from "react-router"

/**
 * "Volver" que no deja al usuario tirado: si hay historial dentro de la app vuelve un paso
 * (`navigate(-1)`); si la pantalla se abrió directo (link de WhatsApp, recarga) va al `fallback`.
 * React Router guarda el índice de la entrada en `history.state.idx`: 0 = primera entrada.
 */
export function useSmartBack(fallback: string) {
  const navigate = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
}
