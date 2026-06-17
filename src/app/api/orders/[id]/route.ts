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
  const body = (await request.json()) as { status?: string; items?: ItemInput[]; subtotal?: number; shippingCost?: number; total?: number };

  // Edicion de items
  if (body.items) {
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
    await prisma.order.update({
      where: { id },
      data: {
        ...(body.subtotal != null && { subtotal: body.subtotal }),
        ...(body.shippingCost != null && { shippingCost: body.shippingCost }),
        ...(body.total != null && { total: body.total }),
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
