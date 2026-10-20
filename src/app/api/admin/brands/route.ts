import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const brands = await prisma.brand.findMany({
    select: { id: true, name: true, slug: true, active: true, _count: { select: { products: { where: { active: true } } } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(
    brands.map(({ _count, ...b }) => ({ ...b, productCount: _count.products }))
  );
}

// Las marcas nuevas se crean inactivas: se cargan sus productos y después se activan.
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { name } = (await request.json()) as { name?: string };
  const cleanName = name?.trim().toUpperCase();
  if (!cleanName) return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });

  const slug = cleanName
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await prisma.brand.findFirst({ where: { OR: [{ name: cleanName }, { slug }] } });
  if (existing) return NextResponse.json({ error: "Ya existe una marca con ese nombre" }, { status: 409 });

  const brand = await prisma.brand.create({ data: { name: cleanName, slug, active: false } });
  return NextResponse.json(brand);
}
