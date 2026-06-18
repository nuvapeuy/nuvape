import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const flags = await prisma.flag.findMany({ select: { id: true, name: true, label: true }, orderBy: { name: "asc" } });
  return NextResponse.json(flags);
}
