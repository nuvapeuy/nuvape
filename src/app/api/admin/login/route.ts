import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, STATIC_ADMINS } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { notifyFailedLoginAttempts } from "@/lib/whatsapp-notify";

const ALERT_THRESHOLD = 3;
const WINDOW_MINUTES = 15;

function getIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email: string; password: string };
  const ip = getIp(request);

  const admin = STATIC_ADMINS.find((a) => a.email === email && a.password === password);

  await prisma.loginAttempt.create({ data: { email, ip, success: !!admin } });

  if (!admin) {
    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
    const recentFails = await prisma.loginAttempt.count({
      where: { ip, success: false, createdAt: { gte: since } },
    });

    if (recentFails === ALERT_THRESHOLD) {
      notifyFailedLoginAttempts(ip, email, recentFails).catch(console.error);
    }

    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = createSessionToken({ email: admin.email, name: admin.name, role: admin.role });

  const response = NextResponse.json({ ok: true, role: admin.role });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
