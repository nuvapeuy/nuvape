"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function SiteFooter() {
  const router = useRouter();
  const pathname = usePathname();

  function goToPromos(e: React.MouseEvent) {
    e.preventDefault();
    if (pathname === "/catalogo") {
      document.getElementById("promociones")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/catalogo#promociones");
      setTimeout(() => {
        document.getElementById("promociones")?.scrollIntoView({ behavior: "smooth" });
      }, 600);
    }
  }

  return (
    <footer className="mt-auto border-t border-white/5 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <span className="text-lg font-bold text-white glow-text-purple">NUVAPE</span>
            <p className="mt-2 text-sm text-muted-foreground">
              Sabores premium, últimos lanzamientos y entrega rápida.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Navegación</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/catalogo" className="hover:text-white">Catálogo</Link>
              <a href="/catalogo#promociones" onClick={goToPromos} className="cursor-pointer hover:text-white">Promociones</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Aviso</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Venta exclusiva para mayores de 18 años. Producto con nicotina, puede generar dependencia.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NUVAPE. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
