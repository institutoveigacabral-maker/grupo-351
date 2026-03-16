import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-auth";
import { getCompanyPlan } from "@/lib/stripe";
import { logPlatformAudit } from "@/lib/audit";
import { cached, invalidate, CACHE_KEYS } from "@/lib/cache";

// GET — minhas API keys
export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const cacheKey = CACHE_KEYS.apiKeys(session.id);

  const masked = await cached(cacheKey, async () => {
    const keys = await prisma.apiKey.findMany({
      where: { userId: session.id },
      select: {
        id: true,
        key: true,
        nome: true,
        scopes: true,
        ativa: true,
        ultimoUso: true,
        criadoEm: true,
      },
      orderBy: { criadoEm: "desc" },
    });

    return keys.map((k) => ({
      ...k,
      key: k.key.slice(0, 12) + "..." + k.key.slice(-4),
    }));
  }, 300);

  return NextResponse.json(masked);
}

// POST — criar API key
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Verificar se tem empresa e plano enterprise
  const company = await prisma.company.findUnique({ where: { ownerId: session.id } });
  if (!company) {
    return NextResponse.json({ error: "Necessário ter uma empresa cadastrada para criar API keys" }, { status: 403 });
  }
  const plan = await getCompanyPlan(company.id);
  if (!plan.limites.apiAccess) {
    return NextResponse.json({ error: "Acesso à API requer plano Enterprise" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { nome, scopes } = body;

  if (!nome) {
    return NextResponse.json({ error: "nome obrigatório" }, { status: 400 });
  }

  const validScopes = ["companies:read", "opportunities:read", "opportunities:write", "matches:read"];
  const filteredScopes = (scopes || ["companies:read", "opportunities:read"]).filter(
    (s: string) => validScopes.includes(s)
  );

  const key = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      key,
      nome,
      scopes: filteredScopes,
      userId: session.id,
    },
  });

  await logPlatformAudit({
    acao: "CREATE_API_KEY",
    recurso: "api_key",
    resourceId: apiKey.id,
    userId: session.id,
    userNome: session.nome || "unknown",
    detalhes: { nome, scopes: filteredScopes },
  });

  await invalidate(CACHE_KEYS.apiKeys(session.id));

  // Retornar key completa apenas na criação
  return NextResponse.json({
    id: apiKey.id,
    key: apiKey.key, // IMPORTANTE: visível apenas aqui
    nome: apiKey.nome,
    scopes: apiKey.scopes,
  }, { status: 201 });
}

// DELETE — revogar API key
export async function DELETE(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const key = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!key || key.userId !== session.id) {
    return NextResponse.json({ error: "Chave não encontrada" }, { status: 404 });
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { ativa: false },
  });

  await logPlatformAudit({
    acao: "REVOKE_API_KEY",
    recurso: "api_key",
    resourceId: keyId,
    userId: session.id,
    userNome: session.nome || "unknown",
    detalhes: { keyNome: key.nome },
  });

  await invalidate(CACHE_KEYS.apiKeys(session.id));

  return NextResponse.json({ success: true });
}
