import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ItemInput = {
  productId?: string | null;
  productName?: string | null;
  quantity: number;
  unitPrice: number;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as {
    status?: string;
    deliveryType?: string;
    paymentMethod?: string;
    items?: ItemInput[];
    subtotal?: number;
    shippingCost?: number;
    total?: number;
  };

  // Edicion de items / entrega / pago
  if (body.items) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    // Si el pedido ya fue entregado, revertir stock de los items anteriores
    if (order.status === "DELIVERED") {
      await Promise.all(
        order.items
          .filter((i) => i.productId)
          .map((i) =>
            prisma.product.update({
              where: { id: i.productId! },
              data: { stock: { increment: i.quantity } },
            })
          )
      );
    }

    // Reemplazar items
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.orderItem.createMany({
      data: body.items.map((item) => {
        const isPromo = !item.productId || item.productId.startsWith("promo-");
        return {
          orderId: id,
          productId: isPromo ? null : (item.productId ?? null),
          productName: item.productName ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
      }),
    });

    // Si era entregado, descontar stock de los nuevos items
    if (order.status === "DELIVERED") {
      await Promise.all(
        body.items
          .filter((i) => i.productId && !i.productId.startsWith("promo-"))
          .map((i) =>
            prisma.product.update({
              where: { id: i.productId! },
              data: { stock: { decrement: i.quantity } },
            })
          )
      );
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
  }

  // Cambio de estado
  const { status } = body;
  if (!status) return NextResponse.json({ error: "Falta status o items" }, { status: 400 });

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as never },
    include: { items: true },
  });

  if (status === "DELIVERED") {
    await Promise.all(
      order.items
        .filter((item) => item.productId)
        .map((item) =>
          prisma.product.update({
            where: { id: item.productId! },
            data: { stock: { decrement: item.quantity } },
          })
        )
    );
  }

  return NextResponse.json({ ok: true });
}
