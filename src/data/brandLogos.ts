// Logos reales de marca provistos por el usuario (2026-09-02) en public/marcas/ — todos en
// formato isotipo circular (viewBox cuadrado), pensados para ir dentro de un círculo blanco.
// Claves = nombre de marca EXACTO como aparece en categories.ts / products.ts.
// Sin logo todavía: "De la Granja", "KRIS Energy", "Raptor", "Revive" → se muestran como
// monograma tintado (no inventar isotipos). Hay logos en la carpeta de marcas que NO están en el
// catálogo actual (Azucaraditas, Choco Explosion, Fleischmann, Frutaritos, Kriskao) — se mapean
// cuando lleguen sus catálogos.
export const brandLogos: Record<string, string> = {
  Bristar: "/marcas/bristar.svg",
  "Casa del Camba": "/marcas/casa-del-camba.svg",
  "El Pescador": "/marcas/el-pescador.svg",
  Frussion: "/marcas/frussion.svg",
  KRIS: "/marcas/kris.svg",
  Kriolla: "/marcas/kriolla.svg",
  Pulpín: "/marcas/pulpin.svg",
  Real: "/marcas/real.svg",
  Shabay: "/marcas/shabay.svg",
  Speranza: "/marcas/speranza.svg",
}

/** Logo blanco de Grupo Venado (para fondos de marca, ej. TopBar). */
export const groupLogoWhite = "/marcas/grupo-venado-blanco.svg"
