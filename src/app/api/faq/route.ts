import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const faqs = await prisma.faq.findMany({ where: { active: true }, orderBy: { position: "asc" } });
  return NextResponse.json(faqs);
}
