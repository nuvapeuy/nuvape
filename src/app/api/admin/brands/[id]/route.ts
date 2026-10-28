import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { isHexColor } from "@/lib/brand-theme";

// Activar / desactivar una marca (el interruptor y el rollback para lanzar una marca nueva)
// o cambiar su color de acento.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = (await request.json()) as { active?: unknown; color?: unknown };
  const data: { active?: boolean; color?: string | null } = {};
  if ("active" in body) {
    if (typeof body.active !== "boolean") return NextResponse.json({ error: "active tiene que ser true/false" }, { status: 400 });
    data.active = body.active;
  }
  if ("color" in body) {
    if (body.color !== null && !isHexColor(body.color)) return NextResponse.json({ error: "Color inválido (#rrggbb)" }, { status: 400 });
    data.color = body.color;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Falta active o color" }, { status: 400 });
  }

  try {
    const brand = await prisma.brand.update({ where: { id }, data });
    revalidatePath("/sitemap.xml");
    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
  }
}
