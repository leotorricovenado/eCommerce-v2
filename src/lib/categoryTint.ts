const TILE_TINTS = [
  "bg-primary/10 text-primary",
  "bg-accent/10 text-accent",
  "bg-success/10 text-success",
  "bg-warning/10 text-warning",
  "bg-category-blue/10 text-category-blue",
  "bg-category-green/10 text-category-green",
]

export function tintForCategory(categoryId: string): string {
  let hash = 0
  for (let i = 0; i < categoryId.length; i++) hash = (hash * 31 + categoryId.charCodeAt(i)) >>> 0
  return TILE_TINTS[hash % TILE_TINTS.length]
}
