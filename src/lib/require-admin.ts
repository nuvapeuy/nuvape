import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, type AdminSession } from "./admin-auth";

// Usar al inicio de cada route handler de admin:
//   const auth = await requireAdmin();
//   if (auth instanceof NextResponse) return auth;
export async function requireAdmin(): Promise<AdminSession | NextResponse> {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return session;
}
