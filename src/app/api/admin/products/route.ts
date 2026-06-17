import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { brand: true, flags: { include: { flag: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand.name,
        price: Number(p.price),
        stock: p.stock,
        flags: p.flags.map((pf: any) => pf.flag.name),
      }))
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
