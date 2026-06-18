import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json() as {
    stock?: number;
    categoryNames?: string[];
    name?: string;
    description?: string;
    price?: number;
    puffs?: number;
    nicotineLevel?: number;
    brandId?: string;
    imageUrls?: string[];
    flagNames?: string[];
  };

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

    if (body.name !== undefined) {
      await prisma.product.update({
        where: { id },
        data: {
          name: body.name,
          ...(body.description !== undefined && { description: body.description }),
          ...(body.price !== undefined && { price: body.price }),
          ...(body.puffs !== undefined && { puffs: body.puffs }),
          ...(body.nicotineLevel !== undefined && { nicotineLevel: body.nicotineLevel }),
          ...(body.brandId !== undefined && { brandId: body.brandId }),
        },
      });

      if (body.imageUrls !== undefined) {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        if (body.imageUrls.length > 0) {
          await prisma.productImage.createMany({
            data: body.imageUrls.map((url, i) => ({ productId: id, url, position: i })),
          });
        }
      }

      if (body.flagNames !== undefined) {
        await prisma.productFlag.deleteMany({ where: { productId: id } });
        if (body.flagNames.length > 0) {
          const flags = await prisma.flag.findMany({ where: { name: { in: body.flagNames } } });
          await prisma.productFlag.createMany({
            data: flags.map((f) => ({ productId: id, flagId: f.id })),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/products PATCH]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
