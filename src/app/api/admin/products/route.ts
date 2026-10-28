import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { uniqueProductSlug } from "@/lib/slug";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        brand: true,
        flags: { include: { flag: true } },
        categories: { include: { category: true } },
      },
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
        categories: p.categories.map((pc: any) => pc.category.name),
      }))
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json() as {
      name: string;
      description: string;
      price: number;
      stock: number;
      puffs: number;
      nicotineLevel: number;
      brandId: string;
      imageUrls: string[];
      flagNames?: string[];
      categoryNames?: string[];
    };

    const brand = await prisma.brand.findUnique({ where: { id: body.brandId }, select: { slug: true } });
    if (!brand) return NextResponse.json({ error: "Marca inexistente" }, { status: 400 });
    const finalSlug = await uniqueProductSlug(brand.slug, body.name);

    const flagIds: string[] = [];
    if (body.flagNames?.length) {
      const flags = await prisma.flag.findMany({ where: { name: { in: body.flagNames } } });
      flagIds.push(...flags.map((f) => f.id));
    }

    const categoryIds: string[] = [];
    if (body.categoryNames?.length) {
      const cats = await prisma.category.findMany({ where: { name: { in: body.categoryNames } } });
      categoryIds.push(...cats.map((c) => c.id));
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
        images: { create: body.imageUrls.map((url, i) => ({ url, position: i })) },
        flags: flagIds.length ? { create: flagIds.map((flagId) => ({ flagId })) } : undefined,
        categories: categoryIds.length ? { create: categoryIds.map((categoryId) => ({ categoryId })) } : undefined,
      },
    });

    return NextResponse.json({ id: product.id });
  } catch (err) {
    console.error("[admin/products POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
