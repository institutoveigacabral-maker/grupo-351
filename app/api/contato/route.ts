import { NextResponse } from "next/server";
import { addCandidatura, addContato } from "@/lib/db";
import { notify } from "@/lib/notify";
import { candidaturaCreateSchema, contatoCreateSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const rl = rateLimit(`contato:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
    }

    const body = await request.json();

    // Candidatura JV (vem do /aplicar)
    if (body.tipo === "aplicacao-jv") {
      const parsed = candidaturaCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Campos obrigatórios faltando", details: parsed.error.flatten() }, { status: 400 });
      }

      const {
        nome, email, telefone, pais, cidade, perfil,
        experiencia, setor, empresaAtual, linkedin,
        modelo, capitalDisponivel, prazo, dedicacao,
        motivacao, diferenciais, disponibilidade, aceitaNDA,
      } = parsed.data;

      await addCandidatura({
        nome, email, telefone, pais, cidade, perfil,
        experiencia, setor, empresaAtual, linkedin,
        modelo: modelo || [],
        capitalDisponivel, prazo, dedicacao,
        motivacao, diferenciais, disponibilidade,
        aceitaNDA: aceitaNDA || false,
      });

      await notify({
        tipo: "candidatura",
        nome,
        email,
        resumo: `Perfil: ${perfil} | Marcas: ${(modelo || []).join(", ")} | Capital: ${capitalDisponivel}`,
      });

      return NextResponse.json({ success: true });
    }

    // Contato genérico (vem do /contato)
    const parsed = contatoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Campos obrigatórios faltando", details: parsed.error.flatten() }, { status: 400 });
    }

    const { nome, email, empresa, tipo, orcamento, mensagem } = parsed.data;

    await addContato({ nome, email, empresa, tipo, orcamento, mensagem });

    await notify({
      tipo: "contato",
      nome,
      email,
      resumo: `Tipo: ${tipo} | ${mensagem.slice(0, 100)}${mensagem.length > 100 ? "..." : ""}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
