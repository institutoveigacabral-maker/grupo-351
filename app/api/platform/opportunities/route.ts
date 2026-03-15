import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { opportunityCreateSchema } from "@/lib/validations";

// GET — listar oportunidades (público)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const setor = searchParams.get("setor");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

  const where: Record<string, unknown> = { status: "aberta" };
  if (tipo) where.tipo = tipo;
  if (setor) where.setor = setor;

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      select: {
        id: true,
        titulo: true,
        tipo: true,
        setor: true,
        descricao: true,
        budget: true,
        localizacao: true,
        criadoEm: true,
        expiraEm: true,
        company: {
          select: { slug: true, nome: true, logo: true, verificada: true },
        },
      },
      orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.opportunity.count({ where }),
  ]);

  return NextResponse.json({
    opportunities,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST — criar oportunidade (requer auth + empresa)
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({ where: { ownerId: session.id } });
  if (!company) {
    return NextResponse.json({ error: "Crie uma empresa antes de publicar oportunidades" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = opportunityCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      ...parsed.data,
      expiraEm: parsed.data.expiraEm ? new Date(parsed.data.expiraEm) : null,
      companyId: company.id,
      userId: session.id,
    },
  });

  return NextResponse.json(opportunity, { status: 201 });
}
