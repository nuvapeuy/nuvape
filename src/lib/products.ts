import { prisma } from "./prisma";
import type { MockProduct } from "./mock-data";

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
    where: { active: true },
    include,
    orderBy: { createdAt: "asc" },
  });
  return products.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<MockProduct | null> {
  const p = await prisma.product.findUnique({ where: { slug }, include });
  if (!p) return null;
  return mapProduct(p);
}

export async function getAllCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}
