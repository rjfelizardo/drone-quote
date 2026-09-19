import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SESSION_COOKIE = "dq_session";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET não configurado no servidor.");
  }
  return new TextEncoder().encode(secret);
}

export type Role = "super_admin" | "company";

export interface SessionData {
  role: Role;
  companyId: string | null; // null só pra super_admin
  email: string;
}

export async function createSessionToken(data: SessionData): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

// Uso em Server Components e Route Handlers (roda em Node.js, não Edge).
// Lê o cookie httpOnly direto — nunca confie em dados vindos do cliente.
export async function getSession(): Promise<SessionData | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
