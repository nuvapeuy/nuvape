import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json() as { stock?: number; categoryNames?: string[] };

  try {
    if (body.stock !== undefined) {
      await prisma.product.update({ where: { id }, data: { stock: body.stock } });
    }

    if (body.categoryNames !== undefined) {
      const cats = await prisma.category.findMany({ where: { name: { in: body.categoryNames } } });
      await prisma.productCategory.deleteMany({ where: { productId: id } });
      if (cats.length > 0) {
        await prisma.productCategory.createMany({
          data: cats.map((c) => ({ productId: id, categoryId: c.id })),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
