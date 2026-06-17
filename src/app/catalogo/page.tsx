import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import CatalogoClient from "./catalogo-client";

export default async function CatalogoPage() {
  const products = await getProducts();
  return (
    <Suspense>
      <CatalogoClient products={products} />
    </Suspense>
  );
}
