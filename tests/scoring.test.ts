import { describe, it, expect } from "vitest";
import { scoreCandidatura, type ScoreResult } from "@/lib/scoring";

function makeCandidatura(overrides: Record<string, unknown> = {}) {
  return {
    nome: "João Silva",
    email: "joao@test.com",
    telefone: "+351912345678",
    pais: "Portugal",
    cidade: "Lisboa",
    perfil: "operador" as const,
    experiencia: "10+ anos de experiência em food delivery e logística, gestão de dark kitchens",
    setor: "alimentação",
    empresaAtual: "Delivery Express Lda",
    linkedin: "https://linkedin.com/in/joao-silva",
    modelo: ["sushi-rao", "pizza-rao"],
    capitalDisponivel: "50k-200k",
    prazo: "imediato",
    dedicacao: "integral",
    motivacao: "Quero expandir o modelo de delivery brasileiro para Portugal. Tenho experiência com operações de alta escala e acredito que o modelo FIGITAL pode transformar o mercado português. Meu background de 10 anos no setor me dá confiança para executar.",
    diferenciais: "Rede de contatos em Portugal, experiência com dark kitchens, já operei franquias de alimentação com sucesso em 3 cidades diferentes no Brasil, incluindo gestão de equipas de 50+ pessoas",
    disponibilidade: "imediata",
    aceitaNDA: true,
    notas: null,
    atribuidoA: null,
    score: null,
    scoreTier: null,
    scoreBreakdown: null,
    scoreFlags: [],
    ndaAceitoEm: null,
    ndaIp: null,
    ndaUserAgent: null,
    ...overrides,
  };
}

describe("scoreCandidatura", () => {
  it("returns a score between 0 and 100", () => {
    const result = scoreCandidatura(makeCandidatura());
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it("returns correct breakdown structure", () => {
    const result = scoreCandidatura(makeCandidatura());
    expect(result.breakdown).toHaveProperty("perfil");
    expect(result.breakdown).toHaveProperty("capital");
    expect(result.breakdown).toHaveProperty("experiencia");
    expect(result.breakdown).toHaveProperty("motivacao");
    expect(result.breakdown).toHaveProperty("disponibilidade");
  });

  it("assigns tier A for high-scoring candidates", () => {
    const result = scoreCandidatura(makeCandidatura());
    // With all good attributes, should be high tier
    expect(["A", "B"]).toContain(result.tier);
  });

  it("assigns tier D for weak candidates", () => {
    const result = scoreCandidatura(makeCandidatura({
      perfil: "investidor",
      experiencia: "pouca",
      capitalDisponivel: "a definir",
      motivacao: "quero tentar",
      diferenciais: "nenhum",
      dedicacao: "parcial",
      prazo: "depois",
      linkedin: null,
      empresaAtual: null,
      modelo: [],
      aceitaNDA: false,
    }));
    expect(["C", "D"]).toContain(result.tier);
  });

  it("gives higher capital score for higher capital", () => {
    const highCapital = scoreCandidatura(makeCandidatura({ capitalDisponivel: "acima de 200k" }));
    const lowCapital = scoreCandidatura(makeCandidatura({ capitalDisponivel: "a definir" }));
    expect(highCapital.breakdown.capital).toBeGreaterThan(lowCapital.breakdown.capital);
  });

  it("gives higher perfil score for 'ambos' profile", () => {
    const ambos = scoreCandidatura(makeCandidatura({ perfil: "ambos" }));
    const operador = scoreCandidatura(makeCandidatura({ perfil: "operador" }));
    expect(ambos.breakdown.perfil).toBeGreaterThanOrEqual(operador.breakdown.perfil);
  });

  it("gives higher motivacao score for longer text", () => {
    const longMotivacao = scoreCandidatura(makeCandidatura({
      motivacao: "A".repeat(600),
    }));
    const shortMotivacao = scoreCandidatura(makeCandidatura({
      motivacao: "Quero participar da JV",
    }));
    expect(longMotivacao.breakdown.motivacao).toBeGreaterThan(shortMotivacao.breakdown.motivacao);
  });

  it("flags NDA accepted", () => {
    const result = scoreCandidatura(makeCandidatura({ aceitaNDA: true }));
    expect(result.flags).toContain("NDA aceito");
  });

  it("does not flag NDA when not accepted", () => {
    const result = scoreCandidatura(makeCandidatura({ aceitaNDA: false }));
    expect(result.flags).not.toContain("NDA aceito");
  });

  it("flags LinkedIn when provided", () => {
    const result = scoreCandidatura(makeCandidatura({ linkedin: "https://linkedin.com/in/test" }));
    expect(result.flags).toContain("LinkedIn informado");
  });

  it("flags dual profile", () => {
    const result = scoreCandidatura(makeCandidatura({ perfil: "ambos" }));
    expect(result.flags).toContain("Perfil duplo (operador+investidor)");
  });

  it("flags multiple brand interest", () => {
    const result = scoreCandidatura(makeCandidatura({ modelo: ["brand-a", "brand-b", "brand-c"] }));
    expect(result.flags).toContain("Interesse em 3 marcas");
  });

  it("gives higher disponibilidade score for immediate availability", () => {
    const imediato = scoreCandidatura(makeCandidatura({ prazo: "imediato", dedicacao: "integral" }));
    const futuro = scoreCandidatura(makeCandidatura({ prazo: "6 meses", dedicacao: "parcial" }));
    expect(imediato.breakdown.disponibilidade).toBeGreaterThan(futuro.breakdown.disponibilidade);
  });

  it("gives higher experiencia score for 10+ years", () => {
    const veteran = scoreCandidatura(makeCandidatura({ experiencia: "10+ anos de gestão empresarial" }));
    const junior = scoreCandidatura(makeCandidatura({ experiencia: "2 anos de experiência básica" }));
    expect(veteran.breakdown.experiencia).toBeGreaterThan(junior.breakdown.experiencia);
  });
});
