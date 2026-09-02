// Generado a partir de los catálogos reales Grupo Venado 2026 (Cuidado del Hogar,
// Bebidas, Panificación, Salsas-Culinarios-Postres) — ver memoria de proyecto
// `evenado-ecommerce-setup` / `categorias-ecommerce-parametrizacion` para el detalle
// del cruce contra las categorías del sistema. Alcance parcial: cubre solo los 4 PDFs
// recibidos — quedan afuera categorías sin catálogo todavía (Lácteos, Higiene Personal
// completo, Snacks, Congelados, Infusiones, etc.), a agregar cuando lleguen esos PDFs.

export interface Subcategory {
  id: string;
  label: string;
  productCount: number;
  brands: string[];
}

export interface Category {
  id: string;
  label: string;
  productCount: number;
  brands: string[];
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  {
    id: "limpieza-del-hogar",
    label: "Limpieza del Hogar",
    productCount: 119,
    brands: ["Bristar", "Pulpín"],
    subcategories: [
      {
        id: "vajilleros",
        label: "Vajilleros",
        productCount: 22,
        brands: ["Bristar", "Pulpín"],
      },
      {
        id: "detergentes",
        label: "Detergentes",
        productCount: 21,
        brands: ["Bristar", "Pulpín"],
      },
      {
        id: "lavandinas",
        label: "Lavandinas",
        productCount: 5,
        brands: ["Bristar"],
      },
      {
        id: "limpia-pisos",
        label: "Limpia Pisos",
        productCount: 35,
        brands: ["Bristar"],
      },
      {
        id: "ambientadores",
        label: "Ambientadores",
        productCount: 6,
        brands: ["Bristar"],
      },
      {
        id: "insecticidas",
        label: "Insecticidas",
        productCount: 3,
        brands: ["Bristar"],
      },
      {
        id: "limpiadores",
        label: "Limpiadores",
        productCount: 11,
        brands: ["Bristar"],
      },
      {
        id: "lustramuebles",
        label: "Lustramuebles",
        productCount: 3,
        brands: ["Bristar"],
      },
      {
        id: "pastillas-de-bano",
        label: "Pastillas de Baño",
        productCount: 4,
        brands: ["Bristar"],
      },
      {
        id: "guantes",
        label: "Guantes",
        productCount: 9,
        brands: ["Bristar"],
      },
    ],
  },
  {
    id: "cuidado-personal",
    label: "Cuidado Personal",
    productCount: 8,
    brands: ["Shabay"],
    subcategories: [
      {
        id: "jabones-de-manos",
        label: "Jabones de Manos",
        productCount: 8,
        brands: ["Shabay"],
      },
    ],
  },
  {
    id: "bebidas-en-polvo",
    label: "Bebidas en Polvo",
    productCount: 36,
    brands: ["KRIS", "KRIS Energy", "Real"],
    subcategories: [
      {
        id: "refrescos",
        label: "Refrescos",
        productCount: 20,
        brands: ["KRIS", "Real"],
      },
      {
        id: "milk-shake",
        label: "Milk Shake",
        productCount: 5,
        brands: ["KRIS"],
      },
      {
        id: "nectar-en-polvo",
        label: "Néctar en Polvo",
        productCount: 8,
        brands: ["KRIS"],
      },
      {
        id: "isotonicos-en-polvo",
        label: "Isotónicos en Polvo",
        productCount: 3,
        brands: ["KRIS Energy"],
      },
    ],
  },
  {
    id: "bebidas-rtd",
    label: "Bebidas RTD",
    productCount: 30,
    brands: ["Casa del Camba", "De la Granja", "Frussion", "Raptor", "Revive", "Speranza"],
    subcategories: [
      {
        id: "agua",
        label: "Agua",
        productCount: 3,
        brands: ["Speranza"],
      },
      {
        id: "nectares-y-bebidas-con-pulpa",
        label: "Néctares y Bebidas con Pulpa",
        productCount: 10,
        brands: ["De la Granja"],
      },
      {
        id: "bebidas-de-fruta",
        label: "Bebidas de Fruta",
        productCount: 5,
        brands: ["Frussion"],
      },
      {
        id: "bebidas-tradicionales",
        label: "Bebidas Tradicionales",
        productCount: 6,
        brands: ["Casa del Camba"],
      },
      {
        id: "isotonicas-y-energizantes",
        label: "Isotónicas y Energizantes",
        productCount: 6,
        brands: ["Raptor", "Revive"],
      },
    ],
  },
  {
    id: "panificacion",
    label: "Panificación",
    productCount: 9,
    brands: ["KRIS"],
    subcategories: [
      {
        id: "levadura",
        label: "Levadura",
        productCount: 4,
        brands: ["KRIS"],
      },
      {
        id: "polvo-para-hornear",
        label: "Polvo para Hornear",
        productCount: 3,
        brands: ["KRIS"],
      },
      {
        id: "mejorador-de-masa",
        label: "Mejorador de Masa",
        productCount: 2,
        brands: ["KRIS"],
      },
    ],
  },
  {
    id: "salsas",
    label: "Salsas",
    productCount: 83,
    brands: ["Casa del Camba", "KRIS", "Kriolla", "Real"],
    subcategories: [
      {
        id: "mayonesa",
        label: "Mayonesa",
        productCount: 15,
        brands: ["KRIS", "Real"],
      },
      {
        id: "ketchup",
        label: "Ketchup",
        productCount: 17,
        brands: ["KRIS", "Real"],
      },
      {
        id: "mostaza",
        label: "Mostaza",
        productCount: 14,
        brands: ["KRIS", "Real"],
      },
      {
        id: "salsas-especiales",
        label: "Salsas Especiales",
        productCount: 22,
        brands: ["KRIS"],
      },
      {
        id: "extractos",
        label: "Extractos",
        productCount: 7,
        brands: ["KRIS"],
      },
      {
        id: "salsas-regionales",
        label: "Salsas Regionales",
        productCount: 8,
        brands: ["Casa del Camba", "Kriolla"],
      },
    ],
  },
  {
    id: "culinarios",
    label: "Culinarios",
    productCount: 36,
    brands: ["El Pescador", "KRIS"],
    subcategories: [
      {
        id: "sopas-y-cremas",
        label: "Sopas y Cremas",
        productCount: 8,
        brands: ["KRIS"],
      },
      {
        id: "caldos-concentrados",
        label: "Caldos Concentrados",
        productCount: 8,
        brands: ["KRIS"],
      },
      {
        id: "pure-de-papas",
        label: "Puré de Papas",
        productCount: 5,
        brands: ["KRIS"],
      },
      {
        id: "maicena-y-gelatina",
        label: "Maicena y Gelatina",
        productCount: 6,
        brands: ["KRIS"],
      },
      {
        id: "papas-prefritas-y-almidon-de-maiz",
        label: "Papas Prefritas y Almidón de Maíz",
        productCount: 3,
        brands: ["KRIS"],
      },
      {
        id: "conservas-y-aceites",
        label: "Conservas y Aceites",
        productCount: 6,
        brands: ["El Pescador", "KRIS"],
      },
    ],
  },
  {
    id: "postres",
    label: "Postres",
    productCount: 30,
    brands: ["KRIS"],
    subcategories: [
      {
        id: "postres",
        label: "Postres",
        productCount: 27,
        brands: ["KRIS"],
      },
      {
        id: "achocolatados",
        label: "Achocolatados",
        productCount: 3,
        brands: ["KRIS"],
      },
    ],
  },
  {
    id: "cereales",
    label: "Cereales",
    productCount: 24,
    brands: ["KRIS"],
    subcategories: [
      {
        id: "cereales-y-avenas",
        label: "Cereales y Avenas",
        productCount: 24,
        brands: ["KRIS"],
      },
    ],
  },
];

export const brands: string[] = [
  "Bristar",
  "Casa del Camba",
  "De la Granja",
  "El Pescador",
  "Frussion",
  "KRIS",
  "KRIS Energy",
  "Kriolla",
  "Pulpín",
  "Raptor",
  "Real",
  "Revive",
  "Shabay",
  "Speranza",
];
