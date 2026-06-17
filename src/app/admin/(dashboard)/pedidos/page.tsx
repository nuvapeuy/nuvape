"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Order = {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
  deliveryType: string;
  customer: { firstName: string; lastName: string; phone: string; address: string; city: string };
  items: { quantity: number; product: { name: string } }[];
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = () => {
    fetch("/api/orders/list")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setOrders)
      .catch(() => setError("No se pudo conectar a la base de datos."));
  };

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    loadOrders();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Pedidos</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pedidos realizados por los clientes.</p>

      {error && <p className="mt-6 text-sm text-muted-foreground">{error}</p>}

      {orders && (
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
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="text-white">
                    {o.customer.firstName} {o.customer.lastName}
                    <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                    <p className="text-xs text-muted-foreground">{o.customer.address}, {o.customer.city}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", ")}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {o.deliveryType === "DOMICILIO" ? "Domicilio" : "DAC"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {o.paymentMethod === "CASH" ? "Efectivo" : "Transferencia"}
                  </TableCell>
                  <TableCell className="text-white">${Number(o.total).toLocaleString("es-AR")}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-500/20 text-gray-300"}`}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {o.status === "PENDING" && (
                        <button
                          onClick={() => updateStatus(o.id, "CONFIRMED")}
                          disabled={updating === o.id}
                          className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                      )}
                      {(o.status === "PENDING" || o.status === "CONFIRMED") && (
                        <button
                          onClick={() => updateStatus(o.id, "DELIVERED")}
                          disabled={updating === o.id}
                          className="text-xs px-2 py-1 rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
                        >
                          Entregado
                        </button>
                      )}
                      {o.status !== "CANCELLED" && o.status !== "DELIVERED" && (
                        <button
                          onClick={() => updateStatus(o.id, "CANCELLED")}
                          disabled={updating === o.id}
                          className="text-xs px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Todavia no hay pedidos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
