// RECOMENDACIONES (Home y carrito) — SIMULADO.
//
// En producción esta lista la arma el **microservicio de estrategias de DEAL** (el mismo que
// define cómo se ganan puntos, ver venadoMoney.ts): al eCommerce le llega, por cliente, un
// conjunto de GRUPOS recomendados y cada grupo apunta a un scope — una marca, una categoría, una
// familia/subfamilia o una lista explícita de productos. Por eso el chip del Home no es "marca" ni
// "categoría": es el grupo tal como venga, y la UI resuelve el ícono según su scope.
//
// Acá los grupos son fijos y los productos se resuelven contra el catálogo real, priorizando los
// que tienen foto (lo que más vende, ver DESIGN.md). Reemplazar `RECOMMENDATION_GROUPS` por la
// respuesta del servicio cuando exista; el resto de la UI no debería cambiar.
import { categories } from "./categories"
import { hasProductImage } from "./productImages"
import { products, type Product } from "./products"

export type RecommendationScope =
  | { kind: "brand"; brand: string }
  | { kind: "category"; categoryId: string }
  | { kind: "subcategory"; subcategoryId: string }
  | { kind: "product"; productIds: string[] }

export interface RecommendationGroup {
  id: string
  /** Texto del chip. */
  label: string
  /** Bajada de la sección cuando el grupo está activo. */
  subtitle: string
  scope: RecommendationScope
}

/** Cuántos productos entran en la grilla del Home (el resto se ve con "Ver todo"). */
export const RECOMMENDED_LIMIT = 6

// Ningún grupo demo usa hoy el scope `product` (el usuario sacó "Para tu heladera" el 2026-09-03),
// pero el scope sigue soportado porque el servicio real puede mandar una lista explícita.
export const RECOMMENDATION_GROUPS: RecommendationGroup[] = [
  { id: "kris", label: "KRIS", subtitle: "Recomendados de KRIS", scope: { kind: "brand", brand: "KRIS" } },
  {
    id: "bristar",
    label: "Bristar",
    subtitle: "Recomendados de Bristar",
    scope: { kind: "brand", brand: "Bristar" },
  },
  {
    id: "salsas",
    label: "Salsas",
    subtitle: "Recomendados en Salsas",
    scope: { kind: "category", categoryId: "salsas" },
  },
  {
    id: "limpieza",
    label: "Limpieza del Hogar",
    subtitle: "Recomendados en Limpieza del Hogar",
    scope: { kind: "category", categoryId: "limpieza-del-hogar" },
  },
]

function matchesScope(product: Product, scope: RecommendationScope): boolean {
  switch (scope.kind) {
    case "brand":
      return product.brand === scope.brand
    case "category":
      return product.categoryId === scope.categoryId
    case "subcategory":
      return product.subcategoryId === scope.subcategoryId
    case "product":
      return scope.productIds.includes(product.id)
  }
}

/** Productos del grupo: los que tienen foto primero, y en el orden del scope si es una lista. */
export function productsForGroup(group: RecommendationGroup, limit = RECOMMENDED_LIMIT): Product[] {
  if (group.scope.kind === "product") {
    const byId = new Map(products.map((p) => [p.id, p]))
    return group.scope.productIds
      .map((id) => byId.get(id))
      .filter((p): p is Product => Boolean(p))
      .slice(0, limit)
  }
  const list = products.filter((p) => matchesScope(p, group.scope))
  const withPhoto = list.filter(hasProductImage)
  return (withPhoto.length >= limit ? withPhoto : [...withPhoto, ...list.filter((p) => !hasProductImage(p))]).slice(
    0,
    limit
  )
}

/**
 * Mezcla de todos los grupos tomando de a uno por grupo (round-robin) para que se vean varias
 * marcas y categorías a la vez, que es justo lo que manda el servicio de estrategias. Los grupos
 * se pisan entre sí (una marca cae dentro de una categoría), así que además de por id se descarta
 * por NOMBRE: si no, la grilla muestra el mismo producto en dos tamaños y parece repetida.
 */
function mixGroups(limit: number, skipIds: ReadonlySet<string>, skipNames: ReadonlySet<string>): Product[] {
  // El pool se agranda con lo que hay que saltear para que igual queden `limit` productos.
  const depth = limit * 2 + skipIds.size
  const pools = RECOMMENDATION_GROUPS.map((g) => productsForGroup(g, depth))
  const picked: Product[] = []
  const seenNames = new Set(skipNames)
  const rounds = Math.max(...pools.map((p) => p.length), 0)
  for (let round = 0; picked.length < limit && round < rounds; round++) {
    for (const pool of pools) {
      const p = pool[round]
      if (!p || skipIds.has(p.id) || seenNames.has(p.name)) continue
      seenNames.add(p.name)
      picked.push(p)
      if (picked.length === limit) break
    }
  }
  return picked
}

/** "Para vos" del Home: mezcla de todos los grupos recomendados para el cliente. */
export function recommendedForYou(limit = RECOMMENDED_LIMIT): Product[] {
  return mixGroups(limit, new Set(), new Set())
}

/** Cuántos productos entran en el rail del carrito (rail horizontal, no grilla). */
export const CART_RECOMMENDED_LIMIT = 8

/**
 * Recomendados para mostrar DENTRO del carrito (decisión del usuario, 2026-09-04): son los mismos
 * grupos que manda el microservicio de estrategias para ese cliente — no una lógica de "quien
 * llevó X también llevó Y" inventada en el front — descartando lo que ya está en el pedido.
 * Se saltea también por nombre: si ya lleva la presentación de 500 ml, ofrecerle la de 1 L como
 * "recomendado" parece un bug, no una sugerencia.
 */
export function recommendedForCart(inCartIds: readonly string[], limit = CART_RECOMMENDED_LIMIT): Product[] {
  const byId = new Map(products.map((p) => [p.id, p]))
  const names = new Set(
    inCartIds.map((id) => byId.get(id)?.name).filter((n): n is string => Boolean(n))
  )
  return mixGroups(limit, new Set(inCartIds), names)
}

/** A dónde lleva "Ver todo" con este grupo activo. */
export function groupLink(group: RecommendationGroup): string {
  switch (group.scope.kind) {
    case "brand":
      return `/catalogo?marca=${encodeURIComponent(group.scope.brand)}`
    case "category":
      return `/catalogo?categoria=${group.scope.categoryId}`
    case "subcategory": {
      const { subcategoryId } = group.scope
      const category = categories.find((c) => c.subcategories.some((s) => s.id === subcategoryId))
      return category ? `/catalogo?categoria=${category.id}&sub=${subcategoryId}` : "/catalogo"
    }
    case "product":
      return "/catalogo"
  }
}
