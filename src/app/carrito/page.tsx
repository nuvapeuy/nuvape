"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, cartSubtotal } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

const SHIPPING_COST = 150;

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = cartSubtotal(items);
  const shipping = items.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Tu carrito está vacío</h1>
        <Link
          href="/catalogo"
          className="mt-6 inline-block rounded-lg bg-[var(--neon-purple)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--neon-purple)]/90"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Carrito</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.productId} className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/5">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-contain" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/producto/${item.slug}`} className="font-semibold text-white hover:text-[var(--neon-purple)]">
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toLocaleString("es-AR")} c/u
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white hover:bg-white/5"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
                  <button
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white hover:bg-white/5"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <p className="font-semibold text-white">
                  ${(item.price * item.quantity).toLocaleString("es-AR")}
                </p>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-muted-foreground hover:text-[var(--neon-red,#ff3355)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="glass h-fit rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white">Resumen</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Envío</span>
              <span>${shipping.toLocaleString("es-AR")}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-semibold text-white">
              <span>Total</span>
              <span>${total.toLocaleString("es-AR")}</span>
            </div>
          </div>
          <Link href="/checkout">
            <Button className="mt-6 w-full bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90">
              Finalizar pedido
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
