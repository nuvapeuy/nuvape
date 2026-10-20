import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const brands = await prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return NextResponse.json(brands);
}
