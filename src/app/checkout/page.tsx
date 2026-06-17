"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore, cartSubtotal } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Truck, Package, Minus, Plus, Banknote, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const SHIPPING_COST = 150;
const WHATSAPP_NUMBER = "59892052416";

type DeliveryType = "DOMICILIO" | "INTERIOR_DAC";
type PaymentMethod = "CASH" | "BANK_TRANSFER";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clear = useCartStore((s) => s.clear);
  const subtotal = cartSubtotal(items);

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("DOMICILIO");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const shippingCost = deliveryType === "DOMICILIO" ? (items.length > 0 ? SHIPPING_COST : 0) : 0;
  const total = subtotal + shippingCost;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function buildWhatsAppMessage() {
    const itemsText = items.map((i) => `• ${i.quantity}x ${i.name} ($${i.price.toLocaleString("es-AR")} c/u)`).join("\n");
    const deliveryText =
      deliveryType === "DOMICILIO" ? "Envío a domicilio" : "Envío al interior / DAC (costo a coordinar)";
    const paymentText =
      paymentMethod === "CASH" ? "Efectivo contra entrega" : "Transferencia bancaria (Itaú)";

    return (
      `Hola! Quiero confirmar mi pedido en NUVAPE:\n\n` +
      `${itemsText}\n\n` +
      `Subtotal: $${subtotal.toLocaleString("es-AR")}\n` +
      `${deliveryType === "DOMICILIO" ? `Envío: $${shippingCost.toLocaleString("es-AR")}\n` : ""}` +
      `Total: $${total.toLocaleString("es-AR")}\n\n` +
      `${deliveryText}\n` +
      `Pago: ${paymentText}\n` +
      `Nombre: ${form.firstName} ${form.lastName}\n` +
      `Dirección: ${form.address}, ${form.city}\n\n` +
      `Quedo a la espera para coordinar el pago.`
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) {
      toast.error("Ingresá un número de teléfono válido (entre 9 y 15 dígitos).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryType,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
          subtotal,
          shippingCost,
          total,
        }),
      });
      if (!res.ok) throw new Error("No se pudo registrar el pedido");

      clear();
      toast.success("¡Pedido recibido! Nos pondremos en contacto a la brevedad.");
      router.push("/");
    } catch {
      toast.error("Hubo un error al registrar tu pedido. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Finalizar compra</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card title="Datos del cliente">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nombre y apellido" className="sm:col-span-2">
                <Input
                  required
                  placeholder="Juan Pérez"
                  value={`${form.firstName}${form.firstName && form.lastName ? " " : ""}${form.lastName}`}
                  onChange={(e) => {
                    const [first, ...rest] = e.target.value.split(" ");
                    update("firstName", first ?? "");
                    update("lastName", rest.join(" "));
                  }}
                />
              </Field>
              <Field label="Teléfono">
                <Input required placeholder="+598 99 123 456" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </Field>
              <Field label="Email">
                <Input required type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <Field label="Dirección" className="sm:col-span-2">
                <Input required value={form.address} onChange={(e) => update("address", e.target.value)} />
              </Field>
              <Field label="Ciudad">
                <Input required value={form.city} onChange={(e) => update("city", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Tipo de entrega">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DeliveryOption
                icon={Truck}
                title="Envío a domicilio"
                description="Montevideo · +$150"
                active={deliveryType === "DOMICILIO"}
                onClick={() => setDeliveryType("DOMICILIO")}
              />
              <DeliveryOption
                icon={Package}
                title="Envío al interior / DAC"
                description="Pagás el envío al recibir tu pedido, directo a DAC"
                active={deliveryType === "INTERIOR_DAC"}
                onClick={() => setDeliveryType("INTERIOR_DAC")}
              />
            </div>
          </Card>

          <Card title="Método de pago">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PaymentOption
                icon={Banknote}
                title="Efectivo contra entrega"
                description="Pagás cuando recibís tu pedido."
                active={paymentMethod === "CASH"}
                onClick={() => setPaymentMethod("CASH")}
              />
              <PaymentOption
                icon={Landmark}
                title="Transferencia bancaria (Itaú)"
                description="Te enviamos los datos de la cuenta por WhatsApp."
                active={paymentMethod === "BANK_TRANSFER"}
                onClick={() => setPaymentMethod("BANK_TRANSFER")}
              />
            </div>
          </Card>
        </div>

        <div className="glass h-fit rounded-xl p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-semibold text-white">Resumen del pedido</h2>

          <div className="mt-4 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 text-white hover:bg-white/5"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 text-white hover:bg-white/5"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white">
                  ${(item.price * item.quantity).toLocaleString("es-AR")}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Envío</span>
              <span>{deliveryType === "INTERIOR_DAC" ? "A coordinar" : `$${shippingCost.toLocaleString("es-AR")}`}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-semibold text-white">
              <span>Total</span>
              <span>${total.toLocaleString("es-AR")}</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || items.length === 0}
            className="mt-6 w-full bg-[var(--neon-green)] text-black hover:bg-[var(--neon-green)]/90"
          >
            {submitting ? "Enviando..." : "Confirmar pedido"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Al confirmar se abrirá WhatsApp con los datos para coordinar el pago.
          </p>
        </div>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}

function DeliveryOption({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: typeof Truck;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-[var(--neon-purple)]/50 bg-[var(--neon-purple)]/10"
          : "border-white/10 hover:border-white/20"
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", active ? "text-[var(--neon-purple)]" : "text-muted-foreground")} />
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function PaymentOption({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: typeof Banknote;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-[var(--neon-purple)]/50 bg-[var(--neon-purple)]/10"
          : "border-white/10 hover:border-white/20"
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", active ? "text-[var(--neon-purple)]" : "text-muted-foreground")} />
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
