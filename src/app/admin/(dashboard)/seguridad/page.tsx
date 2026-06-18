import { prisma } from "@/lib/prisma";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SeguridadPage() {
  const attempts = await prisma.loginAttempt.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const failed = attempts.filter((a) => !a.success).length;
  const success = attempts.filter((a) => a.success).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Seguridad — Accesos al admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">Últimos 100 intentos de inicio de sesión.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
          <p className="mt-1 text-2xl font-bold text-white">{attempts.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Exitosos</p>
          <p className="mt-1 text-2xl font-bold text-[var(--neon-green)]">{success}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Fallidos</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{failed}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-xs text-muted-foreground uppercase tracking-wide">
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Sin registros aún.</td>
              </tr>
            )}
            {attempts.map((a) => (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">
                  {a.success ? (
                    <span className="flex items-center gap-1.5 text-[var(--neon-green)]">
                      <ShieldCheck className="h-4 w-4" /> OK
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-400">
                      <ShieldAlert className="h-4 w-4" /> Fallido
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-white">{a.email}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{a.ip}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString("es-UY", { timeZone: "America/Montevideo" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
