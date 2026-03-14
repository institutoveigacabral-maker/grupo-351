import { NextResponse } from "next/server";
import { getArtigosDb, addArtigo, updateArtigo, deleteArtigo } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await getArtigosDb());
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.slug || !data.titulo) {
      return NextResponse.json({ error: "Slug e título são obrigatórios" }, { status: 400 });
    }
    const item = await addArtigo(data);
    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const { slug, ...updates } = await request.json();
  if (!slug) return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });
  const item = await updateArtigo(slug, updates);
  if (!item) return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const { slug } = await request.json();
  if (!slug) return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });
  const deleted = await deleteArtigo(slug);
  if (!deleted) return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  return NextResponse.json({ success: true });
}
