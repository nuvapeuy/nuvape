import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const faq = await prisma.faq.update({ where: { id }, data: body });
  return NextResponse.json(faq);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.faq.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
