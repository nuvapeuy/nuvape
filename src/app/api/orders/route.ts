import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewOrderByWhatsApp } from "@/lib/whatsapp-notify";
import { findPromo, shippingFor } from "@/lib/pricing";

// Pedido de la tienda pública. El cliente solo dice QUÉ quiere; los precios,
// el envío y el total los calcula el servidor con los datos de la BD.

type OrderItemInput = {
  productId: string;
  quantity: number;
  pack?: { promoId: string; productIds: string[] };
};

type OrderPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  deliveryType: string;
  paymentMethod: string;
  items: OrderItemInput[];
};

type Line = { productId: string; productName: string; quantity: number; unitPrice: number };

const DELIVERY_TYPES = ["DOMICILIO", "INTERIOR_DAC"] as const;
const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER"] as const;
const MAX_QTY = 50;

class OrderError extends Error {}

function text(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function quantity(value: unknown) {
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > MAX_QTY) {
    throw new OrderError("Cantidad inválida");
  }
  return value as number;
}

async function buildLines(items: OrderItemInput[]): Promise<Line[]> {
  const ids = new Set<string>();
  for (const item of items) {
    if (item.pack) item.pack.productIds?.forEach((id) => ids.add(String(id)));
    else ids.add(String(item.productId));
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...ids] } },
    include: { brand: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const getActive = (id: string) => {
    const p = byId.get(id);
    if (!p || !p.active) throw new OrderError("Uno de los productos ya no está disponible. Revisá tu carrito.");
    return p;
  };

  const lines: Line[] = [];
  for (const item of items) {
    const qty = quantity(item.quantity);

    if (item.pack) {
      const promo = findPromo(String(item.pack.promoId));
      if (!promo) throw new OrderError("La promoción ya no está vigente. Revisá tu carrito.");
      const packIds = Array.isArray(item.pack.productIds) ? item.pack.productIds.map(String) : [];
      if (packIds.length !== promo.qty) throw new OrderError(`El ${promo.title} tiene que tener ${promo.qty} productos.`);

      const unitPrice = Math.round((promo.price / promo.qty) * 100) / 100;
      const counts = new Map<string, number>();
      for (const id of packIds) counts.set(id, (counts.get(id) ?? 0) + 1);

      for (const [id, count] of counts) {
        const p = getActive(id);
        if (p.brand.name !== promo.brandName) {
          throw new OrderError(`El ${promo.title} solo admite productos ${promo.brandName}.`);
        }
        lines.push({ productId: p.id, productName: `[${promo.title}] ${p.name}`, quantity: count * qty, unitPrice });
      }
    } else {
      const p = getActive(String(item.productId));
      lines.push({ productId: p.id, productName: p.name, quantity: qty, unitPrice: Number(p.price) });
    }
  }

  // Stock: se descuenta recién al confirmar el pedido, pero no aceptamos pedidos que ya no se pueden cumplir.
  const demand = new Map<string, number>();
  for (const l of lines) demand.set(l.productId, (demand.get(l.productId) ?? 0) + l.quantity);
  for (const [id, wanted] of demand) {
    const p = byId.get(id)!;
    if (p.stock < wanted) {
      throw new OrderError(
        p.stock === 0
          ? `${p.name} se agotó. Sacalo del carrito para continuar.`
          : `Solo quedan ${p.stock} unidades de ${p.name}.`
      );
    }
  }

  return lines;
}

export async function POST(request: Request) {
  let body: OrderPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "El pedido no tiene productos" }, { status: 400 });
  }

  const firstName = text(body.firstName);
  if (!firstName) return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });

  const deliveryType = DELIVERY_TYPES.find((d) => d === body.deliveryType) ?? "DOMICILIO";
  const paymentMethod = PAYMENT_METHODS.find((p) => p === body.paymentMethod) ?? "CASH";

  let lines: Line[];
  try {
    lines = await buildLines(body.items);
  } catch (err) {
    if (err instanceof OrderError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[orders] Error al validar el pedido:", err);
    return NextResponse.json({ error: "No pudimos registrar tu pedido. Intentá nuevamente." }, { status: 500 });
  }

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const shippingCost = shippingFor(deliveryType);
  const total = subtotal + shippingCost;
  const customer = {
    firstName,
    lastName: text(body.lastName),
    phone: text(body.phone, 30),
    email: text(body.email),
    address: text(body.address, 300),
    city: text(body.city),
  };

  // Si la BD falla, el pedido NO existe: devolvemos error y el cliente conserva su carrito.
  let orderId: string;
  try {
    const order = await prisma.order.create({
      data: {
        subtotal,
        shippingCost,
        total,
        paymentMethod,
        deliveryType,
        customer: { create: customer },
        items: { create: lines },
      },
    });
    orderId = order.id;
  } catch (dbErr) {
    console.error("[orders] Error al guardar en BD:", dbErr);
    return NextResponse.json({ error: "No pudimos registrar tu pedido. Intentá nuevamente." }, { status: 500 });
  }

  // El pedido ya está guardado: si falla el mail, se ve igual en /admin.
  try {
    await notifyNewOrderByWhatsApp({
      customerName: `${customer.firstName} ${customer.lastName}`.trim(),
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      deliveryType,
      paymentMethod,
      items: lines.map((l) => ({ name: l.productName, quantity: l.quantity })),
      total,
    });
  } catch (err) {
    console.error(`[orders] Pedido ${orderId} guardado, pero falló la notificación:`, err);
  }

  return NextResponse.json({ id: orderId, total });
}
