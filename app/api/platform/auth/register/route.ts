import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createUserSessionToken, USER_COOKIE } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email";
import { createAdminNotification } from "@/lib/admin-notifications";

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = await rateLimit(`register:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  const { nome, email, senha, role } = parsed.data;
  const senhaHash = await hashPassword(senha);

  // Criar com tratamento de constraint unica (race condition)
  let user;
  try {
    user = await prisma.user.create({
      data: {
        nome,
        email: email.toLowerCase(),
        senhaHash,
        role,
      },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "Email já registrado" }, { status: 409 });
    }
    throw err;
  }

  // Email de boas-vindas + notificação admin (fire-and-forget)
  sendWelcomeEmail({ nome: user.nome, email: user.email });
  createAdminNotification({
    tipo: "new-user",
    titulo: `Novo utilizador: ${user.nome}`,
    mensagem: `${user.nome} (${user.email}) registou-se na plataforma.`,
    link: "/admin/usuarios",
  });

  const { token, expires } = createUserSessionToken({ id: user.id, nome: user.nome, role: user.role });

  const res = NextResponse.json({
    success: true,
    user: { id: user.id, nome: user.nome, role: user.role, email: user.email },
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
