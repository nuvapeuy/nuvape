import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import type { MockProduct } from "./mock-data";

// Qué ve la tienda pública: productos activos de marcas activas.
// Toda consulta pública de productos tiene que pasar por acá.
export const publicProductWhere = {
  active: true,
  brand: { active: true },
} satisfies Prisma.ProductWhereInput;

function mapProduct(p: any): MockProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand.name,
    price: Number(p.price),
    puffs: p.puffs,
    nicotineLevel: Number(p.nicotineLevel),
    stock: p.stock,
    imageUrl: p.images[0]?.url ?? "",
    images: p.images.map((i: any) => i.url),
    flags: p.flags.map((pf: any) => pf.flag.name),
    description: p.description,
    flavors: p.flavors.map((pf: any) => pf.flavor.name),
    categories: p.categories?.map((pc: any) => pc.category.name) ?? [],
  };
}

const include = {
  brand: true,
  flags: { include: { flag: true } },
  flavors: { include: { flavor: true } },
  categories: { include: { category: true } },
  images: { orderBy: { position: "asc" as const } },
};

export async function getProducts(): Promise<MockProduct[]> {
  const products = await prisma.product.findMany({
    where: publicProductWhere,
    include,
    orderBy: { createdAt: "asc" },
  });
  return products.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<MockProduct | null> {
  const p = await prisma.product.findFirst({ where: { slug, ...publicProductWhere }, include });
  if (!p) return null;
  return mapProduct(p);
}

export async function getAllCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { products: { where: { product: publicProductWhere } } } },
    },
    orderBy: { name: "asc" },
  });
}

// Marca actual de cada producto, para guardarla en los ítems de pedidos que arma el admin.
// La decide la BD, no lo que mande el cliente.
export async function brandNamesByProductId(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, brand: { select: { name: true } } },
  });
  return new Map(products.map((p) => [p.id, p.brand.name]));
}
