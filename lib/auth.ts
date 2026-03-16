import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { logger } from "./logger";
import * as Sentry from "@sentry/nextjs";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ADMIN_COOKIE = "admin_session";
const USER_COOKIE = "user_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET environment variable is required");
  return secret;
}

function hmacSHA256Sync(message: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Encode nome to avoid `:` delimiter collision
function encodeNome(nome: string): string {
  return Buffer.from(nome).toString("base64url");
}

function decodeNome(encoded: string): string {
  return Buffer.from(encoded, "base64url").toString();
}

// ─── Token generation / verification ───

function createToken(role: string, id: string, nome: string): { token: string; expires: Date } {
  const secret = getSecret();
  const expires = new Date(Date.now() + SESSION_DURATION);
  const encodedNome = encodeNome(nome);
  const payload = `${role}:${id}:${encodedNome}:${expires.getTime()}`;
  const signature = hmacSHA256Sync(payload, secret);
  return { token: `${payload}:${signature}`, expires };
}

function verifyToken(token: string): { valid: boolean; role?: string; id?: string; nome?: string } {
  try {
    const secret = getSecret();
    const parts = token.split(":");
    if (parts.length !== 5) return { valid: false };
    const [role, id, encodedNome, expiresStr, signature] = parts;
    const payload = `${role}:${id}:${encodedNome}:${expiresStr}`;
    const expected = hmacSHA256Sync(payload, secret);
    if (!timingSafeCompare(signature, expected)) return { valid: false };
    if (Date.now() > Number(expiresStr)) return { valid: false };
    return { valid: true, role, id, nome: decodeNome(encodedNome) };
  } catch {
    return { valid: false };
  }
}

// ─── Admin auth (legado — mantido para compatibilidade) ───

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
  return createToken("admin", "legacy", nome);
}

/**
 * @deprecated Legacy 4-part token format will be removed in v2.0.
 * All new tokens use the 5-part format (role:id:nome:expires:sig).
 * Legacy tokens issued before 2025-06-01 should be rotated.
 */
export function verifySessionToken(token: string): boolean {
  const parts = token.split(":");
  if (parts.length === 4) {
    // Formato legado: role:nome:expires:sig — DEPRECATED
    logger.warn("Legacy 4-part token used — schedule rotation", "auth", {
      tokenPrefix: parts[0],
    });
    try {
      const secret = getSecret();
      const [role, nome, expiresStr, signature] = parts;
      const payload = `${role}:${nome}:${expiresStr}`;
      const expected = hmacSHA256Sync(payload, secret);
      if (!timingSafeCompare(signature, expected)) return false;
      if (Date.now() > Number(expiresStr)) return false;
      return true;
    } catch {
      return false;
    }
  }
  return verifyToken(token).valid;
}

export function getSessionName(token: string): string | null {
  const parts = token.split(":");
  if (parts.length === 4) return parts[1]; // legado
  if (parts.length === 5) {
    try { return decodeNome(parts[2]); } catch { return parts[2]; }
  }
  return null;
}

export function getSessionRole(token: string): string | null {
  const parts = token.split(":");
  if (parts.length < 4) return null;
  return parts[0];
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  if (!session) return false;
  return verifySessionToken(session.value);
}

// ─── Plataforma auth (User multi-role) ───

export async function verifyUserCredentials(
  email: string,
  senha: string
): Promise<{ valid: boolean; user?: { id: string; nome: string; role: string; email: string } }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user || !user.ativo) return { valid: false };
  if (!user.senhaHash) return { valid: false }; // Google-only user
  const match = await bcrypt.compare(senha, user.senhaHash);
  if (!match) return { valid: false };

  // Atualizar último login
  await prisma.user.update({
    where: { id: user.id },
    data: { ultimoLogin: new Date() },
  }).catch((err) => logger.warn("Failed to update ultimoLogin", "auth", { error: String(err) }));

  return {
    valid: true,
    user: { id: user.id, nome: user.nome, role: user.role, email: user.email },
  };
}

export function createUserSessionToken(user: { id: string; nome: string; role: string }): { token: string; expires: Date } {
  return createToken(user.role, user.id, user.nome);
}

export async function getUserSession(): Promise<{ id: string; nome: string; role: string } | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_COOKIE);
  if (!session) return null;
  const result = verifyToken(session.value);
  if (!result.valid) return null;
  const user = { id: result.id!, nome: result.nome!, role: result.role! };
  Sentry.setUser({ id: user.id, username: user.nome });
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export { ADMIN_COOKIE as COOKIE_NAME, USER_COOKIE };
