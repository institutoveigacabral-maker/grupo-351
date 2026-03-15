import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTeamInviteEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "membro"]).default("membro"),
});

// GET — listar membros da equipe + convites pendentes
export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
    include: {
      members: {
        include: { user: { select: { id: true, nome: true, email: true, avatar: true, ultimoLogin: true } } },
        orderBy: { criadoEm: "asc" },
      },
      teamInvites: {
        where: { aceito: false, expiraEm: { gt: new Date() } },
        orderBy: { criadoEm: "desc" },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    members: company.members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      nome: m.user.nome,
      email: m.user.email,
      avatar: m.user.avatar,
      role: m.role,
      ultimoLogin: m.user.ultimoLogin,
      criadoEm: m.criadoEm,
    })),
    invites: company.teamInvites.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      criadoEm: i.criadoEm,
      expiraEm: i.expiraEm,
    })),
    ownerId: company.ownerId,
  });
}

// POST — enviar convite para novo membro
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
    include: {
      members: true,
      subscription: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Apenas o dono da empresa pode convidar membros" }, { status: 403 });
  }

  // Verificar se o membro atual é owner ou admin
  const isOwner = company.ownerId === session.id;
  if (!isOwner) {
    const membership = company.members.find((m) => m.userId === session.id);
    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão para convidar membros" }, { status: 403 });
    }
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, role } = parsed.data;

  // Verificar limite de membros do plano
  const plano = company.subscription?.plano || "free";
  const limites: Record<string, number> = { free: 1, growth: 5, enterprise: -1 };
  const maxMembros = limites[plano] ?? 1;
  if (maxMembros > 0 && company.members.length >= maxMembros) {
    return NextResponse.json({
      error: `O plano ${plano} permite no máximo ${maxMembros} membro(s). Faça upgrade para adicionar mais.`,
    }, { status: 403 });
  }

  // Verificar se já é membro
  const existingMember = await prisma.companyMember.findFirst({
    where: { companyId: company.id, user: { email: email.toLowerCase() } },
  });
  if (existingMember) {
    return NextResponse.json({ error: "Este email já é membro da equipe" }, { status: 409 });
  }

  // Verificar se já tem convite pendente
  const existingInvite = await prisma.teamInvite.findFirst({
    where: { empresaId: company.id, email: email.toLowerCase(), aceito: false, expiraEm: { gt: new Date() } },
  });
  if (existingInvite) {
    return NextResponse.json({ error: "Já existe um convite pendente para este email" }, { status: 409 });
  }

  // Criar convite
  const token = crypto.randomBytes(32).toString("hex");
  const invite = await prisma.teamInvite.create({
    data: {
      email: email.toLowerCase(),
      role,
      token,
      empresaId: company.id,
      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    },
  });

  // Enviar email
  await sendTeamInviteEmail({
    to: email,
    empresaNome: company.nome,
    convidadoPor: session.nome,
    role,
    token,
  });

  return NextResponse.json({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    expiraEm: invite.expiraEm,
  }, { status: 201 });
}
