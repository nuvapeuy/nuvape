import { Suspense } from "react";
import { getProducts, getAllCategories } from "@/lib/products";
import CatalogoClient from "./catalogo-client";

export default async function CatalogoPage() {
  const [products, categories] = await Promise.all([getProducts(), getAllCategories()]);
  const cats = categories.map((c) => ({ name: c.name, productCount: c._count.products }));
  return (
    <Suspense>
      <CatalogoClient products={products} allCategories={cats} />
    </Suspense>
  );
}
