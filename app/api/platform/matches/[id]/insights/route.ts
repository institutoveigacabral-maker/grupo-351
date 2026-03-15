import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSSEStream } from "@/lib/ai/provider";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return new Response("Não autorizado", { status: 401 });

  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      opportunity: {
        select: { titulo: true, tipo: true, setor: true, descricao: true, requisitos: true, budget: true },
      },
      fromUser: {
        select: {
          nome: true,
          company: { select: { nome: true, setor: true, pais: true, estagio: true, descricao: true, interesses: true } },
        },
      },
      toUser: {
        select: {
          nome: true,
          company: { select: { nome: true, setor: true, pais: true, estagio: true, descricao: true, interesses: true } },
        },
      },
    },
  });

  if (!match || (match.fromUserId !== session.id && match.toUserId !== session.id)) {
    return new Response("Match não encontrado ou sem permissão", { status: 404 });
  }

  const opp = match.opportunity;
  const fromCompany = match.fromUser.company;
  const toCompany = match.toUser.company;

  const systemPrompt = `Você é um analista de negócios do Grupo +351, uma plataforma de matchmaking empresarial em Portugal.
Analise o match entre duas empresas e forneça insights estratégicos.
Responda em português de Portugal. Seja conciso e prático.
Use formatação markdown: ## para seções, **bold** para destaque, - para listas.`;

  const userMessage = `Analise este match e forneça:
1. **Compatibilidade** — score estimado e justificação
2. **Sinergias** — pontos fortes da parceria
3. **Riscos** — potenciais desafios
4. **Próximos passos** — sugestões de abordagem

**Oportunidade:** ${opp.titulo} (${opp.tipo})
Setor: ${opp.setor}
Descrição: ${opp.descricao?.slice(0, 500)}
${opp.requisitos ? `Requisitos: ${opp.requisitos.slice(0, 300)}` : ""}
${opp.budget ? `Budget: ${opp.budget}` : ""}

**Empresa A (${match.fromUser.nome}):** ${fromCompany?.nome || "N/A"}
Setor: ${fromCompany?.setor || "N/A"}, País: ${fromCompany?.pais || "N/A"}, Estágio: ${fromCompany?.estagio || "N/A"}
${fromCompany?.descricao?.slice(0, 300) || ""}

**Empresa B (${match.toUser.nome}):** ${toCompany?.nome || "N/A"}
Setor: ${toCompany?.setor || "N/A"}, País: ${toCompany?.pais || "N/A"}, Estágio: ${toCompany?.estagio || "N/A"}
${toCompany?.descricao?.slice(0, 300) || ""}

Score do match: ${match.score || "N/A"}
${match.motivo ? `Motivo IA: ${match.motivo}` : ""}`;

  const stream = createSSEStream({
    messages: [{ role: "user", content: userMessage }],
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
