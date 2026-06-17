"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";

type CustomerRow = {
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string | null;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Clientes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ranking por total gastado &mdash; {customers?.length ?? "..."} clientes registrados.
      </p>

      <div className="mt-6 glass rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Total gastado</TableHead>
              <TableHead>Ultimo pedido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers === null && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Cargando...</TableCell>
              </TableRow>
            )}
            {customers?.map((c, i) => (
              <TableRow key={c.phone}>
                <TableCell className="text-muted-foreground">
                  {i === 0 ? <Trophy className="h-4 w-4 text-yellow-400" /> : i + 1}
                </TableCell>
                <TableCell className="font-medium text-white">{c.name || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                <TableCell className="text-muted-foreground">{c.orderCount}</TableCell>
                <TableCell className="text-white font-semibold">
                  ${c.totalSpent.toLocaleString("es-AR")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString("es-AR") : "-"}
                </TableCell>
              </TableRow>
            ))}
            {customers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Todavia no hay clientes registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
