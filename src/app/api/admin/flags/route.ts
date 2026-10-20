import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const flags = await prisma.flag.findMany({ select: { id: true, name: true, label: true }, orderBy: { name: "asc" } });
  return NextResponse.json(flags);
}
