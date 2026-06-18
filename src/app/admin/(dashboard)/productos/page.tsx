"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlagPill } from "@/components/flag-pill";
import { Pencil, Check, X, Plus } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  brand: string;
  brandId: string;
  price: number;
  stock: number;
  flags: string[];
};

type Brand = { id: string; name: string };
type Flag = { id: string; name: string; label: string };

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  puffs: "",
  nicotineLevel: "",
  brandId: "",
  imageUrls: [""],
  flagNames: [] as string[],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<{ id: string; stock: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => toast.error("No se pudieron cargar los productos."));
  };

  useEffect(() => {
    load();
    fetch("/api/admin/brands").then((r) => r.json()).then(setBrands);
    fetch("/api/admin/flags").then((r) => r.json()).then(setFlags);
  }, []);

  const saveStock = async (id: string, stock: number) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    });
    if (res.ok) {
      toast.success("Stock actualizado.");
      setEditing(null);
      load();
    } else {
      toast.error("Error al actualizar el stock.");
    }
  };

  const submitNew = async () => {
    if (!form.name || !form.price || !form.brandId || !form.imageUrls[0]) {
      toast.error("Completá nombre, precio, marca e imagen.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || form.name,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        puffs: Number(form.puffs) || 0,
        nicotineLevel: Number(form.nicotineLevel) || 0,
        brandId: form.brandId,
        imageUrls: form.imageUrls.filter(Boolean),
        flagNames: form.flagNames,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Producto creado.");
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } else {
      toast.error("Error al crear el producto.");
    }
  };

  const toggleFlag = (name: string) => {
    setForm((f) => ({
      ...f,
      flagNames: f.flagNames.includes(name)
        ? f.flagNames.filter((n) => n !== name)
        : [...f.flagNames, name],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestioná el stock de tus productos.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-[var(--neon-purple)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111] p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Nuevo producto</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Nombre *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Blue Razz ICE 40K" className="mt-1" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Descripción</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción corta del producto" className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Precio (UYU) *</label>
                  <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1150" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Stock inicial</label>
                  <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Puffs</label>
                  <Input type="number" min={0} value={form.puffs} onChange={(e) => setForm({ ...form, puffs: e.target.value })} placeholder="40000" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Nicotina (mg)</label>
                  <Input type="number" min={0} step="0.1" value={form.nicotineLevel} onChange={(e) => setForm({ ...form, nicotineLevel: e.target.value })} placeholder="5" className="mt-1" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Marca *</label>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--neon-purple)]"
                >
                  <option value="">Seleccioná una marca</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Imágenes (al menos 1) *</label>
                <div className="mt-1 flex flex-col gap-2">
                  {form.imageUrls.map((url, i) => (
                    <div key={i}>
                      <p className="text-[11px] text-muted-foreground mb-1">{i === 0 ? "Imagen principal" : `Imagen ${i + 1}`}</p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const updated = [...form.imageUrls];
                            updated[i] = e.target.value;
                            setForm({ ...form, imageUrls: updated });
                          }}
                          placeholder="/products/NombreImagen.png"
                        />
                        {url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="preview" className="h-10 w-10 shrink-0 rounded object-contain border border-white/10" />
                        )}
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, imageUrls: form.imageUrls.filter((_, j) => j !== i) })}
                            className="text-muted-foreground hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {form.imageUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrls: [...form.imageUrls, ""] })}
                      className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> Agregar imagen
                    </button>
                  )}
                </div>
              </div>

              {flags.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground">Etiquetas</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {flags.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleFlag(f.name)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                          form.flagNames.includes(f.name)
                            ? "border-[var(--neon-purple)] bg-[var(--neon-purple)]/20 text-white"
                            : "border-white/10 text-muted-foreground hover:border-white/30"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={submitNew}
                disabled={saving}
                className="mt-2 w-full rounded-lg bg-[var(--neon-purple)] py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 glass rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Etiquetas</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products === null && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">Cargando...</TableCell>
              </TableRow>
            )}
            {products?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-white">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.brand}</TableCell>
                <TableCell className="text-muted-foreground">${p.price.toLocaleString("es-AR")}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.flags.map((f) => <FlagPill key={f} flag={f} />)}
                  </div>
                </TableCell>
                <TableCell>
                  {editing?.id === p.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        className="h-7 w-20 text-sm"
                        value={editing.stock}
                        onChange={(e) => setEditing({ id: p.id, stock: Number(e.target.value) })}
                        autoFocus
                      />
                      <button onClick={() => saveStock(p.id, editing.stock)} className="text-green-400 hover:text-green-300">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={p.stock === 0 ? "text-red-400" : "text-white"}>{p.stock}</span>
                      <button
                        onClick={() => setEditing({ id: p.id, stock: p.stock })}
                        className="text-muted-foreground hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No hay productos.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
