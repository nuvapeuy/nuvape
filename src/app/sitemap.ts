import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publicProductWhere } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/catalogo", "/contacto", "/faq"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const products = await prisma.product.findMany({
    where: publicProductWhere,
    select: { slug: true, updatedAt: true },
  });
  const productRoutes = products.map((p) => ({
    url: `${SITE_URL}/producto/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...productRoutes];
}
