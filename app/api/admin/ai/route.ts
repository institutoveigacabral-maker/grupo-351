import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/ai-context";
import { aiMessagesSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

const client = new Anthropic();

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = rateLimit(`ai:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.success) {
    return new Response(
      JSON.stringify({ error: "Limite de requisições atingido. Aguarde 1 minuto." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY não configurada no .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await request.json();
  const parsed = aiMessagesSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Dados inválidos", details: parsed.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = parsed.data;
  const systemPrompt = await buildSystemPrompt();

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
