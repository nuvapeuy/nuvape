import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { brandNamesByProductId } from "@/lib/products";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const orders = await prisma.order.findMany({
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

type ManualItemInput = { productId: string; name: string; quantity: number; unitPrice: number };

// Pedido manual cargado desde /admin: el precio y el descuento los decide el admin.
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as {
    firstName: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    deliveryType?: "DOMICILIO" | "INTERIOR_DAC";
    paymentMethod?: "CASH" | "BANK_TRANSFER";
    items: ManualItemInput[];
    subtotal: number;
    shippingCost: number;
    total: number;
    discount?: number;
    notes?: string;
  };

  if (!body.items?.length) {
    return NextResponse.json({ error: "El pedido no tiene productos" }, { status: 400 });
  }

  try {
    const isPromo = (productId?: string) => !productId || productId.startsWith("promo-");
    const brands = await brandNamesByProductId(body.items.filter((i) => !isPromo(i.productId)).map((i) => i.productId));
    const order = await prisma.order.create({
      data: {
        subtotal: body.subtotal,
        shippingCost: body.shippingCost,
        total: body.total,
        discount: body.discount ?? 0,
        notes: body.notes || null,
        paymentMethod: body.paymentMethod ?? "CASH",
        deliveryType: body.deliveryType ?? "DOMICILIO",
        customer: {
          create: {
            firstName: body.firstName,
            lastName: body.lastName ?? "",
            phone: body.phone ?? "",
            email: body.email ?? "",
            address: body.address ?? "",
            city: body.city ?? "",
          },
        },
        items: {
          create: body.items.map((item) => {
            const promo = isPromo(item.productId);
            return {
              ...(promo ? {} : { productId: item.productId }),
              productName: item.name,
              brandName: promo ? null : brands.get(item.productId) ?? null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            };
          }),
        },
      },
    });
    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error("[admin/orders POST]", err);
    return NextResponse.json({ error: "No se pudo guardar el pedido" }, { status: 500 });
  }
}
