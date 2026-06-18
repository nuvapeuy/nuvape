export type FlagDef = {
  name: string;
  label: string;
  color: string;
};

// Paleta disciplinada: negro + morado + verde, con rojo reservado para urgencia/agotado.
export const FLAG_COLORS: Record<string, string> = {
  AGOTADO: "#ff3355",
  SUMMER_EDITION: "#39ff88",
  NEW: "#39ff88",
  TOP_SELLER: "#b026ff",
  HOT: "#f59e0b",
  ULTIMAS_UNIDADES: "#ff3355",
  LIMITED_EDITION: "#b026ff",
  OFF_20: "#ff3355",
  TWO_FOR_ONE: "#b026ff",
  PREVENTA: "#b026ff",
  QUEDAN_POCAS: "#ff3355",
};

// Marcas que trabajamos. `inStock: true` las resalta en amarillo en el strip de marcas
// del home — editar acá (o desde el admin más adelante) según entre/salga stock.
export type BrandStripEntry = { name: string; inStock: boolean };

export const BRANDS_STRIP: BrandStripEntry[] = [
  { name: "ELFBAR", inStock: true },
  { name: "LOST MARY", inStock: false },
  { name: "GEEK BAR", inStock: false },
  { name: "VOZOL", inStock: false },
  { name: "RANDM", inStock: false },
];

export type MockProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  puffs: number;
  nicotineLevel: number;
  stock: number;
  imageUrl: string;
  images: string[];
  flags: string[];
  description: string;
  flavors: string[];
  categories: string[];
};

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "1",
    slug: "blue-razz-ice-40k",
    name: "Blue Razz ICE 40K",
    brand: "ELFBAR",
    price: 1150,
    puffs: 40000,
    nicotineLevel: 5,
    stock: 7,
    imageUrl: "/products/BlueRazzICE.png",
    images: ["/products/BlueRazzICE.png", "/products/BlueRazzICE_v2.png", "/products/BlueRazzICE_v3.png"],
    flags: [],
    description: "Frambuesa azul helada con 5 niveles de frío ajustable. Pantalla digital integrada.",
    flavors: ["Blue Razz Ice"], categories: [],
  },
  {
    id: "2",
    slug: "watermelon-ice-40k",
    name: "Watermelon ICE 40K",
    brand: "ELFBAR",
    price: 1150,
    puffs: 40000,
    nicotineLevel: 5,
    stock: 7,
    imageUrl: "/products/WatermelonICE.png",
    images: ["/products/WatermelonICE.png", "/products/WatermelonICE_v2.png", "/products/WatermelonICE_v3.png"],
    flags: [],
    description: "Sandía jugosa con un final helado refrescante. Pantalla digital integrada.",
    flavors: ["Watermelon Ice"], categories: [],
  },
  {
    id: "3",
    slug: "grape-ice-40k",
    name: "Grape ICE 40K",
    brand: "ELFBAR",
    price: 1150,
    puffs: 40000,
    nicotineLevel: 5,
    stock: 20,
    imageUrl: "/products/GrapeICE.png",
    images: ["/products/GrapeICE.png", "/products/GrapeICE_v2.png", "/products/GrapeICE_v3.png"],
    flags: ["HOT"],
    description: "Uva intensa con toque helado y 5 niveles de frío ajustable.",
    flavors: ["Grape Ice"], categories: [],
  },
  {
    id: "4",
    slug: "mango-magic-40k",
    name: "Mango Magic 40K",
    brand: "ELFBAR",
    price: 1150,
    puffs: 40000,
    nicotineLevel: 5,
    stock: 20,
    imageUrl: "/products/MangoMAGIC.png",
    images: ["/products/MangoMAGIC.png", "/products/MangoMAGIC_v2.png", "/products/MangoMAGIC_v3.png"],
    flags: ["HOT"],
    description: "Mango tropical dulce y cremoso con pantalla digital integrada.",
    flavors: ["Mango"], categories: [],
  },
  {
    id: "5",
    slug: "miami-mint-40k",
    name: "Miami Mint 40K",
    brand: "ELFBAR",
    price: 1150,
    puffs: 40000,
    nicotineLevel: 5,
    stock: 20,
    imageUrl: "/products/MiamiMINT.png",
    images: ["/products/MiamiMINT.png", "/products/MiamiMINT_v2.png", "/products/MiamiMINT_v3.png"],
    flags: ["HOT"],
    description: "Menta fresca y refrescante, ideal para los amantes del hielo.",
    flavors: ["Mint"], categories: [],
  },
  {
    id: "6",
    slug: "peach-plus-40k",
    name: "Peach + 40K",
    brand: "ELFBAR",
    price: 1150,
    puffs: 40000,
    nicotineLevel: 5,
    stock: 20,
    imageUrl: "/products/PeachPlus.png",
    images: ["/products/PeachPlus.png", "/products/PeachPlus_v2.png", "/products/PeachPlus_v3.png"],
    flags: [],
    description: "Durazno dulce y jugoso con un toque vibrante.",
    flavors: ["Peach"], categories: [],
  },
  {
    id: "7",
    slug: "black-mint-40k",
    name: "Black Mint 40K",
    brand: "ELFBAR",
    price: 1150,
    puffs: 40000,
    nicotineLevel: 5,
    stock: 6,
    imageUrl: "/products/BlackMINT.png",
    images: ["/products/BlackMINT.png", "/products/BlackMINT_v2.png", "/products/BlackMINT_v3.png"],
    flags: ["SUMMER_EDITION"],
    description: "Menta negra intensa con sabor profundo y refrescante.",
    flavors: ["Mint", "Black Mint"],
    categories: [],
  },
];

export function flagLabel(flag: string) {
  const labels: Record<string, string> = {
    AGOTADO: "AGOTADO",
    HOT: "🔥 HOT",
    SUMMER_EDITION: "SUMMER EDITION",
    NEW: "NEW",
    TOP_SELLER: "TOP SELLER",
    ULTIMAS_UNIDADES: "ÚLTIMAS UNIDADES",
    LIMITED_EDITION: "LIMITED EDITION",
    OFF_20: "20% OFF",
    TWO_FOR_ONE: "2x1",
    PREVENTA: "PREVENTA",
    QUEDAN_POCAS: "QUEDAN POCAS",
  };
  return labels[flag] ?? flag;
}

export function stockFlags(stock: number): string[] {
  if (stock === 0) return ["AGOTADO"];
  if (stock <= 2) return ["QUEDAN_POCAS"];
  if (stock <= 5) return ["ULTIMAS_UNIDADES"];
  return [];
}
