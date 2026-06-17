"use client";

import { useState } from "react";
import { MOCK_PRODUCTS, type MockProduct } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlagPill } from "@/components/flag-pill";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Pencil, Plus, Trash2, Copy } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<MockProduct[]>(MOCK_PRODUCTS);
  const [editing, setEditing] = useState<MockProduct | null>(null);
  const [open, setOpen] = useState(false);

  function openNew() {
    setEditing({
      id: crypto.randomUUID(),
      slug: "",
      name: "",
      brand: "",
      price: 0,
      puffs: 0,
      nicotineLevel: 5,
      stock: 0,
      imageUrl: "",
      flags: [],
      description: "",
      flavors: [],
    });
    setOpen(true);
  }

  function openEdit(p: MockProduct) {
    setEditing({ ...p });
    setOpen(true);
  }

  function duplicate(p: MockProduct) {
    const copy = { ...p, id: crypto.randomUUID(), slug: `${p.slug}-copia`, name: `${p.name} (copia)` };
    setProducts((prev) => [copy, ...prev]);
  }

  function remove(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function save() {
    if (!editing) return;
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === editing.id);
      return exists ? prev.map((p) => (p.id === editing.id ? editing : p)) : [editing, ...prev];
    });
    setOpen(false);
    setEditing(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} productos en catálogo.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--neon-purple)] px-2.5 py-1.5 text-sm font-medium text-white hover:bg-[var(--neon-purple)]/90"
          >
            <Plus className="h-4 w-4" /> Nuevo producto
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing?.name ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="flex flex-col gap-4">
                <Field label="Foto del producto">
                  <ImageUploader
                    value={editing.imageUrl || null}
                    onChange={(url) => setEditing({ ...editing, imageUrl: url ?? "" })}
                  />
                </Field>
                <Field label="Nombre">
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </Field>
                <Field label="Slug">
                  <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                </Field>
                <Field label="Marca">
                  <Input value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Precio">
                    <Input
                      type="number"
                      value={editing.price}
                      onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Puffs">
                    <Input
                      type="number"
                      value={editing.puffs}
                      onChange={(e) => setEditing({ ...editing, puffs: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Nicotina %">
                    <Input
                      type="number"
                      value={editing.nicotineLevel}
                      onChange={(e) => setEditing({ ...editing, nicotineLevel: Number(e.target.value) })}
                    />
                  </Field>
                </div>
                <Field label="Stock">
                  <Input
                    type="number"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Descripción">
                  <textarea
                    className="w-full rounded-lg border border-white/10 bg-transparent p-2 text-sm text-white"
                    rows={3}
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </Field>
                <Field label="Etiquetas (separadas por coma)">
                  <Input
                    value={editing.flags.join(", ")}
                    onChange={(e) =>
                      setEditing({ ...editing, flags: e.target.value.split(",").map((f) => f.trim()).filter(Boolean) })
                    }
                  />
                </Field>
                <Field label="Sabores (separados por coma)">
                  <Input
                    value={editing.flavors.join(", ")}
                    onChange={(e) =>
                      setEditing({ ...editing, flavors: e.target.value.split(",").map((f) => f.trim()).filter(Boolean) })
                    }
                  />
                </Field>
              </div>
            )}
            <DialogFooter>
              <Button onClick={save} className="bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90">
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 glass rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Etiquetas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-white">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.brand}</TableCell>
                <TableCell className="text-muted-foreground">${p.price.toLocaleString("es-AR")}</TableCell>
                <TableCell className="text-muted-foreground">{p.stock}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.flags.map((f) => (
                      <FlagPill key={f} flag={f} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="flex justify-end gap-1">
                  <button onClick={() => openEdit(p)} className="rounded-md p-2 text-muted-foreground hover:bg-white/5 hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => duplicate(p)} className="rounded-md p-2 text-muted-foreground hover:bg-white/5 hover:text-white">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(p.id)} className="rounded-md p-2 text-muted-foreground hover:bg-white/5 hover:text-[var(--neon-red,#ff3355)]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
