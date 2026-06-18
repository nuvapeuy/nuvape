"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

type Product = { id: string; name: string; brand: string; price: number; stock: number };

export default function AdminStockPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<{ id: string; stock: number } | null>(null);

  const load = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => toast.error("No se pudieron cargar los productos."));
  };

  useEffect(() => { load(); }, []);

  const save = async (id: string, stock: number) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    });
    if (res.ok) { toast.success("Stock actualizado."); setEditing(null); load(); }
    else toast.error("Error al actualizar el stock.");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Stock</h1>
      <p className="mt-1 text-sm text-muted-foreground">Actualizá el stock de cada producto.</p>

      <div className="mt-6 glass rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products === null && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Cargando...</TableCell></TableRow>
            )}
            {products?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-white">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.brand}</TableCell>
                <TableCell className="text-muted-foreground">${p.price.toLocaleString("es-AR")}</TableCell>
                <TableCell>
                  {editing?.id === p.id ? (
                    <div className="flex items-center gap-2">
                      <Input type="number" min={0} className="h-7 w-20 text-sm" value={editing.stock}
                        onChange={(e) => setEditing({ id: p.id, stock: Number(e.target.value) })} autoFocus />
                      <button onClick={() => save(p.id, editing.stock)} className="text-green-400 hover:text-green-300"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-white"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={p.stock === 0 ? "text-red-400" : "text-white"}>{p.stock}</span>
                      <button onClick={() => setEditing({ id: p.id, stock: p.stock })} className="text-muted-foreground hover:text-white">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {products?.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No hay productos.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
