import { NextResponse } from "next/server";
import { verifyCredentials, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const rl = await rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }

    const { email, senha } = parsed.data;
    const result = await verifyCredentials(email, senha);

    if (!result.valid) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
    }

    // Atualizar ultimo login
    const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (admin) {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { ultimoLogin: new Date() },
      }).catch(() => {});

      await logAudit({
        acao: "login",
        recurso: "admin",
        resourceId: admin.id,
        adminId: admin.id,
        adminNome: admin.nome,
      }).catch(() => {});
    }

    const { token, expires } = createSessionToken(result.nome!);
    const res = NextResponse.json({ success: true, nome: result.nome });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
