import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

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

async function verifyToken(token: string): Promise<boolean> {
  if (!ADMIN_SECRET) return false;
  const parts = token.split(":");
  if (parts.length !== 4) return false;
  const [role, nome, expiresStr, signature] = parts;
  const payload = `${role}:${nome}:${expiresStr}`;
  const expected = await hmacSHA256(payload, ADMIN_SECRET);
  if (signature !== expected) return false;
  if (Date.now() > Number(expiresStr)) return false;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const session = request.cookies.get("admin_session");
  if (!session || !(await verifyToken(session.value))) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
