"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

type Brand = { id: string; name: string };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([
    { id: "1", name: "ICE CLOUD" },
    { id: "2", name: "TROPIC VOLT" },
    { id: "3", name: "VOLT PRO" },
  ]);
  const [newBrand, setNewBrand] = useState("");

  function add() {
    if (!newBrand.trim()) return;
    setBrands((prev) => [...prev, { id: crypto.randomUUID(), name: newBrand.trim() }]);
    setNewBrand("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Marcas</h1>
      <p className="mt-1 text-sm text-muted-foreground">{brands.length} marcas registradas.</p>

      <div className="mt-6 flex gap-2 max-w-md">
        <Input placeholder="Nombre de la marca" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
        <Button onClick={add} className="bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90">
          <Plus className="h-4 w-4" /> Agregar
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {brands.map((b) => (
          <div key={b.id} className="glass flex items-center justify-between rounded-lg px-4 py-3">
            <span className="text-sm font-medium text-white">{b.name}</span>
            <button
              onClick={() => setBrands((prev) => prev.filter((x) => x.id !== b.id))}
              className="text-muted-foreground hover:text-[var(--neon-red,#ff3355)]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
