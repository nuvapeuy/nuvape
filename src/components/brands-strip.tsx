import { prisma } from "@/lib/prisma";
import { publicProductWhere } from "@/lib/products";

// Marcas de la BD: las que tienen productos publicados se resaltan; el resto se muestra
// apagado como "próximamente". Una marca nueva aparece al crearla en /admin/marcas.
export async function BrandsStrip() {
  const brands = await prisma.brand.findMany({
    select: { name: true, _count: { select: { products: { where: publicProductWhere } } } },
    orderBy: { name: "asc" },
  });
  if (brands.length === 0) return null;
  const sorted = [...brands].sort((a, b) => Number(b._count.products > 0) - Number(a._count.products > 0));

  return (
    <section className="border-y border-white/5 bg-[#0a0a0a] py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-4 sm:px-6">
        {sorted.map((brand) => (
          <span
            key={brand.name}
            className={
              brand._count.products > 0
                ? "text-sm font-extrabold tracking-widest text-[var(--neon-yellow)] uppercase [text-shadow:0_0_10px_rgba(255,225,77,0.6)]"
                : "text-sm font-bold tracking-widest text-muted-foreground/70 uppercase transition-colors hover:text-white"
            }
          >
            {brand.name}
          </span>
        ))}
      </div>
    </section>
  );
}
