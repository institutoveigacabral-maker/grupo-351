import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { suggestOpportunitiesForCompany, runMatchmaking } from "@/lib/ai/matching";

// GET — sugestões de oportunidades para minha empresa
export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({ where: { ownerId: session.id } });
  if (!company) {
    return NextResponse.json({ error: "Crie uma empresa primeiro" }, { status: 403 });
  }

  const suggestions = await suggestOpportunitiesForCompany(company.id, { limit: 15 });
  return NextResponse.json(suggestions);
}

// POST — executar matchmaking para uma oportunidade minha
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { opportunityId, useAI } = body;

  if (!opportunityId) {
    return NextResponse.json({ error: "opportunityId obrigatório" }, { status: 400 });
  }

  // Verificar se a oportunidade pertence ao usuário
  const opp = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opp || opp.userId !== session.id) {
    return NextResponse.json({ error: "Oportunidade não encontrada ou sem permissão" }, { status: 403 });
  }

  const created = await runMatchmaking(opportunityId, {
    limit: 10,
    useAI: useAI === true,
    fromUserId: session.id,
  });

  return NextResponse.json({ matchesCreated: created });
}
