"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(176,38,255,0.12),transparent_55%)]" />
      <form onSubmit={handleSubmit} className="glass-strong w-full max-w-sm rounded-2xl p-8">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--neon-purple)] uppercase glow-text-purple">
          NUVAPE
        </p>
        <h1 className="mt-4 text-2xl font-bold text-white">Panel administrativo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ingresá tus credenciales para continuar.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-muted-foreground">Contraseña</Label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-[var(--neon-red,#ff3355)]">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </div>
  );
}
