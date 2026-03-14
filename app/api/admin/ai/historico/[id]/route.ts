import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const conversa = await prisma.aiConversa.findUnique({ where: { id } });
  if (!conversa) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json(conversa);
}
