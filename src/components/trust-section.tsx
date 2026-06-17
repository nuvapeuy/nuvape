import { Truck, ShieldCheck, CreditCard, MessageCircle } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Envíos en el día", desc: "Coordinamos la entrega apenas confirmás tu pedido." },
  { icon: ShieldCheck, title: "Productos originales", desc: "Stock verificado de marcas oficiales." },
  { icon: CreditCard, title: "Pago simple", desc: "Pagás en efectivo al recibir tu pedido." },
  { icon: MessageCircle, title: "Atención directa", desc: "Te asesoramos por WhatsApp antes de comprar." },
];

export function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <h2 className="text-center text-2xl font-bold text-white">¿Por qué comprar en NUVAPE?</h2>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="glass rounded-xl p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--neon-purple)]/10 text-[var(--neon-purple)] ring-1 ring-[var(--neon-purple)]/30">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
