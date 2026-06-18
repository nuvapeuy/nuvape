"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, X, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type OrderItem = {
  productId: string | null;
  quantity: number;
  unitPrice: number;
  productName: string | null;
  product: { name: string } | null;
};

type Order = {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
  deliveryType: string;
  customer: { firstName: string; lastName: string; phone: string; address: string; city: string };
  items: OrderItem[];
};

type Product = { id: string; name: string; price: number; stock: number };
type FormItem = { productId: string; name: string; quantity: number; unitPrice: number };

const PROMOS = [
  { id: "promo-x3", label: "Pack x3", qty: 3, price: 3300 },
  { id: "promo-x5", label: "Pack x5", qty: 5, price: 5000 },
];
const MEETING_POINTS = ["Portones Shopping", "Nuevocentro Shopping"];
const EMPTY_FORM = { firstName: "", phone: "", address: "", city: "Montevideo", deliveryType: "DOMICILIO", paymentMethod: "CASH", meetingPoint: "Portones Shopping" };

const STATUS_LABELS: Record<string, string> = { PENDING: "Pendiente", CONFIRMED: "Confirmado", DELIVERED: "Entregado", CANCELLED: "Cancelado" };
const STATUS_COLORS: Record<string, string> = { PENDING: "bg-yellow-500/20 text-yellow-300", CONFIRMED: "bg-blue-500/20 text-blue-300", DELIVERED: "bg-green-500/20 text-green-300", CANCELLED: "bg-red-500/20 text-red-300" };

type FormState = { firstName: string; phone: string; address: string; city: string; deliveryType: string; paymentMethod: string; meetingPoint: string };

function itemDisplayName(i: OrderItem) {
  return i.productName ?? i.product?.name ?? "?";
}

