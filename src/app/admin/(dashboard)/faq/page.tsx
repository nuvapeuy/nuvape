"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Faq = { id: string; question: string; answer: string; position: number };

const EMPTY = { question: "", answer: "" };

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editFaq, setEditFaq] = useState<Faq | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = () => fetch("/api/admin/faqs").then((r) => r.json()).then(setFaqs);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.question || !form.answer) { toast.error("Completá pregunta y respuesta."); return; }
    setSaving(true);
    const res = await fetch("/api/admin/faqs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { toast.success("Pregunta creada."); setShowForm(false); setForm(EMPTY); load(); }
    else toast.error("Error al crear.");
  };

  const save = async () => {
    if (!editFaq) return;
    setSavingEdit(true);
    const res = await fetch(`/api/admin/faqs/${editFaq.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    setSavingEdit(false);
    if (res.ok) { toast.success("Pregunta actualizada."); setEditFaq(null); load(); }
    else toast.error("Error al guardar.");
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    toast.success("Pregunta eliminada."); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQ</h1>
          <p className="mt-1 text-sm text-muted-foreground">Preguntas frecuentes que aparecen en la página /faq.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-[var(--neon-purple)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          <Plus className="h-4 w-4" /> Nueva pregunta
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Nueva pregunta</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="text-xs text-muted-foreground">Pregunta *</label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="¿Hacen envíos?" className="mt-1" /></div>
              <div>
                <label className="text-xs text-muted-foreground">Respuesta *</label>
                <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="Sí, hacemos envíos a todo el país..."
                  rows={4}
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--neon-purple)] resize-none" />
              </div>
              <button onClick={submit} disabled={saving} className="mt-2 w-full rounded-lg bg-[var(--neon-purple)] py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">{saving ? "Guardando..." : "Crear"}</button>
            </div>
          </div>
        </div>
      )}

      {editFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Editar pregunta</h2>
              <button onClick={() => setEditFaq(null)} className="text-muted-foreground hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="text-xs text-muted-foreground">Pregunta</label><Input value={editForm.question} onChange={(e) => setEditForm({ ...editForm, question: e.target.value })} className="mt-1" /></div>
              <div>
                <label className="text-xs text-muted-foreground">Respuesta</label>
                <textarea value={editForm.answer} onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })} rows={4}
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--neon-purple)] resize-none" />
              </div>
              <button onClick={save} disabled={savingEdit} className="mt-2 w-full rounded-lg bg-[var(--neon-purple)] py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">{savingEdit ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {faqs.length === 0 && <p className="text-center text-muted-foreground py-12">No hay preguntas todavía.</p>}
        {faqs.map((f) => (
          <div key={f.id} className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{f.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { setEditFaq(f); setEditForm({ question: f.question, answer: f.answer }); }} className="text-muted-foreground hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteFaq(f.id)} className="text-muted-foreground hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
