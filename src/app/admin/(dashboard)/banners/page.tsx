"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Trash2 } from "lucide-react";

type Banner = { id: string; title: string; subtitle: string; imageUrl: string | null; active: boolean };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: null as string | null });

  function add() {
    if (!form.title.trim()) return;
    setBanners((prev) => [{ id: crypto.randomUUID(), ...form, active: true }, ...prev]);
    setForm({ title: "", subtitle: "", imageUrl: null });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Banners</h1>
      <p className="mt-1 text-sm text-muted-foreground">Banners principales del home.</p>

      <div className="glass mt-6 max-w-xl rounded-xl p-5">
        <ImageUploader
          value={form.imageUrl}
          onChange={(url) => setForm({ ...form, imageUrl: url })}
          label="Subir imagen del banner"
          aspect="aspect-[16/6]"
        />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">Subtítulo</Label>
            <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
        </div>
        <Button onClick={add} className="mt-4 bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90">
          Agregar banner
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {banners.map((b) => (
          <div key={b.id} className="glass flex items-center gap-4 rounded-lg px-4 py-3">
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-white/5">
              {b.imageUrl && <Image src={b.imageUrl} alt="" fill className="object-cover" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.subtitle}</p>
            </div>
            <button
              onClick={() => setBanners((prev) => prev.filter((x) => x.id !== b.id))}
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
