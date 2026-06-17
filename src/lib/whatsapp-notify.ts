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
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.STORE_OWNER_WHATSAPP_TO;

  if (!accountSid || !authToken || !from || !to) {
    console.warn("[whatsapp-notify] Faltan variables de entorno de Twilio, no se envía notificación.");
    return;
  }

  const itemsText = order.items.map((i) => `• ${i.quantity}x ${i.name}`).join("\n");
  const deliveryText = order.deliveryType === "DOMICILIO" ? "Envío a domicilio" : "Envío interior / DAC";
  const paymentText = order.paymentMethod === "CASH" ? "Efectivo contra entrega" : "Transferencia Itaú";
  const body =
    `🛒 *Nuevo pedido en NUVAPE*\n\n` +
    `Cliente: ${order.customerName}\n` +
    `Tel: ${order.phone}\n` +
    `Dirección: ${order.address}, ${order.city}\n\n` +
    `${itemsText}\n\n` +
    `Total: $${order.total.toLocaleString("es-AR")}\n` +
    `Entrega: ${deliveryText}\n` +
    `Pago: ${paymentText}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: `whatsapp:${from}`,
      To: `whatsapp:${to}`,
      Body: body,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[whatsapp-notify] Twilio respondió con error:", res.status, errorText);
  }
}
