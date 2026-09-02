// Fotos reales de producto, resueltas POR CONVENCIÓN de nombre de archivo en public/productos/:
//
//   public/productos/<sku>.<png|jpg|jpeg|webp>      (ej. 300986.png) — caso normal
//   public/productos/<id de products.ts>.<ext>       — solo para productos con sku: null
//
// Vite no puede globear la carpeta public, así que `scripts/product-images-manifest.mjs`
// genera `productImageManifest.json` (basename → archivo) antes de cada `npm run dev` /
// `npm run build` (hooks predev/prebuild). Si agregás fotos con el server corriendo:
// `npm run images` y recargar. Los productos sin archivo muestran el placeholder de marca/
// categoría en ProductCard; no se inventan fotos. El código "000000" del catálogo (productos
// sin SKU) se ignora porque es ambiguo entre varios productos.
import manifest from "./productImageManifest.json"
import type { Product } from "./products"

const files = manifest as Record<string, string>

export function productImage(product: Pick<Product, "id" | "sku">): string | undefined {
  const file = (product.sku && files[product.sku]) || files[product.id]
  return file ? `/productos/${encodeURIComponent(file)}` : undefined
}

export function hasProductImage(product: Pick<Product, "id" | "sku">): boolean {
  return productImage(product) !== undefined
}
