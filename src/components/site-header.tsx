"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/other/Catalogo - Nuvape.pdf", label: "Catálogo PDF", external: true },
  { href: "/contacto", label: "Contacto" },
];

const WHATSAPP_NUMBER = "59892052416";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <header className="glass sticky top-0 z-50 w-full border-b border-white/5">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/other/Media logo.png" alt="NUVAPE" width={48} height={48} className="rounded-full" />
          <span className="text-2xl font-bold tracking-tight text-white glow-text-purple">
            NUVAPE
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/catalogo"
            className="hidden rounded-lg p-2.5 text-white transition hover:bg-white/5 lg:block"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg bg-[var(--neon-green)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--neon-green)] ring-1 ring-[var(--neon-green)]/30 transition hover:bg-[var(--neon-green)]/20 sm:block"
          >
            WhatsApp
          </a>
          <Link
            href="/carrito"
            className="relative rounded-lg p-2.5 text-white transition hover:bg-white/5"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--neon-purple)] text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="rounded-lg p-2.5 text-white lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="glass-strong flex flex-col gap-1 border-t border-white/5 p-4 lg:hidden">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}
