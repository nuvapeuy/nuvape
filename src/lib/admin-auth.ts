import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "nuvape_admin_session";

const IS_PROD = process.env.NODE_ENV === "production";

// En producción no hay valores por defecto: si falta la variable, nadie puede iniciar sesión.
function getSecret(): string | null {
  return process.env.ADMIN_SECRET || (IS_PROD ? null : "nuvape-dev-secret");
}

export type AdminRole = "ADMIN";

export type AdminSession = {
  email: string;
  name: string;
  role: AdminRole;
};

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken(session: AdminSession): string {
  const secret = getSecret();
  if (!secret) throw new Error("Falta ADMIN_SECRET");
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  const secret = getSecret();
  if (!token || !secret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as AdminSession;
  } catch {
    return null;
  }
}

type StaticAdmin = AdminSession & { password: string };

// Único usuario del panel. En producción sale solo de ADMIN_EMAIL / ADMIN_PASSWORD.
export function getStaticAdmins(): StaticAdmin[] {
  const email = process.env.ADMIN_EMAIL || (IS_PROD ? undefined : "admin@nuvape.com");
  const password = process.env.ADMIN_PASSWORD || (IS_PROD ? undefined : "nuvape2026");
  if (!email || !password) return [];
  return [{ email, password, name: "Administrador", role: "ADMIN" }];
}
