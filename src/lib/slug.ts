import { prisma } from "./prisma";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Slug de un producto nuevo: lleva la marca adelante (lost-mary-watermelon-ice-40k) para que
// el mismo sabor de dos marcas no choque. Los productos existentes conservan su slug.
export async function uniqueProductSlug(brandSlug: string, name: string) {
  const nameSlug = slugify(name);
  const base = nameSlug.startsWith(`${brandSlug}-`) || nameSlug === brandSlug ? nameSlug : `${brandSlug}-${nameSlug}`;

  let slug = base;
  for (let n = 2; await prisma.product.findUnique({ where: { slug }, select: { id: true } }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}
