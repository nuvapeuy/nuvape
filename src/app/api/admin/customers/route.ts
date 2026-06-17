import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: { select: { total: true, status: true, createdAt: true } },
      },
    });

    const ranking = customers
      .map((c) => {
        const orders = c.orders;
        const totalSpent = orders
          .filter((o) => o.status !== "CANCELLED")
          .reduce((sum, o) => sum + Number(o.total), 0);
        const lastOrder = orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]?.createdAt ?? null;
        return {
          phone: c.phone,
          name: `${c.firstName} ${c.lastName}`.trim(),
          orderCount: orders.filter((o) => o.status !== "CANCELLED").length,
          totalSpent,
          lastOrder,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json(ranking);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
