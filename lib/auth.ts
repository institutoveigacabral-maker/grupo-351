import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
if (!ADMIN_SECRET) {
  console.warn("WARNING: ADMIN_SECRET not set — admin auth will fail");
}

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  if (!ADMIN_SECRET) throw new Error("ADMIN_SECRET environment variable is required");
  return ADMIN_SECRET;
}

function hmacSHA256Sync(message: string, secret: string): string {
  const { createHmac } = require("crypto");
  return createHmac("sha256", secret).update(message).digest("hex");
}

export async function verifyCredentials(
  email: string,
  senha: string
): Promise<{ valid: boolean; nome?: string }> {
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return { valid: false };

  const match = await bcrypt.compare(senha, user.senhaHash);
  if (!match) return { valid: false };

  return { valid: true, nome: user.nome };
}

export function createSessionToken(nome: string): { token: string; expires: Date } {
  const secret = getSecret();
  const expires = new Date(Date.now() + SESSION_DURATION);
  const payload = `admin:${nome}:${expires.getTime()}`;
  const signature = hmacSHA256Sync(payload, secret);
  return {
    token: `${payload}:${signature}`,
    expires,
  };
}

export function verifySessionToken(token: string): boolean {
  try {
    const secret = getSecret();
    const parts = token.split(":");
    if (parts.length !== 4) return false;
    const [role, nome, expiresStr, signature] = parts;
    const payload = `${role}:${nome}:${expiresStr}`;
    const expected = hmacSHA256Sync(payload, secret);
    if (signature !== expected) return false;
    if (Date.now() > Number(expiresStr)) return false;
    return true;
  } catch {
    return false;
  }
}

export function getSessionName(token: string): string | null {
  const parts = token.split(":");
  if (parts.length !== 4) return null;
  return parts[1];
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session) return false;
  return verifySessionToken(session.value);
}

// Utility to hash a password (used in migration script)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export { COOKIE_NAME };
