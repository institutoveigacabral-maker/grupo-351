import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cached, invalidate, CACHE_KEYS } from "@/lib/cache";

// GET — meus matches (recebidos + enviados)
export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const matches = await cached(
    CACHE_KEYS.matches(session.id),
    () => prisma.match.findMany({
      where: {
        OR: [{ fromUserId: session.id }, { toUserId: session.id }],
      },
      select: {
        id: true,
        status: true,
        score: true,
        motivo: true,
        criadoEm: true,
        opportunity: {
          select: { id: true, titulo: true, tipo: true },
        },
        fromUser: {
          select: { id: true, nome: true },
        },
        toUser: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { criadoEm: "desc" },
    }),
    120
  );

  return NextResponse.json(matches);
}

// POST — responder a match (aceitar/recusar)
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { matchId, action } = body;

  if (!matchId || !["aceitar", "recusar"].includes(action)) {
    return NextResponse.json({ error: "matchId e action (aceitar|recusar) obrigatórios" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Match não encontrado" }, { status: 404 });
  }

  // Apenas o destinatário pode responder
  if (match.toUserId !== session.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // Só pode responder se status for "sugerido"
  if (match.status !== "sugerido") {
    return NextResponse.json({ error: "Este match já foi respondido" }, { status: 409 });
  }

  const newStatus = action === "aceitar" ? "aceito" : "recusado";

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { status: newStatus },
  });

  // Invalidate cache for both parties
  await invalidate(
    CACHE_KEYS.matches(match.fromUserId),
    CACHE_KEYS.matches(match.toUserId)
  );

  return NextResponse.json(updated);
}
