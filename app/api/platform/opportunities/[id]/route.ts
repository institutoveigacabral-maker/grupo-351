import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { opportunityUpdateSchema } from "@/lib/validations";

// GET — detalhe de uma oportunidade
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const opp = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      company: {
        select: { id: true, slug: true, nome: true, logo: true, verificada: true, setor: true, pais: true },
      },
      _count: { select: { matches: true } },
    },
  });

  if (!opp) {
    return NextResponse.json({ error: "Oportunidade não encontrada" }, { status: 404 });
  }

  return NextResponse.json(opp);
}

// PUT — editar oportunidade (apenas dono)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const opp = await prisma.opportunity.findUnique({ where: { id } });
  if (!opp) return NextResponse.json({ error: "Oportunidade não encontrada" }, { status: 404 });
  if (opp.userId !== session.id) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = opportunityUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.expiraEm) data.expiraEm = new Date(data.expiraEm as string);

  const updated = await prisma.opportunity.update({
    where: { id },
    data: data as never,
  });

  return NextResponse.json(updated);
}

// DELETE — remover oportunidade (apenas dono, soft: muda status para cancelada)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const opp = await prisma.opportunity.findUnique({ where: { id } });
  if (!opp) return NextResponse.json({ error: "Oportunidade não encontrada" }, { status: 404 });
  if (opp.userId !== session.id) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  await prisma.opportunity.update({
    where: { id },
    data: { status: "cancelada" },
  });

  return NextResponse.json({ message: "Oportunidade cancelada" });
}
