import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            items: { select: { quantity: true, productName: true, product: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Agrupar por telefono
    const byPhone = new Map<string, typeof customers>();
    for (const c of customers) {
      const key = c.phone.replace(/\D/g, "");
      if (!byPhone.has(key)) byPhone.set(key, []);
      byPhone.get(key)!.push(c);
    }

    const ranking = Array.from(byPhone.entries()).map(([, group]) => {
      const allOrders = group.flatMap((c) => c.orders);
      const activeOrders = allOrders.filter((o) => o.status !== "CANCELLED");
      const totalSpent = activeOrders.reduce((s, o) => s + Number(o.total), 0);
      const sorted = [...allOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const name = `${group[0].firstName} ${group[0].lastName}`.trim();
      return {
        phone: group[0].phone,
        name,
        orderCount: activeOrders.length,
        totalSpent,
        lastOrder: sorted[0]?.createdAt ?? null,
        orders: sorted.map((o) => ({
          id: o.id,
          status: o.status,
          total: Number(o.total),
          createdAt: o.createdAt,
          items: o.items.map((i) => `${i.quantity}x ${i.productName ?? i.product?.name ?? "?"}`).join(", "),
        })),
      };
    });

    ranking.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json(ranking);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
