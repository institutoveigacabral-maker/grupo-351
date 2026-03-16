import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { companyCreateSchema } from "@/lib/validations";
import { cached, invalidatePrefix, CACHE_KEYS } from "@/lib/cache";

// GET — listar empresas (público ou filtrado) — cached 120s
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const setor = searchParams.get("setor");
  const pais = searchParams.get("pais");
  const interesse = searchParams.get("interesse");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

  const cacheKey = CACHE_KEYS.publicCompanies(`${setor}:${pais}:${interesse}:${page}:${limit}`);

  const result = await cached(cacheKey, async () => {
    const where: Record<string, unknown> = { ativa: true };
    if (setor) where.setor = setor;
    if (pais) where.pais = pais;
    if (interesse) where.interesses = { has: interesse };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        select: {
          id: true,
          slug: true,
          nome: true,
          tagline: true,
          setor: true,
          pais: true,
          cidade: true,
          estagio: true,
          interesses: true,
          logo: true,
          verificada: true,
        },
        orderBy: { criadoEm: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);

    return {
      companies,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }, 120);

  return NextResponse.json(result);
}

// POST — criar empresa (requer auth)
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Verificar se já tem empresa
  const existing = await prisma.company.findUnique({ where: { ownerId: session.id } });
  if (existing) {
    return NextResponse.json({ error: "Você já possui uma empresa cadastrada", existingSlug: existing.slug }, { status: 409 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = companyCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  // Criar com tratamento de constraints unicas (race condition)
  try {
    const company = await prisma.company.create({
      data: {
        ...parsed.data,
        ownerId: session.id,
        members: {
          create: { userId: session.id, role: "dono" },
        },
      },
    });

    await invalidatePrefix("public:companies:");

    return NextResponse.json(company, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "Slug ou proprietário já em uso" }, { status: 409 });
    }
    throw err;
  }
}
