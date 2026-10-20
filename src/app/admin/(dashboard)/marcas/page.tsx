"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";

type Brand = { id: string; name: string; slug: string; active: boolean; productCount: number };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [newBrand, setNewBrand] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  // Confirmación en dos pasos para no activar/desactivar una marca por un click accidental.
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = () =>
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then(setBrands)
      .catch(() => toast.error("No se pudieron cargar las marcas."));

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!newBrand.trim()) return;
    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBrand }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "No se pudo crear la marca.");
      return;
    }
    toast.success(`${data.name} creada (inactiva). Cargá sus productos y activala cuando esté lista.`);
    setNewBrand("");
    load();
  }

  async function toggle(b: Brand) {
    setBusy(b.id);
    setConfirming(null);
    const res = await fetch(`/api/admin/brands/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    setBusy(null);
    if (!res.ok) {
      toast.error("No se pudo actualizar la marca.");
      return;
    }
    toast.success(b.active ? `${b.name} desactivada: ya no se ve en la tienda.` : `${b.name} activada: ya se ve en la tienda.`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Marcas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Una marca inactiva y sus productos no aparecen en la tienda, ni se pueden comprar.
      </p>

      <div className="mt-6 flex max-w-md gap-2">
        <Input placeholder="Nombre de la marca" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
        <Button onClick={add} className="bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90">
          <Plus className="h-4 w-4" /> Agregar
        </Button>
      </div>

      <div className="mt-6 flex max-w-2xl flex-col gap-2">
        {brands === null && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {brands?.map((b) => (
          <div key={b.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.productCount} productos activos</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={
                  b.active
                    ? "rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-300"
                    : "rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                }
              >
                {b.active ? "Visible en la tienda" : "Oculta"}
              </span>
              {confirming === b.id ? (
                <>
                  <button
                    onClick={() => toggle(b)}
                    disabled={busy === b.id}
                    className="rounded-lg bg-[var(--neon-purple)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    {b.active ? "Sí, ocultar" : "Sí, activar"}
                  </button>
                  <button onClick={() => setConfirming(null)} className="text-xs text-muted-foreground hover:text-white">
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirming(b.id)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/5"
                >
                  {b.active ? "Desactivar" : "Activar"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
