import { NextResponse } from "next/server";
import { validateApiKey, hasScope } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { opportunityCreateSchema } from "@/lib/validations";

// GET /api/v1/opportunities — listar oportunidades (requer opportunities:read)
export async function GET(request: Request) {
  const ctx = await validateApiKey(request);
  if (!ctx) {
    return NextResponse.json(
      { error: "API key inválida. Use: Authorization: Bearer pk351_xxx" },
      { status: 401 }
    );
  }

  if (!hasScope(ctx, "opportunities:read")) {
    return NextResponse.json({ error: "Scope 'opportunities:read' necessário" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const setor = searchParams.get("setor");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

  const where: Record<string, unknown> = { status: "aberta" };
  if (tipo) where.tipo = tipo;
  if (setor) where.setor = setor;

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      select: {
        id: true, titulo: true, tipo: true, setor: true, descricao: true,
        budget: true, localizacao: true, criadoEm: true, expiraEm: true,
        company: { select: { slug: true, nome: true, verificada: true } },
      },
      orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.opportunity.count({ where }),
  ]);

  return NextResponse.json({
    data: opportunities,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/v1/opportunities — criar oportunidade (requer opportunities:write)
export async function POST(request: Request) {
  const ctx = await validateApiKey(request);
  if (!ctx) {
    return NextResponse.json({ error: "API key inválida" }, { status: 401 });
  }

  if (!hasScope(ctx, "opportunities:write")) {
    return NextResponse.json({ error: "Scope 'opportunities:write' necessário" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({ where: { ownerId: ctx.userId } });
  if (!company) {
    return NextResponse.json({ error: "Nenhuma empresa associada a esta API key" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = opportunityCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      ...parsed.data,
      companyId: company.id,
      userId: ctx.userId,
    },
  });

  return NextResponse.json({ data: opportunity }, { status: 201 });
}
