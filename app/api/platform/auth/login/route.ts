import { NextResponse } from "next/server";
import { verifyUserCredentials, createUserSessionToken, USER_COOKIE } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = rateLimit(`platform-login:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { email, senha } = parsed.data;
  const result = await verifyUserCredentials(email, senha);

  if (!result.valid || !result.user) {
    return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
  }

  const { token, expires } = createUserSessionToken(result.user);

  const res = NextResponse.json({
    success: true,
    user: result.user,
  });

  res.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  return res;
}
