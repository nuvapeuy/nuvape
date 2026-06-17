"use client";

import Link from "next/link";
import Image from "next/image";
import { FlagPill } from "@/components/flag-pill";
import { stockFlags, type MockProduct } from "@/lib/mock-data";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: MockProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const allFlags = [...product.flags, ...stockFlags(product.stock)];
  const outOfStock = product.stock === 0;

  return (
    <div className="group glass relative flex h-[420px] flex-col overflow-hidden rounded-2xl p-4 transition-transform hover:-translate-y-1 hover:glow-purple">
      <Link href={`/producto/${product.slug}`} className="relative flex h-64 w-full items-center justify-center">
        <div className="absolute top-2 left-0 z-10 flex flex-wrap gap-1.5">
          {allFlags.slice(0, 3).map((flag) => (
            <FlagPill key={flag} flag={flag} />
          ))}
        </div>
        <div className="absolute inset-6 rounded-full bg-[var(--neon-purple)]/10 blur-2xl transition-colors group-hover:bg-[var(--neon-purple)]/20" />
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="relative object-contain p-3 drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            IMG
          </div>
        )}
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {product.brand}
        </p>
        <Link href={`/producto/${product.slug}`}>
          <h3 className="mt-1 font-heading text-xl leading-tight font-bold text-white hover:text-[var(--neon-purple)]">
            {product.name}
          </h3>
        </Link>
        <span className="mt-2 inline-flex w-fit items-center rounded-full bg-[var(--neon-purple)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--neon-purple)] ring-1 ring-[var(--neon-purple)]/30">
          {product.puffs.toLocaleString("es-AR")} PUFFS
        </span>
        <p className="mt-3 font-heading text-2xl font-extrabold text-white">
          ${product.price.toLocaleString("es-AR")}
        </p>
        <p className="text-xs text-muted-foreground">
          {outOfStock ? "Sin stock" : `${product.stock} disponibles`}
        </p>

        <Button
          disabled={outOfStock}
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              imageUrl: product.imageUrl || null,
              stock: product.stock,
            })
          }
          className="mt-3 w-full bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90 disabled:opacity-40"
        >
          {outOfStock ? "Agotado" : "Agregar al carrito"}
        </Button>
      </div>
    </div>
  );
}
