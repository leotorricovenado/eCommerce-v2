// Fotos "familia de productos" por marca (public/family-products/, 600×600 sobre fondo blanco,
// con el wordmark arriba), provistas por el usuario el 2026-09-02. Se usan como banner de marca en
// el Catálogo cuando se filtra por `?marca=`. Claves = nombre de marca EXACTO del catálogo.
// Sin foto de familia: "Pulpín", "De la Granja", "KRIS Energy", "Raptor", "Revive". Hay fotos de
// marcas que todavía no están en el catálogo (azucaraditas, choco-explosion, fleischmann,
// frutaritos, kriskao) — se mapean cuando lleguen sus catálogos.
export const brandFamily: Record<string, string> = {
  Bristar: "/family-products/bristar.webp",
  "Casa del Camba": "/family-products/casa-del-camba.webp",
  "El Pescador": "/family-products/el-pescador.webp",
  Frussion: "/family-products/frussion.webp",
  KRIS: "/family-products/kris.webp",
  Kriolla: "/family-products/kriolla.webp",
  Real: "/family-products/real.webp",
  Shabay: "/family-products/shabay.webp",
  Speranza: "/family-products/speranza.webp",
  Raptor: "/family-products/raptor.webp",
};
