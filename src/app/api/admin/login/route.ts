import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, STATIC_ADMINS } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email: string; password: string };

  const admin = STATIC_ADMINS.find((a) => a.email === email && a.password === password);
  if (!admin) {
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
