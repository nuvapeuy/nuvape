"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Order = {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  customer: { firstName: string; lastName: string; phone: string };
  items: { quantity: number; product: { name: string } }[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron cargar los pedidos");
        return res.json();
      })
      .then(setOrders)
      .catch(() => setError("No se pudo conectar a la base de datos. Configurá DATABASE_URL para ver pedidos reales."));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Pedidos</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pedidos realizados por los clientes.</p>

      {error && <p className="mt-6 text-sm text-muted-foreground">{error}</p>}

      {orders && (
        <div className="mt-6 glass rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="text-white">
                    {o.customer.firstName} {o.customer.lastName}
                    <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", ")}
                  </TableCell>
                  <TableCell className="text-white">${Number(o.total).toLocaleString("es-AR")}</TableCell>
                  <TableCell className="text-muted-foreground">{o.status}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("es-AR")}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Todavía no hay pedidos.
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
