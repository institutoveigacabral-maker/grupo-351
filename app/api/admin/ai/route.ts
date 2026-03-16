import { buildSystemPrompt } from "@/lib/ai-context";
import { aiMessagesSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { createSSEStream } from "@/lib/ai/provider";

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = await rateLimit(`ai:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.success) {
    return new Response(
      JSON.stringify({ error: "Limite de requisições atingido. Aguarde 1 minuto." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await request.json();
  const parsed = aiMessagesSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Dados invalidos" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = parsed.data;
  const systemPrompt = await buildSystemPrompt();

  try {
    const stream = createSSEStream({ messages, systemPrompt });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro de configuração IA";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
