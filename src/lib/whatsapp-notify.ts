import { Resend } from "resend";

const LOW_STOCK_THRESHOLD = 3;

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function notifyLowStockByWhatsApp(products: { name: string; stock: number }[]) {
  const to = process.env.STORE_OWNER_EMAIL;
  if (!process.env.RESEND_API_KEY || !to) return;

  const low = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0);
  const out = products.filter((p) => p.stock === 0);

  if (low.length === 0 && out.length === 0) return;

  const lines: string[] = [];
  if (out.length > 0) lines.push(`<b>Sin stock:</b><br>${out.map((p) => `• ${p.name}`).join("<br>")}`);
  if (low.length > 0) lines.push(`<b>Stock bajo (≤${LOW_STOCK_THRESHOLD}):</b><br>${low.map((p) => `• ${p.name} — ${p.stock} restantes`).join("<br>")}`);

  await getResend().emails.send({
    from: "NUVAPE <onboarding@resend.dev>",
    to,
    subject: "⚠️ Alerta de stock — NUVAPE",
    html: `<p>⚠️ <b>Alerta de stock NUVAPE</b></p><br>${lines.join("<br><br>")}`,
  });
}

type OrderNotificationInput = {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  deliveryType: string;
  paymentMethod: string;
  items: { name: string; quantity: number }[];
  total: number;
};

export async function notifyNewOrderByWhatsApp(order: OrderNotificationInput) {
  const to = process.env.STORE_OWNER_EMAIL;
  if (!process.env.RESEND_API_KEY || !to) {
    console.warn("[notify] Faltan variables de entorno, no se envía notificación.");
    return;
  }

  const itemsHtml = order.items.map((i) => `<li>${i.quantity}x ${i.name}</li>`).join("");
  const deliveryText = order.deliveryType === "DOMICILIO" ? "Envío a domicilio" : "Envío interior / DAC";
  const paymentText = order.paymentMethod === "CASH" ? "Efectivo contra entrega" : "Transferencia Itaú";

  const html = `
    <h2>🛒 Nuevo pedido en NUVAPE</h2>
    <p><b>Cliente:</b> ${order.customerName}</p>
    <p><b>Teléfono:</b> ${order.phone}</p>
    <p><b>Dirección:</b> ${order.address}${order.city ? `, ${order.city}` : ""}</p>
    <p><b>Entrega:</b> ${deliveryText}</p>
    <p><b>Pago:</b> ${paymentText}</p>
    <ul>${itemsHtml}</ul>
    <p><b>Total: $${order.total.toLocaleString("es-AR")}</b></p>
  `;

  const res = await getResend().emails.send({
    from: "NUVAPE <onboarding@resend.dev>",
    to,
    subject: `🛒 Nuevo pedido — ${order.customerName}`,
    html,
  });

  if (res.error) {
    console.error("[notify] Resend error:", res.error);
  }
}
