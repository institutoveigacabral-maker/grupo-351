import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const acceptSchema = z.object({
  token: z.string().min(1),
});

// POST — aceitar convite de equipe
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { token: parsed.data.token },
    include: { empresa: { select: { id: true, nome: true } } },
  });

  if (!invite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  if (invite.aceito) {
    return NextResponse.json({ error: "Este convite já foi aceito" }, { status: 409 });
  }

  if (invite.expiraEm < new Date()) {
    return NextResponse.json({ error: "Este convite expirou" }, { status: 410 });
  }

  // Verificar se o email do user bate com o convite
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json({ error: "Este convite foi enviado para outro email" }, { status: 403 });
  }

  // Verificar se já é membro
  const existingMember = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.id, companyId: invite.empresaId } },
  });
  if (existingMember) {
    // Marcar convite como aceito e retornar
    await prisma.teamInvite.update({ where: { id: invite.id }, data: { aceito: true } });
    return NextResponse.json({ message: "Já é membro desta equipe", companySlug: invite.empresa.nome });
  }

  // Criar membership e marcar convite como aceito
  await prisma.$transaction([
    prisma.companyMember.create({
      data: {
        userId: session.id,
        companyId: invite.empresaId,
        role: invite.role,
      },
    }),
    prisma.teamInvite.update({
      where: { id: invite.id },
      data: { aceito: true },
    }),
  ]);

  return NextResponse.json({
    message: `Entrou na equipe de ${invite.empresa.nome}`,
    companyName: invite.empresa.nome,
  });
}
