import { NextResponse } from "next/server";
import { getProjetos, addProjeto, updateProjeto, deleteProjeto } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await getProjetos());
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.slug || !data.name) {
      return NextResponse.json({ error: "Slug e nome são obrigatórios" }, { status: 400 });
    }
    const item = await addProjeto(data);
    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const { slug, ...updates } = await request.json();
  if (!slug) return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });
  const item = await updateProjeto(slug, updates);
  if (!item) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const { slug } = await request.json();
  if (!slug) return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });
  const deleted = await deleteProjeto(slug);
  if (!deleted) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  return NextResponse.json({ success: true });
}
