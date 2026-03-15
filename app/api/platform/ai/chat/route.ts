import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSSEStream } from "@/lib/ai/provider";
import { z } from "zod";

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(10000),
  })).min(1),
});

export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return new Response("Não autorizado", { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Dados inválidos", { status: 400 });
  }

  // Buscar contexto da empresa do user
  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
    select: {
      nome: true, setor: true, pais: true, descricao: true, estagio: true,
      _count: { select: { opportunities: true, members: true } },
    },
  });

  const [matchCount, messageCount] = await Promise.all([
    prisma.match.count({ where: { OR: [{ fromUserId: session.id }, { toUserId: session.id }] } }),
    prisma.message.count({ where: { userId: session.id } }),
  ]);

  const companyContext = company
    ? `A empresa do utilizador é "${company.nome}" (${company.setor}, ${company.pais}, estágio: ${company.estagio}). Tem ${company._count.opportunities} oportunidades e ${company._count.members} membros. ${matchCount} matches ativos. ${messageCount} mensagens enviadas.`
    : "O utilizador ainda não criou uma empresa na plataforma.";

  const systemPrompt = `Você é o assistente IA do Grupo +351, uma plataforma de matchmaking empresarial em Portugal.
Ajude o utilizador com questões sobre a plataforma, sua empresa, oportunidades, matches e negócios.

Contexto do utilizador:
- Nome: ${session.nome}
- ${companyContext}

Regras:
- Responda em português
- Seja conciso e prático
- Se não souber algo específico sobre a plataforma, diga que pode ajudar com informações gerais
- Use markdown para formatação quando relevante`;

  const stream = createSSEStream({
    messages: parsed.data.messages,
    systemPrompt,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
