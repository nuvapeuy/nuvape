"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

type Order = {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
  deliveryType: string;
  customer: { firstName: string; lastName: string; phone: string; address: string; city: string };
  items: { quantity: number; productName: string | null; product: { name: string } | null }[];
};

type Product = { id: string; name: string; price: number; stock: number };

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const MEETING_POINTS = ["Portones Shopping", "Nuevocentro Shopping"];
  const [form, setForm] = useState({ firstName: "", phone: "", address: "", city: "Montevideo", deliveryType: "DOMICILIO", paymentMethod: "CASH", meetingPoint: "Portones Shopping" });
  const [formItems, setFormItems] = useState<{ productId: string; name: string; quantity: number; unitPrice: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = () => {
    fetch("/api/orders/list")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  };

  useEffect(() => {
    loadOrders();
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts).catch(() => {});
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setUpdating(null);
    loadOrders();
  };

  const addFormItem = (p: Product) => {
    const exists = formItems.find((i) => i.productId === p.id);
    if (exists) {
      setFormItems((prev) => prev.map((i) => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setFormItems((prev) => [...prev, { productId: p.id, name: p.name, quantity: 1, unitPrice: p.price }]);
    }
  };

  const subtotal = formItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shippingCost = form.deliveryType === "DOMICILIO" ? 150 : 0;

  const submitManual = async () => {
    if (!form.firstName || !form.phone || formItems.length === 0) { toast.error("Complet nombre, telfono y al menos un producto."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lastName: "",
          email: "",
          deliveryType: form.deliveryType === "MEETING_POINT" ? "INTERIOR_DAC" : form.deliveryType,
          city: form.deliveryType === "MEETING_POINT" ? form.meetingPoint : form.city,
          items: formItems,
          subtotal,
          shippingCost,
          total: subtotal + shippingCost,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Pedido cargado.");
      setShowForm(false);
      setForm({ firstName: "", phone: "", address: "", city: "Montevideo", deliveryType: "DOMICILIO", paymentMethod: "CASH", meetingPoint: "Portones Shopping" });
      setFormItems([]);
      loadOrders();
    } catch { toast.error("Error al cargar el pedido."); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pedidos realizados por los clientes.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--neon-purple)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--neon-purple)]/90"
        >
          <Plus className="h-4 w-4" /> Pedido manual
        </button>
      </div>

      {/* Formulario pedido manual */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Nuevo pedido manual</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground hover:text-white" /></button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs text-muted-foreground">Nombre</label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
              </div>
              <div><label className="text-xs text-muted-foreground">Telefono</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Entrega</label>
                  <select value={form.deliveryType} onChange={(e) => setForm({ ...form, deliveryType: e.target.value })} className="w-full rounded-lg border border-white/10 bg-[#0e0e0e] px-3 py-2 text-sm text-white">
                    <option value="DOMICILIO">Domicilio (+$150)</option>
                    <option value="INTERIOR_DAC">Interior</option>
                    <option value="MEETING_POINT">Punto de encuentro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Pago</label>
                  <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full rounded-lg border border-white/10 bg-[#0e0e0e] px-3 py-2 text-sm text-white">
                    <option value="CASH">Efectivo</option>
                    <option value="BANK_TRANSFER">Transferencia</option>
                  </select>
                </div>
              </div>
              {form.deliveryType === "MEETING_POINT" && (
                <div>
                  <label className="text-xs text-muted-foreground">Shopping</label>
                  <select value={form.meetingPoint} onChange={(e) => setForm({ ...form, meetingPoint: e.target.value })} className="w-full rounded-lg border border-white/10 bg-[#0e0e0e] px-3 py-2 text-sm text-white">
                    {MEETING_POINTS.map((mp) => <option key={mp} value={mp}>{mp}</option>)}
                  </select>
                </div>
              )}
              {(form.deliveryType === "DOMICILIO" || form.deliveryType === "INTERIOR_DAC") && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">Direccion</label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Ciudad</label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground">Productos</label>
                <div className="mt-1 flex flex-col gap-1 max-h-48 overflow-y-auto">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide px-1 pt-1">Promos</p>
                  {[
                    { id: "promo-x3", name: "Pack x3 — ELFBAR Ice King 40K", price: 3300 },
                    { id: "promo-x5", name: "Pack x5 — ELFBAR Ice King 40K", price: 5000 },
                  ].map((p) => (
                    <button key={p.id} onClick={() => addFormItem(p as Product)} className="flex items-center justify-between rounded-lg border border-[var(--neon-purple)]/30 bg-[var(--neon-purple)]/5 px-3 py-2 text-left hover:bg-[var(--neon-purple)]/10">
                      <span className="text-sm text-white">{p.name}</span>
                      <span className="text-xs text-muted-foreground">${p.price.toLocaleString("es-AR")}</span>
                    </button>
                  ))}
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide px-1 pt-2">Productos</p>
                  {products.map((p) => (
                    <button key={p.id} onClick={() => addFormItem(p)} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left hover:bg-white/5">
                      <span className="text-sm text-white">{p.name}</span>
                      <span className="text-xs text-muted-foreground">${p.price.toLocaleString("es-AR")}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formItems.length > 0 && (
                <div className="rounded-lg border border-white/10 p-3 flex flex-col gap-1">
                  {formItems.map((i) => (
                    <div key={i.productId} className="flex items-center justify-between text-sm">
                      <span className="text-white">{i.quantity}x {i.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">${(i.unitPrice * i.quantity).toLocaleString("es-AR")}</span>
                        <button onClick={() => setFormItems((prev) => prev.filter((x) => x.productId !== i.productId))}><X className="h-3 w-3 text-muted-foreground hover:text-white" /></button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 border-t border-white/10 pt-2 flex justify-between text-sm font-semibold text-white">
                    <span>Total</span><span>${(subtotal + shippingCost).toLocaleString("es-AR")}</span>
                  </div>
                </div>
              )}

              <button onClick={submitManual} disabled={submitting} className="w-full rounded-lg bg-[var(--neon-purple)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--neon-purple)]/90 disabled:opacity-50 mt-1">
                {submitting ? "Guardando..." : "Guardar pedido"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 glass rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders === null && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Cargando...</TableCell></TableRow>
            )}
            {orders?.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="text-white">
                  {o.customer.firstName} {o.customer.lastName}
                  <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                  <p className="text-xs text-muted-foreground">{o.customer.address}{o.customer.address && ", "}{o.customer.city}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">{o.items.map((i) => `${i.quantity}x ${i.productName ?? i.product?.name ?? "?"}`).join(", ")}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{o.deliveryType === "DOMICILIO" ? "Domicilio" : "Interior"}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{o.paymentMethod === "CASH" ? "Efectivo" : "Transferencia"}</TableCell>
                <TableCell className="text-white">${Number(o.total).toLocaleString("es-AR")}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-500/20 text-gray-300"}`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("es-AR")}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {o.status === "PENDING" && (
                      <button onClick={() => updateStatus(o.id, "CONFIRMED")} disabled={updating === o.id} className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">Confirmar</button>
                    )}
                    {(o.status === "PENDING" || o.status === "CONFIRMED") && (
                      <button onClick={() => updateStatus(o.id, "DELIVERED")} disabled={updating === o.id} className="text-xs px-2 py-1 rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-50">Entregado</button>
                    )}
                    {o.status !== "CANCELLED" && o.status !== "DELIVERED" && (
                      <button onClick={() => updateStatus(o.id, "CANCELLED")} disabled={updating === o.id} className="text-xs px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-50">Cancelar</button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {orders?.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Todavia no hay pedidos.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
