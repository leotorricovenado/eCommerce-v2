import { useMemo } from "react"

interface QRCodeMockProps {
  /** Semilla para que el mismo pedido dibuje siempre el mismo patrón. */
  seed: string
  size?: number
  className?: string
}

const MODULES = 29

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function isFinder(x: number, y: number): boolean {
  const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7
  return inBox(0, 0) || inBox(MODULES - 7, 0) || inBox(0, MODULES - 7)
}

function finderDark(x: number, y: number): boolean {
  const local = (ox: number, oy: number) => {
    const lx = x - ox
    const ly = y - oy
    if (lx < 0 || ly < 0 || lx > 6 || ly > 6) return null
    const ring = lx === 0 || ly === 0 || lx === 6 || ly === 6
    const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
    return ring || core
  }
  return local(0, 0) ?? local(MODULES - 7, 0) ?? local(0, MODULES - 7) ?? false
}

/**
 * QR de DEMO: patrón pseudoaleatorio determinístico con los tres "finder patterns" reales para
 * que se lea como QR. NO codifica nada — en producción llega `qrBase64` desde Collections (EC1).
 */
export function QRCodeMock({ seed, size = 220, className }: QRCodeMockProps) {
  const cells = useMemo(() => {
    const out: [number, number][] = []
    let h = hash(seed)
    for (let y = 0; y < MODULES; y++) {
      for (let x = 0; x < MODULES; x++) {
        if (isFinder(x, y)) {
          if (finderDark(x, y)) out.push([x, y])
          continue
        }
        // separador blanco alrededor de los finders
        if ((x === 7 && (y < 8 || y > MODULES - 9)) || (y === 7 && (x < 8 || x > MODULES - 9)) || (x === MODULES - 8 && y < 8)) continue
        h = (Math.imul(h, 1103515245) + 12345) >>> 0
        if ((h >>> 16) % 100 < 46) out.push([x, y])
      }
    }
    return out
  }, [seed])

  const unit = size / MODULES
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Código QR de pago (demo)"
      className={className}
    >
      <rect width={size} height={size} fill="white" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x * unit} y={y * unit} width={unit + 0.3} height={unit + 0.3} fill="#0f172a" />
      ))}
    </svg>
  )
}
