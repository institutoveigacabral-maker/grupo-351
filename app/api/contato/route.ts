import { NextResponse } from "next/server";
import { addCandidatura, addContato } from "@/lib/db";
import { notify } from "@/lib/notify";
import { sendContatoEmails, sendCandidaturaEmails } from "@/lib/email";
import { scoreCandidatura } from "@/lib/scoring";
import { crmSyncContact, crmSyncDeal } from "@/lib/crm";
import { candidaturaCreateSchema, contatoCreateSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

function capitalToNumber(capital: string): number {
  if (capital.includes("250k") || capital.includes("acima")) return 250000;
  if (capital.includes("100k")) return 100000;
  if (capital.includes("50k")) return 50000;
  if (capital.includes("30k")) return 30000;
  if (capital.includes("10k")) return 10000;
  return 0;
}

function orcamentoToNumber(orc?: string): number {
  if (!orc) return 0;
  if (orc.includes("200k")) return 200000;
  if (orc.includes("50k")) return 50000;
  if (orc.includes("10k")) return 10000;
  return 0;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const rl = await rateLimit(`contato:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
    }

    const body = await request.json();

    // Candidatura JV (vem do /aplicar)
    if (body.tipo === "aplicacao-jv") {
      const parsed = candidaturaCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
      }

      const {
        nome, email, telefone, pais, cidade, perfil,
        experiencia, setor, empresaAtual, linkedin,
        modelo, capitalDisponivel, prazo, dedicacao,
        motivacao, diferenciais, disponibilidade, aceitaNDA,
      } = parsed.data;

      const candidaturaData = {
        nome, email, telefone, pais, cidade, perfil,
        experiencia, setor, empresaAtual, linkedin,
        modelo: modelo || [],
        capitalDisponivel, prazo, dedicacao,
        motivacao, diferenciais, disponibilidade,
        aceitaNDA: aceitaNDA || false,
      };

      // Scoring automático
      const scoreResult = scoreCandidatura(candidaturaData);

      // NDA digital — registrar aceite com IP e timestamp
      const userAgent = request.headers.get("user-agent") || "";

      await addCandidatura({
        ...candidaturaData,
        score: scoreResult.total,
        scoreTier: scoreResult.tier,
        scoreBreakdown: scoreResult.breakdown,
        scoreFlags: scoreResult.flags,
        ndaAceitoEm: candidaturaData.aceitaNDA ? new Date().toISOString() : undefined,
        ndaIp: candidaturaData.aceitaNDA ? ip : undefined,
        ndaUserAgent: candidaturaData.aceitaNDA ? userAgent : undefined,
      });

      await notify({
        tipo: "candidatura",
        nome,
        email,
        resumo: `Score: ${scoreResult.total}/100 (${scoreResult.tier}) | Perfil: ${perfil} | Marcas: ${(modelo || []).join(", ")} | Capital: ${capitalDisponivel}`,
      });

      // Email transacional (confirmação + notificação admin)
      sendCandidaturaEmails({
        nome,
        email,
        perfil,
        modelo: modelo || [],
        capitalDisponivel,
        motivacao,
      }).catch(() => {});

      // CRM sync
      crmSyncContact({ nome, email, telefone, empresa: empresaAtual, cidade, pais }).catch(() => {});
      crmSyncDeal({
        nome,
        email,
        titulo: `JV Candidatura — ${nome}`,
        valor: capitalToNumber(capitalDisponivel),
        etapa: "qualifiedtobuy",
        notas: `Score: ${scoreResult.total}/100 (${scoreResult.tier}) | Perfil: ${perfil} | Marcas: ${(modelo || []).join(", ")}`,
      }).catch(() => {});

      return NextResponse.json({ success: true });
    }

    // Contato genérico (vem do /contato)
    const parsed = contatoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }

    const { nome, email, empresa, tipo, orcamento, mensagem } = parsed.data;

    await addContato({ nome, email, empresa, tipo, orcamento, mensagem });

    await notify({
      tipo: "contato",
      nome,
      email,
      resumo: `Tipo: ${tipo} | ${mensagem.slice(0, 100)}${mensagem.length > 100 ? "..." : ""}`,
    });

    // Email transacional (confirmação + notificação admin)
    sendContatoEmails({ nome, email, tipo, empresa, orcamento, mensagem }).catch(() => {});

    // CRM sync
    crmSyncContact({ nome, email, empresa }).catch(() => {});
    crmSyncDeal({
      nome,
      email,
      titulo: `Contato — ${nome} (${tipo})`,
      valor: orcamentoToNumber(orcamento),
      notas: mensagem.slice(0, 500),
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
