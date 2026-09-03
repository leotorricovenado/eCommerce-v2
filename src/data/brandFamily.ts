// Fotos "familia de productos" por marca (public/family-products/, 600×600 sobre fondo blanco,
// con el wordmark arriba), provistas por el usuario el 2026-09-02. Se usan como banner de marca en
// el Catálogo cuando se filtra por `?marca=`. Claves = nombre de marca EXACTO del catálogo.
// Sin foto de familia: "Pulpín", "De la Granja", "KRIS Energy", "Raptor", "Revive". Hay fotos de
// marcas que todavía no están en el catálogo (azucaraditas, choco-explosion, fleischmann,
// frutaritos, kriskao) — se mapean cuando lleguen sus catálogos.
export const brandFamily: Record<string, string> = {
  Bristar: "/family-products/Bristar-family.webp",
  "Casa del Camba": "/family-products/Casa-del-Camba.webp",
  "El Pescador": "/family-products/El-Pescador.webp",
  Frussion: "/family-products/Frussion.webp",
  KRIS: "/family-products/Kris-family.webp",
  Kriolla: "/family-products/Kriolla-Family.webp",
  Real: "/family-products/Real.webp",
  Shabay: "/family-products/family-Shabay.webp",
  Speranza: "/family-products/Speranza.webp",
  Raptor: "/family-products/raptor.webp",
};
