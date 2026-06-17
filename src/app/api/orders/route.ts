import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewOrderByWhatsApp } from "@/lib/whatsapp-notify";

type OrderItemInput = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

type OrderPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  deliveryType: "DOMICILIO" | "INTERIOR_DAC";
  paymentMethod: "CASH" | "BANK_TRANSFER";
  items: OrderItemInput[];
  subtotal: number;
  shippingCost: number;
  total: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as OrderPayload;

  if (!body.items?.length) {
    return NextResponse.json({ error: "El pedido no tiene productos" }, { status: 400 });
  }

  let orderId = `local-${Date.now()}`;
  try {
    const order = await prisma.order.create({
      data: {
        subtotal: body.subtotal,
        shippingCost: body.shippingCost,
        total: body.total,
        paymentMethod: body.paymentMethod ?? "CASH",
        deliveryType: body.deliveryType ?? "DOMICILIO",
        customer: {
          create: {
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            email: body.email,
            address: body.address,
            city: body.city,
          },
        },
        items: {
          create: body.items.map((item) => {
            const isPromo = !item.productId || item.productId.startsWith("promo-");
            return {
              ...(isPromo
                ? { productName: item.name }
                : { productId: item.productId, productName: item.name }),
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            };
          }),
        },
      },
    });
    orderId = order.id;
  } catch (dbErr) {
    console.error("[orders] Error al guardar en BD:", JSON.stringify(dbErr, null, 2));
  }

  try {
    await notifyNewOrderByWhatsApp({
      customerName: `${body.firstName} ${body.lastName}`,
      phone: body.phone,
      address: body.address,
      city: body.city,
      deliveryType: body.deliveryType,
      paymentMethod: body.paymentMethod,
      items: body.items.map((i) => ({ name: i.name, quantity: i.quantity })),
      total: body.total,
    });
  } catch (err) {
    console.error("[orders] No se pudo enviar la notificación de WhatsApp:", err);
  }

  return NextResponse.json({ id: orderId });
}
