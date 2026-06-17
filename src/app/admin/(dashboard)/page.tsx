"use client";

import { useEffect, useState } from "react";

type Stats = {
  activeProducts: number;
  outOfStock: number;
  pendingOrders: number;
  totalCustomers: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const items = [
    { label: "Productos activos", value: stats?.activeProducts ?? "—" },
    { label: "Sin stock", value: stats?.outOfStock ?? "—" },
    { label: "Pedidos pendientes", value: stats?.pendingOrders ?? "—" },
    { label: "Clientes registrados", value: stats?.totalCustomers ?? "—" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Resumen general de la tienda.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
