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

async function getIpInfo(ip: string): Promise<{ city: string; region: string; country: string; org: string } | null> {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN ?? ""}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function parseUserAgent(ua: string): string {
  if (!ua) return "Dispositivo desconocido";
  const browser =
    ua.includes("Edg/")     ? "Edge" :
    ua.includes("Chrome/")  ? "Chrome" :
    ua.includes("Firefox/") ? "Firefox" :
    ua.includes("Safari/")  ? "Safari" :
    ua.includes("curl")     ? "curl (automatizado)" : "Navegador desconocido";
  const os =
    ua.includes("iPhone")  ? "iPhone" :
    ua.includes("iPad")    ? "iPad" :
    ua.includes("Android") ? "Android" :
    ua.includes("Windows") ? "Windows" :
    ua.includes("Mac")     ? "Mac" :
    ua.includes("Linux")   ? "Linux" : "SO desconocido";
  return `${browser} en ${os}`;
}

export async function notifyFailedLoginAttempts(ip: string, email: string, count: number, userAgent?: string) {
  const to = process.env.STORE_OWNER_EMAIL;
  if (!process.env.RESEND_API_KEY || !to) return;

  const [info] = await Promise.all([getIpInfo(ip)]);

  const location = info
    ? `${info.city ?? ""}${info.region ? `, ${info.region}` : ""}${info.country ? ` (${info.country})` : ""}`.trim()
    : "Ubicación no disponible";
  const isp = info?.org ?? "Proveedor desconocido";
  const device = parseUserAgent(userAgent ?? "");

  await getResend().emails.send({
    from: "NUVAPE <onboarding@resend.dev>",
    to,
    subject: "🚨 Intentos de acceso fallidos — NUVAPE Admin",
    html: `
      <h2>🚨 Alerta de seguridad NUVAPE</h2>
      <p>Se detectaron <b>${count} intentos fallidos</b> de acceso al panel de administración.</p>
      <table style="border-collapse:collapse;margin-top:12px">
        <tr><td style="padding:4px 12px 4px 0;color:#888">Email usado</td><td style="padding:4px 0"><b>${email}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888">IP</td><td style="padding:4px 0"><b>${ip}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888">Ubicación</td><td style="padding:4px 0"><b>${location}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888">Proveedor</td><td style="padding:4px 0"><b>${isp}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888">Dispositivo</td><td style="padding:4px 0"><b>${device}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888">Fecha</td><td style="padding:4px 0"><b>${new Date().toLocaleString("es-UY", { timeZone: "America/Montevideo" })}</b></td></tr>
      </table>
      <br>
      <p style="color:#888;font-size:13px">Si fuiste vos probando, ignorá este mensaje. Si no, alguien está intentando entrar a tu panel.</p>
    `,
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
