/**
 * Camada de abstração para provedores de IA.
 *
 * Configuração via .env:
 *   AI_PROVIDER=gemini|anthropic  (default: gemini)
 *   GOOGLE_API_KEY=xxx            (para gemini)
 *   ANTHROPIC_API_KEY=xxx         (para anthropic)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

export type AiProvider = "gemini" | "anthropic";

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiStreamOptions {
  messages: AiMessage[];
  systemPrompt: string;
  provider?: AiProvider;
}

function getProvider(): AiProvider {
  const env = process.env.AI_PROVIDER?.toLowerCase();
  if (env === "anthropic") return "anthropic";
  return "gemini";
}

async function* streamGemini(messages: AiMessage[], systemPrompt: string): AsyncGenerator<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY não configurada");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1].content;

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

async function* streamAnthropic(
  messages: AiMessage[],
  systemPrompt: string
): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");

  const client = new Anthropic({ apiKey });

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

/**
 * Retorna um AsyncGenerator que emite chunks de texto.
 * Escolhe o provider baseado em AI_PROVIDER ou no parâmetro.
 */
export async function* streamChat(options: AiStreamOptions): AsyncGenerator<string> {
  const provider = options.provider || getProvider();

  if (provider === "anthropic") {
    yield* streamAnthropic(options.messages, options.systemPrompt);
  } else {
    yield* streamGemini(options.messages, options.systemPrompt);
  }
}

/**
 * Cria um ReadableStream SSE a partir do chat stream.
 * Uso direto em route handlers.
 */
export function createSSEStream(options: AiStreamOptions): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const text of streamChat(options)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.close();
      }
    },
  });
}
