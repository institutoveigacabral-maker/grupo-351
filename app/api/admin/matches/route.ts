import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/rbac";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const matches = await prisma.match.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      opportunity: { select: { id: true, titulo: true, tipo: true, setor: true } },
      fromUser: { select: { id: true, nome: true, email: true, avatar: true } },
      toUser: { select: { id: true, nome: true, email: true, avatar: true } },
      _count: { select: { messages: true } },
    },
  });

  const data = matches.map((m) => ({
    id: m.id,
    status: m.status,
    score: m.score,
    motivo: m.motivo ? m.motivo.substring(0, 150) : null,
    criadoEm: m.criadoEm.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    opportunity: m.opportunity,
    fromUser: m.fromUser,
    toUser: m.toUser,
    _count: m._count,
  }));

  return NextResponse.json(data);
}
