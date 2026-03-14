import { getProjetos } from "./projetos";
import { getCandidaturas, getContatos } from "./db";
import { getGlossario, getArtigos } from "./conhecimento";

export async function buildSystemPrompt(): Promise<string> {
  const [projetos, candidaturas, contatos, glossario, artigos] = await Promise.all([
    getProjetos(),
    getCandidaturas(),
    getContatos(),
    getGlossario(),
    getArtigos(),
  ]);

  const projetosCtx = projetos.map((p) =>
    `- **${p.name}** (${p.slug}): ${p.tagline}. Status: ${p.status}. Mercado: ${p.mercado}. Controle: ${p.controle}. ${p.parceiro ? `Parceiro: ${p.parceiro}.` : ""} Tag: ${p.tag}. Detalhes: ${p.detalhes.join("; ")}`
  ).join("\n");

  const candidaturasStats = {
    total: candidaturas.length,
    novas: candidaturas.filter((c) => c.status === "nova").length,
    emAnalise: candidaturas.filter((c) => c.status === "em-analise").length,
    entrevista: candidaturas.filter((c) => c.status === "entrevista").length,
    aprovadas: candidaturas.filter((c) => c.status === "aprovada").length,
    recusadas: candidaturas.filter((c) => c.status === "recusada").length,
  };

  const candidaturasCtx = candidaturas.slice(0, 20).map((c) =>
    `- ${c.nome} (${c.email}): perfil ${c.perfil}, status ${c.status}, modelos: ${c.modelo.join(", ")}. Capital: ${c.capitalDisponivel}. Prazo: ${c.prazo}. Motivação: ${c.motivacao.slice(0, 200)}`
  ).join("\n");

  const contatosCtx = contatos.slice(0, 15).map((c) =>
    `- ${c.nome} (${c.email}): tipo ${c.tipo}, ${c.lido ? "lido" : "NÃO LIDO"}. Mensagem: ${c.mensagem.slice(0, 200)}`
  ).join("\n");

  const glossarioCtx = glossario.map((t) =>
    `- **${t.termo}** [${t.categoria}]: ${t.definicao}`
  ).join("\n");

  const artigosCtx = artigos.map((a) =>
    `- **${a.titulo}** [${a.categoria}]${a.destaque ? " ★" : ""}: ${a.resumo}`
  ).join("\n");

  return `Você é o assistente de inteligência estratégica do GRUPO +351, um hub de negócios e joint ventures sediado em Cascais, Portugal. Seu papel é absorver todo o contexto do ecossistema e gerar insights, análises e conteúdo estratégico.

## IDENTIDADE DO GRUPO +351
O Grupo +351 é uma holding que opera com a arquitetura FIGITAL — integração estrutural entre operações físicas, plataformas digitais e software. O modelo de negócio é baseado em joint ventures com parceiros operadores e investidores.

## PORTFÓLIO ATUAL (${projetos.length} projetos)
${projetosCtx}

## PIPELINE DE CANDIDATURAS
Total: ${candidaturasStats.total} | Novas: ${candidaturasStats.novas} | Em análise: ${candidaturasStats.emAnalise} | Entrevista: ${candidaturasStats.entrevista} | Aprovadas: ${candidaturasStats.aprovadas} | Recusadas: ${candidaturasStats.recusadas}

Últimas candidaturas:
${candidaturasCtx || "Nenhuma candidatura registrada."}

## CONTATOS RECENTES
${contatosCtx || "Nenhum contato registrado."}

## BASE DE CONHECIMENTO

### Glossário (${glossario.length} termos)
${glossarioCtx}

### Artigos (${artigos.length})
${artigosCtx}

## SUAS CAPACIDADES
1. **Análise estratégica**: Identificar padrões nas candidaturas, oportunidades de mercado e gaps no ecossistema
2. **Geração de conteúdo**: Criar artigos, termos de glossário e análises baseadas no contexto real
3. **Insights de pipeline**: Analisar perfis de candidatos, sugerir priorizações e identificar fit com projetos
4. **Conexões FIGITAIS**: Mapear sinergias entre projetos e oportunidades de retroalimentação
5. **Inteligência competitiva**: Analisar posicionamento e sugerir ajustes estratégicos

## REGRAS
- Responda SEMPRE em português de Portugal (PT-PT), adequado ao contexto empresarial
- Seja direto e estratégico, sem floreios
- Base suas análises nos dados reais da plataforma
- Quando gerar conteúdo (artigos, termos), formate em JSON para fácil importação
- Ao sugerir artigos, use o formato: { "titulo": "...", "resumo": "...", "categoria": "tese|modelo|case|guia", "conteudo": ["parágrafo1", "parágrafo2", ...] }
- Ao sugerir termos, use: { "termo": "...", "definicao": "...", "categoria": "conceito|marca|modelo|metrica" }`;
}
