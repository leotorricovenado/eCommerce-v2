import { useEffect, useState } from "react"

/** Cuenta regresiva en segundos desde `seconds`. Devuelve segundos restantes y label mm:ss. */
export function useCountdown(seconds: number, running = true) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000)
    return () => window.clearInterval(t)
  }, [running])

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0")
  const ss = String(remaining % 60).padStart(2, "0")
  return { remaining, label: `${mm}:${ss}`, expired: remaining === 0 }
}
