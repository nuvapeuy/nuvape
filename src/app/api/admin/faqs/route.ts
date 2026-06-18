import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const faqs = await prisma.faq.findMany({ where: { active: true }, orderBy: { position: "asc" } });
  return NextResponse.json(faqs);
}

export async function POST(request: Request) {
  const body = await request.json() as { question: string; answer: string };
  const count = await prisma.faq.count();
  const faq = await prisma.faq.create({ data: { ...body, position: count } });
  return NextResponse.json(faq);
}
