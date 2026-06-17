import type { MetadataRoute } from "next";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nuvape.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/catalogo", "/marcas", "/promociones", "/contacto"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = MOCK_PRODUCTS.map((p) => ({
    url: `${BASE_URL}/producto/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes];
}
