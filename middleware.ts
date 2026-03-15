import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getAdminSecret(): string | null {
  return process.env.ADMIN_SECRET || null;
}

async function hmacSHA256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

async function verifyToken(token: string): Promise<{ valid: boolean; role?: string }> {
  const secret = getAdminSecret();
  if (!secret) return { valid: false };
  const parts = token.split(":");

  // Formato legado (4 partes): role:nome:expires:sig
  if (parts.length === 4) {
    const [role, nome, expiresStr, signature] = parts;
    const payload = `${role}:${nome}:${expiresStr}`;
    const expected = await hmacSHA256(payload, secret);
    if (!timingSafeCompare(signature, expected)) return { valid: false };
    if (Date.now() > Number(expiresStr)) return { valid: false };
    return { valid: true, role };
  }

  // Formato novo (5 partes): role:id:nome:expires:sig
  if (parts.length === 5) {
    const [role, id, nome, expiresStr, signature] = parts;
    const payload = `${role}:${id}:${nome}:${expiresStr}`;
    const expected = await hmacSHA256(payload, secret);
    if (!timingSafeCompare(signature, expected)) return { valid: false };
    if (Date.now() > Number(expiresStr)) return { valid: false };
    return { valid: true, role };
  }

  return { valid: false };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Admin routes ───
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Allow login/logout without auth
    if (pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
      return NextResponse.next();
    }

    const session = request.cookies.get("admin_session");
    if (!session) {
      return redirectOrDeny(request, pathname, "/admin/login");
    }

    const result = await verifyToken(session.value);
    if (!result.valid) {
      return redirectOrDeny(request, pathname, "/admin/login");
    }

    return NextResponse.next();
  }

  // ─── Plataforma routes (dashboard, empresas, oportunidades) ───
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/platform")) {
    // Allow auth endpoints
    if (
      pathname === "/api/platform/auth/login" ||
      pathname === "/api/platform/auth/register" ||
      pathname.startsWith("/api/platform/auth/google")
    ) {
      return NextResponse.next();
    }

    const session = request.cookies.get("user_session");
    if (!session) {
      return redirectOrDeny(request, pathname, "/login");
    }

    const result = await verifyToken(session.value);
    if (!result.valid) {
      return redirectOrDeny(request, pathname, "/login");
    }

    // Injetar role no header para route handlers
    const response = NextResponse.next();
    response.headers.set("x-user-role", result.role || "");
    return response;
  }

  return NextResponse.next();
}

function redirectOrDeny(request: NextRequest, pathname: string, loginPath: string) {
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL(loginPath, request.url));
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/api/platform/:path*",
  ],
};
