import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUserNotification } from "@/lib/user-notifications";
import { cached, invalidate, CACHE_KEYS } from "@/lib/cache";
import { z } from "zod";

const reviewSchema = z.object({
  projetoId: z.string().min(1),
  avaliadoId: z.string().min(1),
  nota: z.number().int().min(1).max(5),
  comentario: z.string().max(2000).optional(),
});

// GET — reviews de um user (por query param userId)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
  }

  const cacheKey = CACHE_KEYS.userReviews(userId);

  const result = await cached(cacheKey, async () => {
    const reviews = await prisma.review.findMany({
      where: { avaliadoId: userId },
      include: {
        autor: { select: { id: true, nome: true } },
        projeto: { select: { id: true, nome: true } },
      },
      orderBy: { criadoEm: "desc" },
    });

    const avg = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.nota, 0) / reviews.length
      : 0;

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        nota: r.nota,
        comentario: r.comentario,
        autor: r.autor,
        projeto: r.projeto,
        criadoEm: r.criadoEm.toISOString(),
      })),
      media: Math.round(avg * 10) / 10,
      total: reviews.length,
    };
  }, 120);

  return NextResponse.json(result);
}

// POST — criar review (1 por projeto por autor)
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  const { projetoId, avaliadoId, nota, comentario } = parsed.data;

  // Nao pode avaliar a si mesmo
  if (avaliadoId === session.id) {
    return NextResponse.json({ error: "Não pode avaliar a si mesmo" }, { status: 400 });
  }

  // Verificar que o projeto existe e esta concluido
  const projeto = await prisma.platformProject.findUnique({
    where: { id: projetoId },
    include: { members: true },
  });

  if (!projeto) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  }

  if (projeto.status !== "concluido") {
    return NextResponse.json({ error: "Só é possível avaliar projetos concluídos" }, { status: 400 });
  }

  // Verificar que ambos participam do projeto (via match)
  const match = await prisma.match.findUnique({ where: { id: projeto.matchId } });
  if (!match) {
    return NextResponse.json({ error: "Match não encontrado" }, { status: 404 });
  }

  const participants = [match.fromUserId, match.toUserId];
  if (!participants.includes(session.id) || !participants.includes(avaliadoId)) {
    return NextResponse.json({ error: "Ambos devem participar do projeto" }, { status: 403 });
  }

  // Criar review (unique constraint: projetoId + autorId)
  try {
    const review = await prisma.review.create({
      data: {
        projetoId,
        autorId: session.id,
        avaliadoId,
        nota,
        comentario: comentario || null,
      },
    });

    await invalidate(CACHE_KEYS.userReviews(avaliadoId));

    // Notificar o avaliado
    createUserNotification({
      userId: avaliadoId,
      tipo: "review",
      titulo: `Nova avaliação de ${session.nome}`,
      mensagem: `Recebeu ${nota} estrela(s) no projeto ${projeto.nome}`,
      link: "/dashboard/projetos",
    });

    return NextResponse.json({ id: review.id, nota: review.nota }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "Já avaliou este projeto" }, { status: 409 });
    }
    throw err;
  }
}
