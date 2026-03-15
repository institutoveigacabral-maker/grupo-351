import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      opportunity: {
        include: { company: { select: { id: true, nome: true, slug: true } } },
      },
      fromUser: { select: { id: true, nome: true, email: true, avatar: true } },
      toUser: { select: { id: true, nome: true, email: true, avatar: true } },
      messages: {
        orderBy: { criadoEm: "asc" },
        include: { user: { select: { id: true, nome: true, avatar: true } } },
      },
      project: { select: { id: true, nome: true, status: true } },
    },
  });

  if (!match) return NextResponse.json({ error: "Match não encontrado" }, { status: 404 });

  return NextResponse.json({
    ...match,
    criadoEm: match.criadoEm.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasPermission(admin.role, "update")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, boolean> = { status: true };
  const data: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(body)) {
    if (allowed[key]) data[key] = val;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhum campo válido" }, { status: 400 });
  }

  try {
    const updated = await prisma.match.update({ where: { id }, data });

    await logAudit({
      acao: "update",
      recurso: "match",
      resourceId: id,
      adminId: admin.id,
      adminNome: admin.nome,
      detalhes: data,
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch {
    return NextResponse.json({ error: "Match não encontrado" }, { status: 404 });
  }
}
