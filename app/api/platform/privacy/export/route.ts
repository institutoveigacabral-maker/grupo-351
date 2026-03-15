import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — Export all user data (RGPD Art. 20 — Direito à portabilidade)
export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      criadoEm: true,
      company: {
        select: {
          nome: true, slug: true, setor: true, pais: true, cidade: true,
          descricao: true, website: true, estagio: true, interesses: true,
          verificada: true, tagline: true, criadoEm: true,
        },
      },
      messages: {
        select: { id: true, conteudo: true, criadoEm: true },
        orderBy: { criadoEm: "desc" },
        take: 500,
      },
      notifications: {
        select: { id: true, tipo: true, titulo: true, mensagem: true, criadoEm: true },
        orderBy: { criadoEm: "desc" },
        take: 200,
      },
      reviewsFeitas: {
        select: { id: true, nota: true, comentario: true, criadoEm: true },
      },
      reviewsRecebidas: {
        select: { id: true, nota: true, comentario: true, criadoEm: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    format: "RGPD Data Export",
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      registeredAt: user.criadoEm,
    },
    company: user.company || null,
    messages: user.messages,
    notifications: user.notifications,
    reviewsGiven: user.reviewsFeitas,
    reviewsReceived: user.reviewsRecebidas,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="grupo351-data-export-${session.id}.json"`,
    },
  });
}
