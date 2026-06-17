"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

type Promotion = {
  id: string;
  title: string;
  discountPct: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [form, setForm] = useState({ title: "", discountPct: 10, startsAt: "", endsAt: "" });

  function add() {
    if (!form.title.trim()) return;
    setPromos((prev) => [
      { id: crypto.randomUUID(), ...form, active: true },
      ...prev,
    ]);
    setForm({ title: "", discountPct: 10, startsAt: "", endsAt: "" });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Promociones</h1>
      <p className="mt-1 text-sm text-muted-foreground">Programá descuentos por tiempo limitado.</p>

      <div className="glass mt-6 max-w-xl rounded-xl p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">Descuento %</Label>
            <Input
              type="number"
              value={form.discountPct}
              onChange={(e) => setForm({ ...form, discountPct: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">Desde</Label>
            <Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">Hasta</Label>
            <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          </div>
        </div>
        <Button onClick={add} className="mt-4 bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90">
          Crear promoción
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {promos.map((p) => (
          <div key={p.id} className="glass flex items-center justify-between rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">{p.title} — {p.discountPct}% OFF</p>
              <p className="text-xs text-muted-foreground">{p.startsAt} a {p.endsAt}</p>
            </div>
            <button
              onClick={() => setPromos((prev) => prev.filter((x) => x.id !== p.id))}
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
