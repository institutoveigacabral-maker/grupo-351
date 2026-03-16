import { prisma } from "./prisma";
import { headers } from "next/headers";
import { logger } from "./logger";
import type { Prisma } from "@prisma/client";

interface AuditEntry {
  acao: string;
  recurso: string;
  resourceId?: string;
  adminId: string;
  adminNome: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detalhes?: any;
}

/**
 * Log audit entry for admin actions.
 * Safe IP extraction with validation.
 * Never breaks the request on failure.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const hdrs = await headers();
    const ip = extractIp(hdrs);

    await prisma.auditLog.create({
      data: {
        acao: entry.acao,
        recurso: entry.recurso,
        resourceId: entry.resourceId || null,
        adminId: entry.adminId,
        adminNome: entry.adminNome,
        ...(entry.detalhes && { detalhes: entry.detalhes as Prisma.InputJsonValue }),
        ip,
      },
    });
  } catch (err) {
    logger.error(`Failed to log audit: ${entry.acao} ${entry.recurso}`, "audit", { error: String(err) });
  }
}

/**
 * Log platform user action (non-admin).
 * Use for critical operations: delete account, create API key, billing, etc.
 */
export async function logPlatformAudit(entry: {
  acao: string;
  recurso: string;
  resourceId?: string;
  userId: string;
  userNome: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detalhes?: any;
}): Promise<void> {
  try {
    const hdrs = await headers();
    const ip = extractIp(hdrs);

    await prisma.auditLog.create({
      data: {
        acao: entry.acao,
        recurso: entry.recurso,
        resourceId: entry.resourceId || null,
        adminId: entry.userId,
        adminNome: `[platform] ${entry.userNome}`,
        ...(entry.detalhes && { detalhes: entry.detalhes as Prisma.InputJsonValue }),
        ip,
      },
    });
  } catch (err) {
    logger.error(`Failed to log platform audit: ${entry.acao} ${entry.recurso}`, "audit", { error: String(err) });
  }
}

/** Safe IP extraction — validates format, falls back to null */
function extractIp(hdrs: Headers): string | null {
  const forwarded = hdrs.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && isValidIp(first)) return first;
  }

  const realIp = hdrs.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) return realIp;

  return null;
}

const IPV4_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const IPV6_RE = /^[0-9a-fA-F:]+$/;

function isValidIp(ip: string): boolean {
  return IPV4_RE.test(ip) || IPV6_RE.test(ip);
}
