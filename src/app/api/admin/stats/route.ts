import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const [activeProducts, outOfStock, pendingOrders, totalCustomers] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { active: true, stock: 0 } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.customer.count(),
    ]);
    return NextResponse.json({ activeProducts, outOfStock, pendingOrders, totalCustomers });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
