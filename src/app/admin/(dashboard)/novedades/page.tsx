"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type Banner = { id: string; title: string; subtitle?: string; imageUrl: string; linkUrl?: string; active: boolean };

const EMPTY = { title: "", subtitle: "", imageUrl: "", linkUrl: "" };

export default function AdminNovedadesPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = () => fetch("/api/admin/banners").then((r) => r.json()).then(setBanners);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.imageUrl) { toast.error("Completá título e imagen."); return; }
    setSaving(true);
    const res = await fetch("/api/admin/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { toast.success("Banner creado."); setShowForm(false); setForm(EMPTY); load(); }
    else toast.error("Error al crear.");
  };

  const save = async () => {
    if (!editBanner) return;
    setSavingEdit(true);
    const res = await fetch(`/api/admin/banners/${editBanner.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    setSavingEdit(false);
    if (res.ok) { toast.success("Banner actualizado."); setEditBanner(null); load(); }
    else toast.error("Error al guardar.");
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("¿Eliminar este banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    toast.success("Banner eliminado."); load();
  };

  const toggleActive = async (b: Banner) => {
    await fetch(`/api/admin/banners/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !b.active }) });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Novedades</h1>
          <p className="mt-1 text-sm text-muted-foreground">Banners que aparecen en el inicio. Medidas recomendadas: 1280 × 420 px.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-[var(--neon-purple)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          <Plus className="h-4 w-4" /> Nuevo banner
        </button>
      </div>

      {/* Modal nuevo */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Nuevo banner</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="text-xs text-muted-foreground">Título *</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: ¡Nuevo sabor!" className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Subtítulo</label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Texto secundario" className="mt-1" /></div>
              <div>
                <label className="text-xs text-muted-foreground">URL de imagen * (1280×420 px)</label>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/banners/nombre.png" className="mt-1" />
                {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 w-full rounded-lg object-cover border border-white/10 max-h-32" />}
              </div>
              <div><label className="text-xs text-muted-foreground">Link al hacer click (opcional)</label><Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/catalogo" className="mt-1" /></div>
              <button onClick={submit} disabled={saving} className="mt-2 w-full rounded-lg bg-[var(--neon-purple)] py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">{saving ? "Guardando..." : "Crear banner"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Editar banner</h2>
              <button onClick={() => setEditBanner(null)} className="text-muted-foreground hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="text-xs text-muted-foreground">Título</label><Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Subtítulo</label><Input value={editForm.subtitle} onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })} className="mt-1" /></div>
              <div>
                <label className="text-xs text-muted-foreground">URL de imagen</label>
                <Input value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} className="mt-1" />
                {editForm.imageUrl && <img src={editForm.imageUrl} alt="" className="mt-2 w-full rounded-lg object-cover border border-white/10 max-h-32" />}
              </div>
              <div><label className="text-xs text-muted-foreground">Link</label><Input value={editForm.linkUrl} onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })} className="mt-1" /></div>
              <button onClick={save} disabled={savingEdit} className="mt-2 w-full rounded-lg bg-[var(--neon-purple)] py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">{savingEdit ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {banners.length === 0 && <p className="text-center text-muted-foreground py-12">No hay banners todavía.</p>}
        {banners.map((b) => (
          <div key={b.id} className={`glass rounded-xl overflow-hidden border ${b.active ? "border-white/10" : "border-white/5 opacity-50"}`}>
            <div className="relative w-full h-32">
              <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-semibold text-white">{b.title}</p>
                {b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(b)} className={`text-xs px-2 py-1 rounded-full border ${b.active ? "border-green-500/30 text-green-400" : "border-white/10 text-muted-foreground"}`}>
                  {b.active ? "Activo" : "Inactivo"}
                </button>
                <button onClick={() => { setEditBanner(b); setEditForm({ title: b.title, subtitle: b.subtitle ?? "", imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? "" }); }} className="text-muted-foreground hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteBanner(b.id)} className="text-muted-foreground hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
