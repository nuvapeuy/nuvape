"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FlagPill } from "@/components/flag-pill";
import { stockFlags, type MockProduct } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "59892052416";

export function ProductDetail({ product }: { product: MockProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setActiveImage((i) => Math.min(i + 1, images.length - 1));
    else setActiveImage((i) => Math.max(i - 1, 0));
    touchStartX.current = null;
  }
  const outOfStock = product.stock === 0;
  const allFlags = [...product.flags, ...stockFlags(product.stock)];
  const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-col gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-colors",
                    i === activeImage ? "border-[var(--neon-purple)]" : "border-white/10 hover:border-white/30"
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div
            className="relative flex-1 aspect-square rounded-2xl"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
              {allFlags.map((flag) => (
                <FlagPill key={flag} flag={flag} />
              ))}
            </div>
            <div className="absolute inset-10 rounded-full bg-[var(--neon-purple)]/15 blur-3xl" />
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="relative object-contain p-8 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              />
            ) : (
              <div className="relative flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin imagen
              </div>
            )}
            {/* Dot indicators — mobile only */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 lg:hidden">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === activeImage ? "w-4 bg-[var(--neon-purple)]" : "w-1.5 bg-white/30"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {product.brand}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-[var(--neon-purple)] glow-text-purple">
            ${product.price.toLocaleString("es-AR")}
          </p>

          <div className="mt-6 flex gap-6 text-sm text-muted-foreground">
            <div>
              <p className="text-white font-semibold">{product.puffs.toLocaleString("es-AR")}</p>
              <p>Puffs</p>
            </div>
            <div>
              <p className="text-white font-semibold">{product.nicotineLevel}%</p>
              <p>Nicotina</p>
            </div>
            <div>
              <p className="text-white font-semibold">{product.stock}</p>
              <p>Stock</p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold tracking-wide text-white uppercase">
              Sabores disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {product.flavors.map((f) => (
                <span key={f} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {!outOfStock && (
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/5"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-white">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/5"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              disabled={outOfStock}
              onClick={() =>
                addItem(
                  {
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    imageUrl: product.imageUrl || null,
                    stock: product.stock,
                  },
                  quantity
                )
              }
              className="flex-1 bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90 disabled:opacity-40"
            >
              {outOfStock ? "Agotado" : "Comprar"}
            </Button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, me interesa ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center rounded-lg border border-[var(--neon-green)]/40 px-4 py-2 text-sm font-semibold text-[var(--neon-green)] hover:bg-[var(--neon-green)]/10"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
