"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/admin/image-uploader";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [brandName, setBrandName] = useState("NUVAPE");
  const [whatsapp, setWhatsapp] = useState("5490000000000");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  function save() {
    toast.success("Configuración guardada.");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Configuración</h1>
      <p className="mt-1 text-sm text-muted-foreground">Datos generales de la tienda.</p>

      <div className="glass mt-6 max-w-xl rounded-xl p-5">
        <Label className="mb-1.5 block text-sm text-muted-foreground">Logo</Label>
        <ImageUploader value={logoUrl} onChange={setLogoUrl} label="Subir logo (PNG transparente)" aspect="aspect-[3/1]" />

        <div className="mt-5">
          <Label className="mb-1.5 block text-sm text-muted-foreground">Nombre de marca</Label>
          <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
        </div>

        <div className="mt-4">
          <Label className="mb-1.5 block text-sm text-muted-foreground">Número de WhatsApp</Label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>

        <Button onClick={save} className="mt-6 bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/90">
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
