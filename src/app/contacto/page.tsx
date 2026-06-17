import { MessageCircle, Mail, Clock, MapPin } from "lucide-react";

const WHATSAPP_NUMBER = "59892052416";
const INSTAGRAM = "@nuvape.uy";

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Contacto</h1>
      <p className="mt-2 text-muted-foreground">
        Estamos para ayudarte. Escribinos por cualquiera de estos canales.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass flex items-center gap-4 rounded-2xl p-6 transition hover:border-[var(--neon-green)]/40 hover:bg-[var(--neon-green)]/5 border border-transparent"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--neon-green)]/10">
            <MessageCircle className="h-6 w-6 text-[var(--neon-green)]" />
          </div>
          <div>
            <p className="font-semibold text-white">WhatsApp</p>
            <p className="text-sm text-muted-foreground">+598 92 052 416</p>
          </div>
        </a>

        <a
          href={`https://instagram.com/nuvape.uy`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass flex items-center gap-4 rounded-2xl p-6 transition hover:border-[var(--neon-purple)]/40 hover:bg-[var(--neon-purple)]/5 border border-transparent"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--neon-purple)]/10">
            <Mail className="h-6 w-6 text-[var(--neon-purple)]" />
          </div>
          <div>
            <p className="font-semibold text-white">Instagram</p>
            <p className="text-sm text-muted-foreground">{INSTAGRAM}</p>
          </div>
        </a>

        <div className="glass flex items-center gap-4 rounded-2xl p-6 border border-transparent">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-white">Horario de atención</p>
            <p className="text-sm text-muted-foreground">Lunes a Sábado · 10:00 – 21:00</p>
          </div>
        </div>

        <div className="glass flex items-center gap-4 rounded-2xl p-6 border border-transparent">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-white">Zona de entrega</p>
            <p className="text-sm text-muted-foreground">Montevideo · Ciudad de la Costa · El Pinar · Interior vía DAC</p>
          </div>
        </div>
      </div>

      <div className="glass mt-8 rounded-2xl p-6 border border-white/5">
        <h2 className="font-semibold text-white">Preguntas frecuentes</h2>
        <div className="mt-4 flex flex-col gap-4">
          <FAQ q="¿Cómo hago un pedido?" a="Agregá los productos al carrito y completá el checkout. Te va a llegar una confirmación por WhatsApp." />
          <FAQ q="¿Cuánto tarda el envío?" a="Montevideo y zona metropolitana: mismo día o día siguiente. Interior: según los tiempos de DAC." />
          <FAQ q="¿Qué métodos de pago aceptan?" a="Efectivo contra entrega o transferencia bancaria Itaú." />
          <FAQ q="¿Tienen stock permanente?" a="Sí, trabajamos con stock propio. El stock disponible se muestra en cada producto." />
        </div>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{q}</p>
      <p className="mt-1 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}
