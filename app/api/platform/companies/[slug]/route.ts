import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { companyUpdateSchema } from "@/lib/validations";

// GET — perfil público da empresa
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug, ativa: true },
    select: {
      id: true,
      slug: true,
      nome: true,
      tagline: true,
      descricao: true,
      setor: true,
      pais: true,
      cidade: true,
      website: true,
      linkedin: true,
      logo: true,
      estagio: true,
      interesses: true,
      verificada: true,
      criadoEm: true,
      opportunities: {
        where: { status: "aberta" },
        select: { id: true, titulo: true, tipo: true, setor: true, budget: true, criadoEm: true },
        orderBy: { criadoEm: "desc" },
        take: 10,
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  return NextResponse.json(company);
}

// PATCH — atualizar empresa (apenas dono)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }
  if (company.ownerId !== session.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = companyUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.company.update({
    where: { slug },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
