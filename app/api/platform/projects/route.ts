import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — meus projetos
export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({ where: { ownerId: session.id } });
  if (!company) {
    return NextResponse.json([]);
  }

  const projects = await prisma.platformProject.findMany({
    where: {
      members: { some: { companyId: company.id } },
    },
    include: {
      match: {
        include: {
          opportunity: { select: { titulo: true, tipo: true } },
          fromUser: { select: { nome: true } },
          toUser: { select: { nome: true } },
        },
      },
      members: {
        include: {
          company: { select: { nome: true, slug: true } },
        },
      },
      tasks: {
        orderBy: { criadoEm: "desc" },
        take: 10,
      },
    },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(projects);
}

// POST — criar projeto a partir de um match aceito
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { matchId, nome, descricao } = body;

  if (!matchId || !nome) {
    return NextResponse.json({ error: "matchId e nome obrigatórios" }, { status: 400 });
  }

  // Verificar match
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      opportunity: { select: { companyId: true } },
      fromUser: { select: { id: true } },
      toUser: { select: { id: true } },
    },
  });

  if (!match || match.status !== "aceito") {
    return NextResponse.json({ error: "Match não encontrado ou não aceito" }, { status: 400 });
  }

  // Verificar se o usuário faz parte do match
  if (match.fromUserId !== session.id && match.toUserId !== session.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // Buscar companies de ambas as partes
  const [fromCompany, toCompany] = await Promise.all([
    prisma.company.findUnique({ where: { ownerId: match.fromUserId } }),
    prisma.company.findUnique({ where: { ownerId: match.toUserId } }),
  ]);

  // Criar projeto com membros
  const project = await prisma.platformProject.create({
    data: {
      nome,
      descricao: descricao || null,
      matchId,
      members: {
        create: [
          ...(fromCompany ? [{ companyId: fromCompany.id, role: "lider" }] : []),
          ...(toCompany ? [{ companyId: toCompany.id, role: "membro" }] : []),
        ],
      },
    },
  });

  // Atualizar status do match
  await prisma.match.update({
    where: { id: matchId },
    data: { status: "fechado" },
  });

  return NextResponse.json(project, { status: 201 });
}
