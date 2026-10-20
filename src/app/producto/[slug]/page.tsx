import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { ProductDetail } from "@/components/product-detail";

// Siempre fresco: stock, precio y si el producto/marca sigue activo (antes quedaba congelado desde el build).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = `${product.name} | ${product.brand} | NUVAPE`;
  const description = `${product.description} ${product.puffs.toLocaleString("es-AR")} puffs, ${product.nicotineLevel}% nicotina.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
