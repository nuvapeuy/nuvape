import { createHmac } from "crypto";

export const SESSION_COOKIE = "nuvape_admin_session";

const SECRET = process.env.ADMIN_SESSION_SECRET ?? "nuvape-dev-secret";

export type AdminRole = "ADMIN" | "OPERATOR";

export type AdminSession = {
  email: string;
  name: string;
  role: AdminRole;
};

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (sign(payload) !== signature) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as AdminSession;
  } catch {
    return null;
  }
}

type StaticAdmin = AdminSession & { password: string };

export const STATIC_ADMINS: StaticAdmin[] = [
  {
    email: process.env.ADMIN_EMAIL ?? "admin@nuvape.com",
    password: process.env.ADMIN_PASSWORD ?? "nuvape2026",
    name: "Administrador",
    role: "ADMIN",
  },
  {
    email: process.env.OPERATOR_EMAIL ?? "operador@nuvape.com",
    password: process.env.OPERATOR_PASSWORD ?? "operador2026",
    name: "Operador",
    role: "OPERATOR",
  },
];
