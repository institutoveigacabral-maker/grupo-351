import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamChat } from "@/lib/ai/provider";

// POST — AI sugere titulo, descricao, tags para oportunidade
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
    select: { nome: true, setor: true, pais: true, descricao: true, interesses: true, estagio: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { tipo, contexto } = body;
  if (!tipo) {
    return NextResponse.json({ error: "tipo obrigatório" }, { status: 400 });
  }

  const systemPrompt = `Você é um assistente de criação de oportunidades do Grupo +351.
Com base no perfil da empresa e no tipo de oportunidade, sugira um título atraente, descrição detalhada, requisitos e budget estimado.
Responda APENAS em JSON válido com esta estrutura:
{
  "titulo": "string",
  "descricao": "string (2-3 parágrafos)",
  "requisitos": "string",
  "budget": "string (faixa de valores em EUR)",
  "setor": "string"
}`;

  const userMessage = `Empresa: ${company.nome}
Setor: ${company.setor}
País: ${company.pais}
Estágio: ${company.estagio}
Descrição: ${company.descricao?.slice(0, 500) || "N/A"}
Interesses: ${company.interesses.join(", ") || "N/A"}

Tipo de oportunidade desejada: ${tipo}
${contexto ? `Contexto adicional: ${contexto}` : ""}

Gere a sugestão em português.`;

  try {
    let result = "";
    for await (const chunk of streamChat({
      messages: [{ role: "user", content: userMessage }],
      systemPrompt,
    })) {
      result += chunk;
    }

    // Tentar parsear JSON da resposta
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestion = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ suggestion });
    }

    return NextResponse.json({ suggestion: { titulo: "", descricao: result, requisitos: "", budget: "", setor: company.setor } });
  } catch (err) {
    console.error("[copilot]", err);
    return NextResponse.json({ error: "Erro ao gerar sugestão" }, { status: 500 });
  }
}
