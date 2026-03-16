import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const documentSchema = z.object({
  tipo: z.enum(["nif", "certidao", "contrato", "outro"]),
  nome: z.string().min(1).max(300),
  url: z.string().url(),
});

// GET — listar documentos da empresa + status de verificacao
export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
    include: {
      documents: { orderBy: { criadoEm: "desc" } },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    verificada: company.verificada,
    documents: company.documents.map((d) => ({
      id: d.id,
      tipo: d.tipo,
      nome: d.nome,
      url: d.url,
      status: d.status,
      criadoEm: d.criadoEm.toISOString(),
    })),
  });
}

// POST — submeter documento para verificacao
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const company = await prisma.company.findUnique({ where: { ownerId: session.id } });
  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  const doc = await prisma.document.create({
    data: {
      ...parsed.data,
      empresaId: company.id,
    },
  });

  return NextResponse.json({
    id: doc.id,
    tipo: doc.tipo,
    nome: doc.nome,
    status: doc.status,
  }, { status: 201 });
}
