import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { MockProduct } from "@/lib/mock-data";

export function ProductRow({
  emoji,
  title,
  products,
}: {
  emoji: string;
  title: string;
  products: MockProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-bold text-white">
          {emoji} {title}
        </h2>
        <Link href="/catalogo" className="text-sm font-medium text-[var(--neon-purple)] hover:underline">
          Ver todo
        </Link>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div key={product.id} className="w-[220px] shrink-0 sm:w-[250px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
