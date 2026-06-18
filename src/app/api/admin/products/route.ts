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
        brandId: p.brandId,
        price: Number(p.price),
        stock: p.stock,
        flags: p.flags.map((pf: any) => pf.flag.name),
      }))
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name: string;
      description: string;
      price: number;
      stock: number;
      puffs: number;
      nicotineLevel: number;
      brandId: string;
      imageUrl: string;
      flagNames?: string[];
    };

    const slug = body.name
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.product.findMany({ where: { slug: { startsWith: slug } }, select: { slug: true } });
    const finalSlug = existing.length === 0 ? slug : `${slug}-${existing.length}`;

    const flagIds: string[] = [];
    if (body.flagNames?.length) {
      const flags = await prisma.flag.findMany({ where: { name: { in: body.flagNames } } });
      flagIds.push(...flags.map((f) => f.id));
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: finalSlug,
        description: body.description,
        price: body.price,
        stock: body.stock,
        puffs: body.puffs,
        nicotineLevel: body.nicotineLevel,
        brandId: body.brandId,
        images: { create: { url: body.imageUrl, position: 0 } },
        flags: flagIds.length ? { create: flagIds.map((flagId) => ({ flagId })) } : undefined,
      },
    });

    return NextResponse.json({ id: product.id });
  } catch (err) {
    console.error("[admin/products POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
