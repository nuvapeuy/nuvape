import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const banners = await prisma.banner.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json(banners);
}

export async function POST(request: Request) {
  const body = await request.json() as { title: string; subtitle?: string; imageUrl: string; linkUrl?: string };
  const count = await prisma.banner.count();
  const banner = await prisma.banner.create({ data: { ...body, position: count } });
  return NextResponse.json(banner);
}
