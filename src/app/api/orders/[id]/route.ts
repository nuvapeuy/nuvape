import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyLowStockByWhatsApp } from "@/lib/whatsapp-notify";

// Estados donde el stock ya fue descontado
const STOCK_DECREMENTED_STATUSES = ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

async function checkAndNotifyLowStock(productIds: string[]) {
  if (productIds.length === 0) return;
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { name: true, stock: true },
  });
  await notifyLowStockByWhatsApp(products).catch(() => {});
}

async function decrementStock(productId: string, quantity: number) {
  await prisma.$executeRaw`
    UPDATE "Product" SET stock = GREATEST(stock - ${quantity}, 0) WHERE id = ${productId}
  `;
}

type ItemInput = {
  productId?: string | null;
  productName?: string | null;
  quantity: number;
  unitPrice: number;
};

function isRealProduct(productId?: string | null) {
  return !!productId && !productId.startsWith("promo-");
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: {
    status?: string;
    deliveryType?: string;
    paymentMethod?: string;
    items?: ItemInput[];
    subtotal?: number;
    shippingCost?: number;
    total?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  // ── Edicion de items / entrega / pago ──────────────────────
  if (body.items) {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

      const stockAlreadyDecremented = STOCK_DECREMENTED_STATUSES.includes(order.status);

      // Revertir stock si ya estaba descontado
      if (stockAlreadyDecremented) {
        for (const i of order.items) {
          if (isRealProduct(i.productId)) {
            await prisma.product.update({
              where: { id: i.productId! },
              data: { stock: { increment: i.quantity } },
            });
          }
        }
      }

      // Reemplazar items
      await prisma.orderItem.deleteMany({ where: { orderId: id } });
      await prisma.orderItem.createMany({
        data: body.items.map((item) => ({
          orderId: id,
          productId: isRealProduct(item.productId) ? item.productId! : null,
          productName: item.productName ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      // Re-descontar stock con los nuevos items
      if (stockAlreadyDecremented) {
        const affectedIds: string[] = [];
        for (const item of body.items) {
          if (isRealProduct(item.productId)) {
            await decrementStock(item.productId!, item.quantity);
            affectedIds.push(item.productId!);
          }
        }
        await checkAndNotifyLowStock(affectedIds);
      }

      await prisma.order.update({
        where: { id },
        data: {
          ...(body.subtotal != null && { subtotal: body.subtotal }),
          ...(body.shippingCost != null && { shippingCost: body.shippingCost }),
          ...(body.total != null && { total: body.total }),
          ...(body.deliveryType && { deliveryType: body.deliveryType as never }),
          ...(body.paymentMethod && { paymentMethod: body.paymentMethod as never }),
        },
      });

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[orders PATCH items]", err);
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // ── Cambio de estado ───────────────────────────────────────
  const { status } = body;
  if (!status) return NextResponse.json({ error: "Falta status o items" }, { status: 400 });

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    const wasDecremented = STOCK_DECREMENTED_STATUSES.includes(order.status);
    const willBeDecremented = STOCK_DECREMENTED_STATUSES.includes(status);

    // PENDING → CONFIRMED: descontar stock
    if (!wasDecremented && willBeDecremented) {
      const affectedIds: string[] = [];
      for (const item of order.items) {
        if (isRealProduct(item.productId)) {
          await decrementStock(item.productId!, item.quantity);
          affectedIds.push(item.productId!);
        }
      }
      await checkAndNotifyLowStock(affectedIds);
    }

    // Cualquier estado → CANCELLED: devolver stock si ya estaba descontado
    if (status === "CANCELLED" && wasDecremented) {
      for (const item of order.items) {
        if (isRealProduct(item.productId)) {
          await prisma.product.update({
            where: { id: item.productId! },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    await prisma.order.update({
      where: { id },
      data: { status: status as never },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[orders PATCH status]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
