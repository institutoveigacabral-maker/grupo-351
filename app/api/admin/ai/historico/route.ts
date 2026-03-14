import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const conversas = await prisma.aiConversa.findMany({
    orderBy: { criadoEm: "desc" },
    select: {
      id: true,
      titulo: true,
      resumo: true,
      criadoEm: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(conversas);
}

export async function POST(request: Request) {
  const { titulo, resumo, mensagens } = await request.json();
  if (!titulo || !mensagens) {
    return NextResponse.json({ error: "titulo e mensagens obrigatórios" }, { status: 400 });
  }
  const conversa = await prisma.aiConversa.create({
    data: { titulo, resumo: resumo || "", mensagens },
  });
  return NextResponse.json(conversa, { status: 201 });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  try {
    await prisma.aiConversa.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }
}
