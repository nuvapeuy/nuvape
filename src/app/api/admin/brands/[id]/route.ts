import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

// Activar / desactivar una marca. Es el interruptor (y el rollback) para lanzar una marca nueva.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const { active } = (await request.json()) as { active?: unknown };
  if (typeof active !== "boolean") {
    return NextResponse.json({ error: "Falta active (true/false)" }, { status: 400 });
  }

  try {
    const brand = await prisma.brand.update({ where: { id }, data: { active } });
    revalidatePath("/sitemap.xml");
    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
  }
}
