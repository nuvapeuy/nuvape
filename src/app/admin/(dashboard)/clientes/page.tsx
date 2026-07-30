"use client";

import { useEffect, useState } from "react";
import { Trophy, ChevronDown, ChevronRight, Pencil, X } from "lucide-react";

type OrderRow = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: string;
};

type CustomerRow = {
  id: string;
  phone: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string | null;
  orders: OrderRow[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300",
  CONFIRMED: "bg-blue-500/20 text-blue-300",
  DELIVERED: "bg-green-500/20 text-green-300",
  CANCELLED: "bg-red-500/20 text-red-300",
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", address: "", city: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  function fetchCustomers() {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }

  const toggle = (phone: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  };

  function openEdit(c: CustomerRow, e: React.MouseEvent) {
    e.stopPropagation();
    setEditing(c);
    setForm({ firstName: c.firstName, lastName: c.lastName, phone: c.phone, email: c.email, address: c.address, city: c.city });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/admin/customers/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditing(null);
    fetchCustomers();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Clientes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ranking por total gastado &mdash; {customers?.length ?? "..."} clientes registrados.
      </p>

      <div className="mt-6 glass rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">Total gastado</th>
              <th className="px-4 py-3">Último pedido</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {customers === null && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td>
              </tr>
            )}
            {customers?.map((c, i) => {
              const open = expanded.has(c.phone);
              return (
                <>
                  <tr
                    key={c.phone}
                    onClick={() => c.orders.length > 0 && toggle(c.phone)}
                    className={`border-b border-white/5 transition-colors ${c.orders.length > 0 ? "cursor-pointer hover:bg-white/5" : ""}`}
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {i === 0 ? <Trophy className="h-4 w-4 text-yellow-400" /> : i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{c.name || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.orderCount}</td>
                    <td className="px-4 py-3 font-semibold text-white">${c.totalSpent.toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString("es-AR") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => openEdit(c, e)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {c.orders.length > 0 && (
                          open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                  </tr>
                  {open && (
                    <tr key={`${c.phone}-orders`} className="bg-white/[0.02] border-b border-white/5">
                      <td colSpan={7} className="px-6 py-3">
                        <div className="flex flex-col gap-2">
                          {c.orders.map((o) => (
                            <div key={o.id} className="flex items-start justify-between gap-4 rounded-lg border border-white/10 px-4 py-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-white truncate">{o.items || "Sin productos"}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(o.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-500/20 text-gray-300"}`}>
                                  {STATUS_LABELS[o.status] ?? o.status}
                                </span>
                                <span className="text-sm font-semibold text-white">${o.total.toLocaleString("es-AR")}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {customers?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Todavía no hay clientes registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Editar cliente</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
                <Field label="Apellido" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
              </div>
              <Field label="Teléfono" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Dirección" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <Field label="Ciudad / Zona" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 rounded-xl bg-[var(--neon-purple)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--neon-purple)]/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--neon-purple)]"
      />
    </div>
  );
}
