/**
 * Autenticação por API key para a API pública v1.
 *
 * Header: Authorization: Bearer pk351_xxx
 *
 * Scopes: companies:read, opportunities:read, opportunities:write, matches:read
 */

import { prisma } from "./prisma";
import { logger } from "./logger";
import crypto from "crypto";

export interface ApiKeyContext {
  userId: string;
  keyId: string;
  scopes: string[];
}

export async function validateApiKey(request: Request): Promise<ApiKeyContext | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const key = auth.slice(7);
  if (!key.startsWith("pk351_")) return null;

  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKey || !apiKey.ativa) return null;

  // Atualizar último uso (fire-and-forget)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { ultimoUso: new Date() },
  }).catch((err) => logger.warn("Failed to update API key ultimoUso", "api-auth", { error: String(err) }));

  return {
    userId: apiKey.userId,
    keyId: apiKey.id,
    scopes: apiKey.scopes,
  };
}

export function hasScope(ctx: ApiKeyContext, scope: string): boolean {
  return ctx.scopes.includes(scope) || ctx.scopes.includes("*");
}

export function generateApiKey(): string {
  return `pk351_${crypto.randomBytes(24).toString("hex")}`;
}
