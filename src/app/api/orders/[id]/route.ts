import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = (await request.json()) as { status: string };

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as never },
    include: { items: true },
  });

  // Solo descuenta stock cuando se marca como entregado
  if (status === "DELIVERED") {
    await Promise.all(
      order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );
  }

  return NextResponse.json({ ok: true });
}
