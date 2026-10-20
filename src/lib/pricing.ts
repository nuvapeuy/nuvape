// Fuente única de precios que no salen de la BD: costo de envío y packs.
// La usan la tienda, el admin y el servidor (que es quien decide el precio final).

export const SHIPPING_COST = 150;

export function shippingFor(deliveryType: string) {
  return deliveryType === "DOMICILIO" ? SHIPPING_COST : 0;
}

export type PromoDef = {
  id: string;
  title: string;
  description: string;
  // Todos los productos del pack tienen que ser de esta marca (Brand.name).
  brandName: string;
  qty: number;
  price: number;
  badge: string;
  image: string;
};

export const PROMOS: PromoDef[] = [
  {
    id: "elfbar-x3",
    title: "Pack x3",
    description: "Llevate 3 ELFBAR Ice King 40K a elección",
    brandName: "ELFBAR",
    qty: 3,
    price: 3300,
    badge: "AHORRÁS $150",
    image: "/promos/Elfbar PROMO X3.png",
  },
  {
    id: "elfbar-x5",
    title: "Pack x5",
    description: "Llevate 5 ELFBAR Ice King 40K a elección",
    brandName: "ELFBAR",
    qty: 5,
    price: 5000,
    badge: "AHORRÁS $750",
    image: "/promos/Elfbar PROMO X3.png",
  },
];

export function findPromo(id: string) {
  return PROMOS.find((p) => p.id === id);
}
