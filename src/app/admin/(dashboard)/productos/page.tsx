"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlagPill } from "@/components/flag-pill";
import { Pencil, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  brand: string;
  brandId: string;
  price: number;
  stock: number;
  flags: string[];
  categories: string[];
};

type Brand = { id: string; name: string };
type Flag = { id: string; name: string; label: string };
type Category = { id: string; name: string; productCount: number };

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
  categoryNames: [] as string[],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [editCatProduct, setEditCatProduct] = useState<Product | null>(null);
  const [editCatSelected, setEditCatSelected] = useState<string[]>([]);
  const [savingCat, setSavingCat] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  }, []);

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
        categoryNames: form.categoryNames,
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

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditForm({
      name: p.name,
      description: "",
      price: String(p.price),
      stock: String(p.stock),
      puffs: "",
      nicotineLevel: "",
      brandId: p.brandId,
      imageUrls: [""],
      flagNames: [...p.flags],
      categoryNames: [...p.categories],
    });
  };

  const saveEdit = async () => {
    if (!editProduct) return;
    setSavingEdit(true);
    const res = await fetch(`/api/admin/products/${editProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description || undefined,
        price: editForm.price ? Number(editForm.price) : undefined,
        puffs: editForm.puffs ? Number(editForm.puffs) : undefined,
        nicotineLevel: editForm.nicotineLevel ? Number(editForm.nicotineLevel) : undefined,
        brandId: editForm.brandId || undefined,
        imageUrls: editForm.imageUrls.filter(Boolean).length > 0 ? editForm.imageUrls.filter(Boolean) : undefined,
        flagNames: editForm.flagNames,
        categoryNames: editForm.categoryNames,
      }),
    });
    setSavingEdit(false);
    if (res.ok) { toast.success("Producto actualizado."); setEditProduct(null); load(); }
    else toast.error("Error al guardar.");
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${deleteProduct.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) { toast.success("Producto eliminado."); setDeleteProduct(null); load(); }
    else toast.error("Error al eliminar.");
  };

  const openEditCategories = (p: Product) => {
    setEditCatProduct(p);
    setEditCatSelected([...p.categories]);
  };

  const saveCategories = async () => {
    if (!editCatProduct) return;
    setSavingCat(true);
    const res = await fetch(`/api/admin/products/${editCatProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryNames: editCatSelected }),
    });
    setSavingCat(false);
    if (res.ok) {
      toast.success("Categorías actualizadas.");
      setEditCatProduct(null);
      load();
    } else {
      toast.error("Error al guardar.");
    }
  };

  const toggleCategory = (name: string) => {
    setForm((f) => ({
      ...f,
      categoryNames: f.categoryNames.includes(name)
        ? f.categoryNames.filter((n) => n !== name)
        : [...f.categoryNames, name],
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

              {categories.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground">Categorías</label>
                  <div className="mt-2 flex flex-col gap-2">
                    {categories.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.categoryNames.includes(c.name)}
                          onChange={() => toggleCategory(c.name)}
                          className="h-4 w-4 accent-[var(--neon-purple)]"
                        />
                        <span className="text-sm text-white">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

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

      {editCatProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#111] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Categorías — {editCatProduct.name}</h2>
              <button onClick={() => setEditCatProduct(null)} className="text-muted-foreground hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCatSelected.includes(c.name)}
                    onChange={() => setEditCatSelected((prev) =>
                      prev.includes(c.name) ? prev.filter((n) => n !== c.name) : [...prev, c.name]
                    )}
                    className="h-4 w-4 accent-[var(--neon-purple)]"
                  />
                  <span className="text-sm text-white">{c.name}</span>
                </label>
              ))}
            </div>
            <button
              onClick={saveCategories}
              disabled={savingCat}
              className="mt-5 w-full rounded-lg bg-[var(--neon-purple)] py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {savingCat ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Modal editar producto */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111] p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Editar — {editProduct.name}</h2>
              <button onClick={() => setEditProduct(null)} className="text-muted-foreground hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Nombre</label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Descripción</label>
                <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Dejar vacío para no cambiar" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Precio (UYU)</label>
                  <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Puffs</label>
                  <Input type="number" value={editForm.puffs} onChange={(e) => setEditForm({ ...editForm, puffs: e.target.value })} placeholder="Dejar vacío para no cambiar" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Nicotina (mg)</label>
                  <Input type="number" step="0.1" value={editForm.nicotineLevel} onChange={(e) => setEditForm({ ...editForm, nicotineLevel: e.target.value })} placeholder="Dejar vacío para no cambiar" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Marca</label>
                  <select value={editForm.brandId} onChange={(e) => setEditForm({ ...editForm, brandId: e.target.value })}
                    className="mt-1 w-full rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--neon-purple)]">
                    <option value="">Sin cambiar</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Imágenes (dejar vacío para no cambiar)</label>
                <div className="mt-1 flex flex-col gap-2">
                  {editForm.imageUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={url} onChange={(e) => { const u = [...editForm.imageUrls]; u[i] = e.target.value; setEditForm({ ...editForm, imageUrls: u }); }} placeholder="/products/Imagen.png" />
                      {url && <img src={url} alt="" className="h-10 w-10 shrink-0 rounded object-contain border border-white/10" />}
                      {i > 0 && <button type="button" onClick={() => setEditForm({ ...editForm, imageUrls: editForm.imageUrls.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-red-400"><X className="h-4 w-4" /></button>}
                    </div>
                  ))}
                  {editForm.imageUrls.length < 5 && (
                    <button type="button" onClick={() => setEditForm({ ...editForm, imageUrls: [...editForm.imageUrls, ""] })} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white">
                      <Plus className="h-3.5 w-3.5" /> Agregar imagen
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Categorías</label>
                <div className="mt-2 flex flex-col gap-2">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editForm.categoryNames.includes(c.name)}
                        onChange={() => setEditForm((f) => ({ ...f, categoryNames: f.categoryNames.includes(c.name) ? f.categoryNames.filter((n) => n !== c.name) : [...f.categoryNames, c.name] }))}
                        className="h-4 w-4 accent-[var(--neon-purple)]" />
                      <span className="text-sm text-white">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Etiquetas</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {flags.map((f) => (
                    <button key={f.id} type="button" onClick={() => setEditForm((ef) => ({ ...ef, flagNames: ef.flagNames.includes(f.name) ? ef.flagNames.filter((n) => n !== f.name) : [...ef.flagNames, f.name] }))}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${editForm.flagNames.includes(f.name) ? "border-[var(--neon-purple)] bg-[var(--neon-purple)]/20 text-white" : "border-white/10 text-muted-foreground hover:border-white/30"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveEdit} disabled={savingEdit} className="mt-2 w-full rounded-lg bg-[var(--neon-purple)] py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {savingEdit ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#111] p-6">
            <h2 className="text-lg font-bold text-white mb-2">Eliminar producto</h2>
            <p className="text-sm text-muted-foreground mb-6">¿Seguro que querés eliminar <span className="text-white font-medium">{deleteProduct.name}</span>? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteProduct(null)} className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-muted-foreground hover:text-white">Cancelar</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                {deleting ? "Eliminando..." : "Eliminar"}
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
              <TableHead>Categorías</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products === null && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Cargando...</TableCell>
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
                  <span className="text-sm text-muted-foreground">
                    {p.categories.length > 0 ? p.categories.join(", ") : <span className="italic opacity-50">Sin categoría</span>}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-white" title="Editar">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteProduct(p)} className="text-muted-foreground hover:text-red-400" title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No hay productos.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
