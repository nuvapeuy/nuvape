import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FlagPill } from "@/components/flag-pill";
import { ProductRow } from "@/components/product-row";
import { TrustSection } from "@/components/trust-section";
import { BrandsStrip } from "@/components/brands-strip";
import { getProducts, getAllCategories } from "@/lib/products";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "59892052416";
const HERO_PRODUCT = {
  name: "Miami Mint 40K",
  brand: "ELFBAR",
  price: 1150,
  puffs: 40000,
  flags: ["HOT"] as string[],
  imageUrl: "/products/MiamiMINT_v2.png",
  slug: "miami-mint-40k",
};

const CATEGORY_EMOJI: Record<string, string> = {
  Mentolados: "❄️",
  Frutales: "🍓",
  Cítricos: "🍋",
  Dulces: "🍬",
};

export default async function Home() {
  const [allProducts, allCategories] = await Promise.all([getProducts(), getAllCategories()]);
  const hero = HERO_PRODUCT;

  const bestSellers = allProducts.filter((p) => p.flags.includes("HOT"));
  const categoryRows = allCategories
    .map((c) => ({
      name: c.name,
      emoji: CATEGORY_EMOJI[c.name] ?? "📦",
      products: allProducts.filter((p) => p.categories.includes(c.name)),
    }))
    .filter((r) => r.products.length > 0);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(176,38,255,0.18),transparent_50%),radial-gradient(circle_at_80%_10%,rgba(57,255,136,0.08),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-full bg-[var(--neon-purple)]/20 blur-3xl" />
            {hero.imageUrl ? (
              <Image src={hero.imageUrl} alt={hero.name} fill className="relative object-contain drop-shadow-[0_0_40px_rgba(176,38,255,0.45)]" priority />
            ) : (
              <div className="relative flex h-full items-center justify-center text-sm text-muted-foreground">IMG</div>
            )}
          </div>

          <div className="text-center lg:text-left">
            <p className="text-xs font-semibold tracking-[0.35em] text-[var(--neon-purple)] uppercase glow-text-purple">
              NUVAPE
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              VAPES PREMIUM
            </h1>
            <div className="mt-5 flex justify-center gap-6 lg:justify-start">
              <Stat value="+5" label="Sabores" />
              <Stat value="1" label="Marca" />
              <Stat value="24/7" label="Atención" />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {hero.flags.map((flag) => (
                <FlagPill key={flag} flag={flag} />
              ))}
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white">{hero.name}</h2>
            <p className="text-sm text-muted-foreground">{hero.brand} · {hero.puffs.toLocaleString("es-AR")} puffs</p>
            <p className="mt-2 font-heading text-3xl font-extrabold text-white">
              ${hero.price.toLocaleString("es-AR")}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/catalogo"
                className={cn(buttonVariants({ size: "lg" }), "glow-purple bg-[var(--neon-purple)] px-8 text-white hover:bg-[var(--neon-purple)]/90")}
              >
                Ver catálogo
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-[var(--neon-green)]/40 px-8 text-[var(--neon-green)] hover:bg-[var(--neon-green)]/10")}
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <form action="/catalogo" className="relative mx-auto max-w-2xl px-4 pb-16 sm:px-6">
          <div className="glass flex items-center gap-3 rounded-full px-5 py-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              name="q"
              placeholder="Buscar sabores, marcas o productos"
              className="w-full bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </form>
      </section>

      <BrandsStrip />

      <div className="pt-14">
        <ProductRow emoji="🔥" title="Más vendidos" products={bestSellers} />
        {categoryRows.map((r) => (
          <ProductRow key={r.name} emoji={r.emoji} title={r.name} products={r.products} />
        ))}
      </div>

      <TrustSection />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-heading text-xl font-extrabold text-[var(--neon-purple)]">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}
