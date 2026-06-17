"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
} from "lucide-react";
import type { AdminSession } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/productos", label: "Productos", icon: Package },
];

export function AdminSidebar({ session }: { session: AdminSession }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Sidebar — solo desktop */}
      <aside className="hidden md:flex glass-strong w-56 shrink-0 flex-col border-r border-white/5 p-4">
        <div className="px-2 py-3">
          <p className="text-sm font-bold text-white glow-text-purple">NUVAPE Admin</p>
          <p className="text-xs text-muted-foreground">{session.name} · {session.role}</p>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--neon-purple)]/15 text-[var(--neon-purple)] ring-1 ring-[var(--neon-purple)]/30"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </aside>

      {/* Bottom nav — solo mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md px-2 pb-safe">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-3 text-[10px] font-medium transition-colors",
                active ? "text-[var(--neon-purple)]" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-0.5 px-3 py-3 text-[10px] font-medium text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
          Salir
        </button>
      </nav>
    </>
  );
}
