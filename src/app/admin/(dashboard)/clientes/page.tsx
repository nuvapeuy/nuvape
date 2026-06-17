"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Customer = { id: string; firstName: string; lastName: string; email: string; phone: string; city: string };

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Clientes</h1>
      <p className="mt-1 text-sm text-muted-foreground">Clientes que realizaron pedidos.</p>

      <div className="mt-6 glass rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Ciudad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(customers ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-white">{c.firstName} {c.lastName}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                <TableCell className="text-muted-foreground">{c.city}</TableCell>
              </TableRow>
            ))}
            {customers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Todavía no hay clientes registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
