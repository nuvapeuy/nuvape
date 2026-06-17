"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlagPill } from "@/components/flag-pill";
import { FLAG_COLORS } from "@/lib/mock-data";
import { Trash2 } from "lucide-react";

type FlagDef = { id: string; name: string; label: string; color: string; active: boolean };

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<FlagDef[]>(
    Object.entries(FLAG_COLORS).map(([name, color]) => ({
      id: name,
      name,
      label: name.replace(/_/g, " "),
      color,
      active: true,
    }))
  );
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#b026ff");

  function add() {
    if (!label.trim()) return;
    const name = label.trim().toUpperCase().replace(/\s+/g, "_");
    setFlags((prev) => [...prev, { id: name, name, label: label.trim(), color, active: true }]);
    setLabel("");
  }

  function toggle(id: string) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Etiquetas (flags)</h1>
      <p className="mt-1 text-sm text-muted-foreground">Etiquetas configurables para los productos.</p>

      <div className="mt-6 flex flex-wrap gap-2 max-w-xl">
        <Input placeholder="Nombre del flag" value={label} onChange={(e) => setLabel(e.target.value)} className="flex-1" />
        <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 p-1" />
        <Button onClick={add} className="bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90">
          Crear flag
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {flags.map((f) => (
          <div key={f.id} className="glass flex items-center justify-between rounded-lg p-4">
            <FlagPill flag={f.name} />
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggle(f.id)}
                className={`text-xs font-medium ${f.active ? "text-[var(--neon-green)]" : "text-muted-foreground"}`}
              >
                {f.active ? "Activo" : "Inactivo"}
              </button>
              <button
                onClick={() => setFlags((prev) => prev.filter((x) => x.id !== f.id))}
                className="text-muted-foreground hover:text-[var(--neon-red,#ff3355)]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
