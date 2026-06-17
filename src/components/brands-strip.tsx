import { BRANDS_STRIP } from "@/lib/mock-data";

export function BrandsStrip() {
  return (
    <section className="border-y border-white/5 bg-[#0a0a0a] py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-4 sm:px-6">
        {BRANDS_STRIP.map((brand) => (
          <span
            key={brand.name}
            className={
              brand.inStock
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
