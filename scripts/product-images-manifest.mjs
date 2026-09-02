// Genera src/data/productImageManifest.json a partir de public/productos/.
//
// Convención de nombre de archivo: <sku>.<png|jpg|jpeg|webp>  (ej. 300986.png). Para los
// productos sin SKU (sku: null en products.ts) se acepta <id>.<ext>. Vite no puede globear la
// carpeta public, por eso este script corre automáticamente antes de `npm run dev` y
// `npm run build` (predev / prebuild). Si agregás fotos con el server corriendo, volvé a correr
// `npm run images` (o reiniciá el dev server).
import { readdirSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dir = join(root, "public", "productos")
const out = join(root, "src", "data", "productImageManifest.json")

const EXT = /\.(png|jpe?g|webp)$/i
const PRIORITY = ["webp", "png", "jpg", "jpeg"]

const manifest = {}
for (const file of readdirSync(dir)) {
  if (!EXT.test(file)) continue
  const key = file.replace(EXT, "")
  // "000000" es el código comodín del catálogo para productos sin SKU — ambiguo, se ignora.
  if (key === "000000") continue
  const ext = file.split(".").pop().toLowerCase()
  const prev = manifest[key]
  if (!prev || PRIORITY.indexOf(ext) < PRIORITY.indexOf(prev.split(".").pop().toLowerCase())) {
    manifest[key] = file
  }
}

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n")
console.log(`[product-images] ${Object.keys(manifest).length} fotos → ${out}`)
