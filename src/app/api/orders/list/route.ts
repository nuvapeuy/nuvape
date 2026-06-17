import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: { include: { product: { select: { name: true, images: { take: 1 } } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("[orders/list]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