function isPromoItem(i: OrderItem) {
  return !i.productId || i.productId.startsWith("promo-");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Modal nuevo pedido
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Promo picker nuevo pedido
  const [promoModal, setPromoModal] = useState<typeof PROMOS[0] | null>(null);
  const [promoSelected, setPromoSelected] = useState<Product[]>([]);

  // Modal edicion
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({ deliveryType: "DOMICILIO", paymentMethod: "CASH" });
  const [editItems, setEditItems] = useState<FormItem[]>([]);
  const [editOriginalItems, setEditOriginalItems] = useState<FormItem[]>([]);
  const [editPromoModal, setEditPromoModal] = useState<typeof PROMOS[0] | null>(null);
  const [editPromoSelected, setEditPromoSelected] = useState<Product[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadOrders = () => {
    fetch("/api/orders/list").then((r) => r.json()).then(setOrders).catch(() => {});
  };

  useEffect(() => {
    loadOrders();
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts).catch(() => {});
  }, []);

  // ── helpers ───────────────────────────────────────────────
  // originalItems: si se está editando un pedido DELIVERED, las unidades originales ya están
  // descontadas del stock en la DB, así que hay que sumarlas para calcular el disponible real.
  const addItem = (items: FormItem[], setItems: (f: FormItem[]) => void, p: Product, originalItems?: FormItem[]) => {
    const exists = items.find((i) => i.productId === p.id);
    const currentQty = exists?.quantity ?? 0;
    const originalQty = originalItems?.find((i) => i.productId === p.id)?.quantity ?? 0;
    const availableStock = p.stock + originalQty;
    if (currentQty >= availableStock) {
      toast.error(`Stock insuficiente: solo hay ${availableStock} unidades de ${p.name}.`);
      return;
    }
    if (exists) setItems(items.map((i) => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i));
    else setItems([...items, { productId: p.id, name: p.name, quantity: 1, unitPrice: p.price }]);
  };

  const removeItem = (items: FormItem[], setItems: (f: FormItem[]) => void, productId: string) =>
    setItems(items.filter((i) => i.productId !== productId));

  const shippingFor = (deliveryType: string) => deliveryType === "DOMICILIO" ? 150 : 0;

  const calcTotal = (items: FormItem[], deliveryType: string) => {
    const sub = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const ship = shippingFor(deliveryType);
    return { subtotal: sub, shippingCost: ship, total: sub + ship };
  };

  // ── promo picker nuevo pedido ─────────────────────────────
  const togglePromo = (sel: Product[], setSel: (v: Product[]) => void, max: number, p: Product) => {
    const countInSel = sel.filter((x) => x.id === p.id).length;
    if (sel.length < max) {
      if (countInSel >= p.stock) {
        toast.error(`Stock insuficiente: solo hay ${p.stock} unidades de ${p.name}.`);
        return;
      }
      setSel([...sel, p]);
    } else {
      const idx = sel.map((x) => x.id).lastIndexOf(p.id);
      if (idx >= 0) setSel(sel.filter((_, i) => i !== idx));
    }
  };

  const confirmPromo = (modal: typeof PROMOS[0], sel: Product[], setItems: React.Dispatch<React.SetStateAction<FormItem[]>>, afterConfirm: () => void) => {
    if (sel.length !== modal.qty) return;
    const unitPrice = Math.round(modal.price / modal.qty);
    // Agrupar productos repetidos
    const grouped = sel.reduce<Record<string, { product: Product; qty: number }>>((acc, p) => {
      if (acc[p.id]) acc[p.id].qty++;
      else acc[p.id] = { product: p, qty: 1 };
      return acc;
    }, {});
    const newItems: FormItem[] = Object.values(grouped).map(({ product, qty }) => ({
      productId: product.id,
      name: `[${modal.label}] ${product.name}`,
      quantity: qty,
      unitPrice,
    }));
    setItems((prev) => [...prev, ...newItems]);
    afterConfirm();
  };

  // ── submit nuevo pedido ───────────────────────────────────
  const submitManual = async () => {
    if (!form.firstName || !form.phone || formItems.length === 0) { toast.error("Completá nombre, teléfono y al menos un producto."); return; }
    setSubmitting(true);
    const { subtotal, shippingCost, total } = calcTotal(formItems, form.deliveryType);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, lastName: "", email: "",
          deliveryType: form.deliveryType === "MEETING_POINT" ? "INTERIOR_DAC" : form.deliveryType,
          city: form.deliveryType === "MEETING_POINT" ? form.meetingPoint : form.city,
          items: formItems, subtotal, shippingCost, total,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Pedido cargado.");
      setShowForm(false); setForm(EMPTY_FORM); setFormItems([]);
      loadOrders();
    } catch { toast.error("Error al cargar el pedido."); }
    finally { setSubmitting(false); }
  };

  // ── abrir edicion ─────────────────────────────────────────
  const openEdit = (o: Order) => {
    setEditOrder(o);
    setEditForm({ deliveryType: o.deliveryType, paymentMethod: o.paymentMethod });
    const mapped = o.items.map((i) => ({
      productId: i.productId ?? `promo-exist-${Math.random()}`,
      name: itemDisplayName(i),
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    }));
    setEditItems(mapped);
    // Si el pedido fue entregado, el stock de esos productos ya está descontado en la DB.
    // Guardamos los originales para que addItem pueda sumarlos al stock disponible.
    const stockDecremented = ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].includes(o.status);
    setEditOriginalItems(stockDecremented ? mapped : []);
  };

  // ── guardar edicion ───────────────────────────────────────
  const saveEdit = async () => {
    if (!editOrder || editItems.length === 0) return;
    setSavingEdit(true);
    const { subtotal, shippingCost, total } = calcTotal(editItems, editForm.deliveryType);
    try {
      const res = await fetch(`/api/orders/${editOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryType: editForm.deliveryType,
          paymentMethod: editForm.paymentMethod,
          items: editItems.map((i) => ({ productId: i.productId, productName: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
          subtotal, shippingCost, total,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Pedido actualizado.");
      setEditOrder(null);
      loadOrders();
    } catch (err) { toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`); }
    finally { setSavingEdit(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setUpdating(null);
    loadOrders();
  };

  const toggleExpand = (id: string) => setExpandedItems((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── render ────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pedidos realizados por los clientes.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-lg bg-[var(--neon-purple)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--neon-purple)]/90">
          <Plus className="h-4 w-4" /> Pedido manual
        </button>
      </div>

      {/* Modal nuevo pedido */}
      {showForm && (
        <Modal title="Nuevo pedido manual" onClose={() => setShowForm(false)}>
          <FormFields form={form} setForm={setForm} />
          <ProductPicker products={products} items={formItems} onAddProduct={(p) => addItem(formItems, setFormItems, p)} onOpenPromo={(p) => { setPromoModal(p); setPromoSelected([]); }} />
          <ItemsSummary items={formItems} deliveryType={form.deliveryType} onRemove={(id) => removeItem(formItems, setFormItems, id)} />
          <button onClick={submitManual} disabled={submitting} className="w-full rounded-lg bg-[var(--neon-purple)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--neon-purple)]/90 disabled:opacity-50 mt-1">
            {submitting ? "Guardando..." : "Guardar pedido"}
          </button>
        </Modal>
      )}

      {/* Promo picker nuevo pedido */}
      {promoModal && (
        <PromoPickerModal
          promo={promoModal}
          products={products}
          selected={promoSelected}
          onToggle={(p) => togglePromo(promoSelected, setPromoSelected, promoModal.qty, p)}
          onConfirm={() => confirmPromo(promoModal, promoSelected, setFormItems, () => setPromoModal(null))}
          onClose={() => setPromoModal(null)}
        />
      )}

      {/* Modal edicion pedido */}
      {editOrder && (
        <Modal title={`Editar pedido — ${editOrder.customer.firstName}`} onClose={() => setEditOrder(null)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Entrega</label>
              <select value={editForm.deliveryType} onChange={(e) => setEditForm({ ...editForm, deliveryType: e.target.value })} className="w-full rounded-lg border border-white/10 bg-[#0e0e0e] px-3 py-2 text-sm text-white">
                <option value="DOMICILIO">Domicilio (+$150)</option>
                <option value="INTERIOR_DAC">Interior</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Pago</label>
              <select value={editForm.paymentMethod} onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })} className="w-full rounded-lg border border-white/10 bg-[#0e0e0e] px-3 py-2 text-sm text-white">
                <option value="CASH">Efectivo</option>
                <option value="BANK_TRANSFER">Transferencia</option>
              </select>
            </div>
          </div>
          <ProductPicker products={products} items={editItems} onAddProduct={(p) => addItem(editItems, setEditItems, p, editOriginalItems)} onOpenPromo={(p) => { setEditPromoModal(p); setEditPromoSelected([]); }} originalItems={editOriginalItems} />
          <ItemsSummary items={editItems} deliveryType={editForm.deliveryType} onRemove={(id) => removeItem(editItems, setEditItems, id)} />
          <button onClick={saveEdit} disabled={savingEdit || editItems.length === 0} className="mt-2 w-full rounded-lg bg-[var(--neon-purple)] py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            {savingEdit ? "Guardando..." : "Guardar cambios"}
          </button>
        </Modal>
      )}

      {/* Promo picker edicion */}
      {editPromoModal && (
        <PromoPickerModal
          promo={editPromoModal}
          products={products}
          selected={editPromoSelected}
          onToggle={(p) => togglePromo(editPromoSelected, setEditPromoSelected, editPromoModal.qty, p)}
          onConfirm={() => confirmPromo(editPromoModal, editPromoSelected, setEditItems, () => setEditPromoModal(null))}
          onClose={() => setEditPromoModal(null)}
        />
      )}

      {/* Tabla */}
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
            {orders === null && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Cargando...</TableCell></TableRow>}
            {orders?.map((o) => {
              const expanded = expandedItems.has(o.id);
              const hasMany = o.items.length > 1;
              const firstItem = o.items[0];
              return (
                <TableRow key={o.id}>
                  <TableCell className="text-white">
                    {o.customer.firstName} {o.customer.lastName}
                    <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                    <p className="text-xs text-muted-foreground">{o.customer.address}{o.customer.address && ", "}{o.customer.city}</p>
                  </TableCell>
                  <TableCell className="text-xs w-48">
                    <div className="flex flex-col gap-1 w-48">
                      {o.items.map((i, idx) => {
                        const full = itemDisplayName(i);
                        const dashIdx = full.indexOf(" — ");
                        const title = dashIdx >= 0 ? full.slice(0, dashIdx) : full;
                        const flavors = dashIdx >= 0 ? full.slice(dashIdx + 3).split(", ") : null;
                        const itemExpanded = expanded;
                        if (!itemExpanded && idx > 0) return null;
                        return (
                          <div key={idx}>
                            <span className="text-white font-medium block">{i.quantity}x {title}</span>
                            {flavors && (
                              <>
                                {itemExpanded
                                  ? <ul className="mt-1 space-y-0.5">{flavors.map((f, fi) => <li key={fi} className="text-muted-foreground">· {f}</li>)}</ul>
                                  : <button onClick={() => toggleExpand(o.id)} className="text-[var(--neon-purple)] hover:underline flex items-center gap-0.5 mt-0.5">
                                      <ChevronRight className="h-3 w-3" /> ver sabores
                                    </button>
                                }
                              </>
                            )}
                          </div>
                        );
                      })}
                      {expanded && (
                        <button onClick={() => toggleExpand(o.id)} className="text-[var(--neon-purple)] hover:underline flex items-center gap-0.5">
                          <ChevronDown className="h-3 w-3" /> ocultar
                        </button>
                      )}
                      {!expanded && o.items.length > 1 && (
                        <button onClick={() => toggleExpand(o.id)} className="text-[var(--neon-purple)] hover:underline flex items-center gap-0.5">
                          <ChevronRight className="h-3 w-3" /> +{o.items.length - 1} más
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{o.deliveryType === "DOMICILIO" ? "Domicilio" : "Interior"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{o.paymentMethod === "CASH" ? "Efectivo" : "Transferencia"}</TableCell>
                  <TableCell className="text-white">${Number(o.total).toLocaleString("es-AR")}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-500/20 text-gray-300"}`}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleDateString("es-AR")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => openEdit(o)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Editar
                      </button>
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
              );
            })}
            {orders?.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Todavia no hay pedidos.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground hover:text-white" /></button>
        </div>
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

function FormFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <>
      <div><label className="text-xs text-muted-foreground">Nombre</label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
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
    </>
  );
}

function ProductPicker({ products, items, onAddProduct, onOpenPromo, originalItems = [] }: {
  products: Product[];
  items: FormItem[];
  onAddProduct: (p: Product) => void;
  onOpenPromo: (p: typeof PROMOS[0]) => void;
  originalItems?: FormItem[];
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">Agregar productos</label>
      <div className="mt-1 flex flex-col gap-1 max-h-48 overflow-y-auto">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide px-1 pt-1">Promos</p>
        {PROMOS.map((p) => (
          <button key={p.id} onClick={() => onOpenPromo(p)} className="flex items-center justify-between rounded-lg border border-[var(--neon-purple)]/30 bg-[var(--neon-purple)]/5 px-3 py-2 text-left hover:bg-[var(--neon-purple)]/10">
            <span className="text-sm text-white">{p.label} <span className="text-[10px] text-muted-foreground">(elegir sabores)</span></span>
            <span className="text-xs text-muted-foreground">${p.price.toLocaleString("es-AR")}</span>
          </button>
        ))}
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide px-1 pt-2">Productos</p>
        {products.map((p) => {
          const inCart = items.find((i) => i.productId === p.id);
          const originalQty = originalItems.find((i) => i.productId === p.id)?.quantity ?? 0;
          const availableStock = p.stock + originalQty;
          const atLimit = (inCart?.quantity ?? 0) >= availableStock;
          return (
            <button
              key={p.id}
              onClick={() => onAddProduct(p)}
              disabled={atLimit}
              className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-sm text-white">{p.name}</span>
              <div className="flex items-center gap-2">
                {inCart && <span className="text-xs text-[var(--neon-purple)] font-semibold">x{inCart.quantity}</span>}
                <span className="text-xs text-muted-foreground">
                  ${p.price.toLocaleString("es-AR")} · {availableStock} en stock
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ItemsSummary({ items, deliveryType, onRemove }: { items: FormItem[]; deliveryType: string; onRemove: (id: string) => void }) {
  if (items.length === 0) return null;
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = deliveryType === "DOMICILIO" ? 150 : 0;
  return (
    <div className="rounded-lg border border-white/10 p-3 flex flex-col gap-1">
      {items.map((i) => (
        <div key={i.productId} className="flex items-center justify-between text-sm gap-2">
          <span className="text-white truncate">{i.quantity}x {i.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-muted-foreground">${(i.unitPrice * i.quantity).toLocaleString("es-AR")}</span>
            <button onClick={() => onRemove(i.productId)}><X className="h-3 w-3 text-muted-foreground hover:text-white" /></button>
          </div>
        </div>
      ))}
      <div className="mt-2 border-t border-white/10 pt-2 flex justify-between text-sm font-semibold text-white">
        <span>Total</span><span>${(subtotal + shipping).toLocaleString("es-AR")}</span>
      </div>
    </div>
  );
}

function PromoPickerModal({ promo, products, selected, onToggle, onConfirm, onClose }: {
  promo: typeof PROMOS[0];
  products: Product[];
  selected: Product[];
  onToggle: (p: Product) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={`${promo.label} — elegí ${promo.qty} sabores`} onClose={onClose}>
      <p className="text-xs text-muted-foreground">Seleccionados: {selected.length} / {promo.qty}</p>
      <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
        {products.map((p) => {
          const count = selected.filter((x) => x.id === p.id).length;
          return (
            <button key={p.id} onClick={() => onToggle(p)} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${count > 0 ? "border-[var(--neon-purple)]/60 bg-[var(--neon-purple)]/10" : "border-white/10 hover:bg-white/5"}`}>
              <span className="text-sm text-white">{p.name}</span>
              {count > 0 && <span className="text-xs font-bold text-[var(--neon-purple)]">x{count}</span>}
            </button>
          );
        })}
      </div>
      <button onClick={onConfirm} disabled={selected.length !== promo.qty} className="mt-1 w-full rounded-lg bg-[var(--neon-purple)] py-2.5 text-sm font-semibold text-white disabled:opacity-40">
        Confirmar — ${promo.price.toLocaleString("es-AR")}
      </button>
    </Modal>
  );
}
