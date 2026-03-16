import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { opportunityCreateSchema } from "@/lib/validations";
import { getCompanyLimits, formatLimitMessage } from "@/lib/plan-gates";
import { ok, created, badRequest, unauthorized, forbidden } from "@/lib/api-response";
import { cached, invalidatePrefix, CACHE_KEYS } from "@/lib/cache";

// GET — listar oportunidades (público) — cached 120s
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const setor = searchParams.get("setor");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

  const cacheKey = CACHE_KEYS.publicOpportunities(`${tipo}:${setor}:${page}:${limit}`);

  const result = await cached(cacheKey, async () => {
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

    return {
      opportunities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }, 120);

  return ok(result);
}

// POST — criar oportunidade (requer auth + empresa)
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  const company = await prisma.company.findUnique({ where: { ownerId: session.id } });
  if (!company) return forbidden("Crie uma empresa antes de publicar oportunidades");

  // Plan gate: verificar limite de oportunidades
  const limits = await getCompanyLimits(company.id);
  if (!limits.oportunidades.canCreate) {
    return forbidden(
      formatLimitMessage("oportunidades", limits.oportunidades.max),
      { upgrade: true },
    );
  }

  let body;
  try { body = await request.json(); } catch {
    return badRequest("JSON invalido");
  }
  const parsed = opportunityCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest();

  const opportunity = await prisma.opportunity.create({
    data: {
      ...parsed.data,
      expiraEm: parsed.data.expiraEm ? new Date(parsed.data.expiraEm) : null,
      companyId: company.id,
      userId: session.id,
    },
  });

  await invalidatePrefix("public:opportunities:");

  return created(opportunity);
}
