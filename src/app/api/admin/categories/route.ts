import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories.map((c) => ({ id: c.id, name: c.name, productCount: c._count.products })));
}
