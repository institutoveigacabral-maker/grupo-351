import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const opportunities = await prisma.opportunity.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      company: { select: { id: true, nome: true, slug: true, logo: true } },
      user: { select: { id: true, nome: true, email: true } },
      _count: { select: { matches: true } },
    },
  });

  const data = opportunities.map((o) => ({
    id: o.id,
    titulo: o.titulo,
    tipo: o.tipo,
    setor: o.setor,
    descricao: o.descricao.substring(0, 200),
    budget: o.budget,
    localizacao: o.localizacao,
    status: o.status,
    destaque: o.destaque,
    criadoEm: o.criadoEm.toISOString(),
    expiraEm: o.expiraEm?.toISOString() || null,
    company: o.company,
    user: o.user,
    _count: o._count,
  }));

  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasPermission(admin.role, "update")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const { id, status, destaque } = body;

  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (destaque !== undefined) data.destaque = destaque;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhum campo válido" }, { status: 400 });
  }

  try {
    const updated = await prisma.opportunity.update({ where: { id }, data });

    await logAudit({
      acao: "update",
      recurso: "opportunity",
      resourceId: id,
      adminId: admin.id,
      adminNome: admin.nome,
      detalhes: data,
    });

    return NextResponse.json({ id: updated.id, status: updated.status, destaque: updated.destaque });
  } catch {
    return NextResponse.json({ error: "Oportunidade não encontrada" }, { status: 404 });
  }
}
