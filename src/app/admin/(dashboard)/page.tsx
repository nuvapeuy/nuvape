import { MOCK_PRODUCTS } from "@/lib/mock-data";

const STATS = [
  { label: "Productos activos", value: MOCK_PRODUCTS.length },
  { label: "Sin stock", value: MOCK_PRODUCTS.filter((p) => p.stock === 0).length },
  { label: "Pedidos pendientes", value: 0 },
  { label: "Clientes registrados", value: 0 },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Resumen general de la tienda.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
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
