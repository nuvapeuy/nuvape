import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: { select: { productId: true, quantity: true, unitPrice: true, productName: true, brandName: true, product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("[orders/list]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
