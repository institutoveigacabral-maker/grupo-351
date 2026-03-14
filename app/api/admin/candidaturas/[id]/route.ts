import { NextResponse } from "next/server";
import { getCandidaturaById, updateCandidatura } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const item = await getCandidaturaById(id);
  if (!item) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const updates = await request.json();
  const item = await updateCandidatura(id, updates);
  if (!item) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json(item);
}
