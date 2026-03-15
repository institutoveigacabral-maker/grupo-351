import { NextResponse } from "next/server";
import { validateApiKey, hasScope } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";

// GET /api/v1/companies — listar empresas (requer companies:read)
export async function GET(request: Request) {
  const ctx = await validateApiKey(request);
  if (!ctx) {
    return NextResponse.json(
      { error: "API key inválida. Use: Authorization: Bearer pk351_xxx" },
      { status: 401 }
    );
  }

  if (!hasScope(ctx, "companies:read")) {
    return NextResponse.json({ error: "Scope 'companies:read' necessário" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const setor = searchParams.get("setor");
  const pais = searchParams.get("pais");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

  const where: Record<string, unknown> = { ativa: true };
  if (setor) where.setor = setor;
  if (pais) where.pais = pais;

  const cacheKey = `v1:companies:${setor || "all"}:${pais || "all"}:${page}:${limit}`;
  const [companies, total] = await cached(
    cacheKey,
    () => Promise.all([
      prisma.company.findMany({
        where,
        select: {
          id: true, slug: true, nome: true, tagline: true, setor: true,
          pais: true, cidade: true, estagio: true, interesses: true,
          verificada: true, criadoEm: true,
        },
        orderBy: { criadoEm: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]),
    180
  );

  return NextResponse.json({
    data: companies,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
