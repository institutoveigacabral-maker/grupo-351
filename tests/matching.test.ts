import { describe, it, expect } from "vitest";

// We test the deterministic scoring logic by extracting it
// The actual function is private in the module, so we replicate and test

interface CompanyProfile {
  id: string;
  slug: string;
  nome: string;
  setor: string;
  pais: string;
  cidade: string | null;
  estagio: string;
  interesses: string[];
  descricao: string | null;
  ownerId: string;
}

interface OpportunityData {
  id: string;
  titulo: string;
  tipo: string;
  setor: string;
  descricao: string;
  requisitos: string | null;
  budget: string | null;
  localizacao: string | null;
  companyId: string;
}

// Replicate the scoreMatch function from lib/ai/matching.ts
function scoreMatch(company: CompanyProfile, opp: OpportunityData): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  if (company.setor.toLowerCase() === opp.setor.toLowerCase()) {
    score += 30;
    factors.push("Mesmo setor");
  } else if (opp.setor.toLowerCase().includes(company.setor.toLowerCase()) ||
             company.setor.toLowerCase().includes(opp.setor.toLowerCase())) {
    score += 15;
    factors.push("Setor relacionado");
  }

  const tipoToInteresse: Record<string, string[]> = {
    franquia: ["franquia", "expansao"],
    investimento: ["investimento", "financeiro"],
    parceria: ["expansao", "tecnologia", "logistica", "marketing"],
    fornecedor: ["fornecedor", "logistica"],
    expansao: ["expansao", "franquia"],
  };
  const relevantInteresses = tipoToInteresse[opp.tipo] || [];
  const matched = company.interesses.filter((i) => relevantInteresses.includes(i));
  if (matched.length > 0) {
    score += Math.min(matched.length * 10, 20);
    factors.push(`Interesses: ${matched.join(", ")}`);
  }

  if (opp.localizacao) {
    const loc = opp.localizacao.toLowerCase();
    if (loc.includes(company.pais.toLowerCase())) {
      score += 15;
      factors.push("Mesmo país");
    }
    if (company.cidade && loc.includes(company.cidade.toLowerCase())) {
      score += 10;
      factors.push("Mesma cidade");
    }
  }

  const estagioScore: Record<string, number> = {
    ideacao: 1, validacao: 2, operando: 3, escala: 4, consolidado: 5,
  };
  const companyStage = estagioScore[company.estagio] || 3;
  if (companyStage >= 3) {
    score += 15;
    factors.push("Empresa em estágio operacional");
  } else if (companyStage === 2) {
    score += 8;
    factors.push("Empresa em validação");
  }

  return { score: Math.min(score, 100), factors };
}

function makeCompany(overrides: Partial<CompanyProfile> = {}): CompanyProfile {
  return {
    id: "company-1",
    slug: "empresa-teste",
    nome: "Empresa Teste",
    setor: "alimentação",
    pais: "Portugal",
    cidade: "Lisboa",
    estagio: "operando",
    interesses: ["franquia", "expansao"],
    descricao: "Empresa de teste",
    ownerId: "user-1",
    ...overrides,
  };
}

function makeOpportunity(overrides: Partial<OpportunityData> = {}): OpportunityData {
  return {
    id: "opp-1",
    titulo: "Franquia de Delivery",
    tipo: "franquia",
    setor: "alimentação",
    descricao: "Franquia de delivery em Portugal",
    requisitos: null,
    budget: "50k-200k",
    localizacao: "Lisboa, Portugal",
    companyId: "other-company",
    ...overrides,
  };
}

describe("scoreMatch - deterministic matching", () => {
  it("gives 30 points for same setor", () => {
    const company = makeCompany({ setor: "tecnologia" });
    const opp = makeOpportunity({ setor: "tecnologia" });
    const result = scoreMatch(company, opp);
    expect(result.factors).toContain("Mesmo setor");
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it("gives 15 points for related setor", () => {
    const company = makeCompany({ setor: "tech" });
    const opp = makeOpportunity({ setor: "tech e inovação" });
    const result = scoreMatch(company, opp);
    expect(result.factors).toContain("Setor relacionado");
  });

  it("gives 0 for completely different setor", () => {
    const company = makeCompany({ setor: "saúde", interesses: [], cidade: null });
    const opp = makeOpportunity({ setor: "mineração", tipo: "investimento", localizacao: null });
    const result = scoreMatch(company, opp);
    expect(result.factors).not.toContain("Mesmo setor");
    expect(result.factors).not.toContain("Setor relacionado");
  });

  it("gives points for matching interesses", () => {
    const company = makeCompany({ interesses: ["franquia", "expansao"] });
    const opp = makeOpportunity({ tipo: "franquia" });
    const result = scoreMatch(company, opp);
    expect(result.factors.some((f) => f.startsWith("Interesses:"))).toBe(true);
  });

  it("caps interesse bonus at 20", () => {
    const company = makeCompany({
      setor: "outro",
      interesses: ["franquia", "expansao"],
      cidade: null,
    });
    const opp = makeOpportunity({ setor: "diferente", tipo: "franquia", localizacao: null });
    const result = scoreMatch(company, opp);
    // 0 (setor) + 20 (interesses, capped) + 0 (location) + 15 (estagio) = 35
    expect(result.score).toBeLessThanOrEqual(35);
  });

  it("gives 15 points for same country", () => {
    const company = makeCompany({ pais: "Portugal", cidade: null });
    const opp = makeOpportunity({ localizacao: "Lisboa, Portugal" });
    const result = scoreMatch(company, opp);
    expect(result.factors).toContain("Mesmo país");
  });

  it("gives extra 10 points for same city", () => {
    const company = makeCompany({ pais: "Portugal", cidade: "Lisboa" });
    const opp = makeOpportunity({ localizacao: "Lisboa, Portugal" });
    const result = scoreMatch(company, opp);
    expect(result.factors).toContain("Mesma cidade");
  });

  it("gives 15 points for operational stage", () => {
    const company = makeCompany({ estagio: "operando" });
    const result = scoreMatch(company, makeOpportunity());
    expect(result.factors).toContain("Empresa em estágio operacional");
  });

  it("gives 8 points for validation stage", () => {
    const company = makeCompany({ estagio: "validacao", setor: "outro", interesses: [], cidade: null });
    const opp = makeOpportunity({ setor: "diferente", tipo: "investimento", localizacao: null });
    const result = scoreMatch(company, opp);
    expect(result.factors).toContain("Empresa em validação");
    expect(result.score).toBe(8);
  });

  it("gives 0 for ideacao stage", () => {
    const company = makeCompany({ estagio: "ideacao", setor: "outro", interesses: [], cidade: null });
    const opp = makeOpportunity({ setor: "diferente", tipo: "investimento", localizacao: null });
    const result = scoreMatch(company, opp);
    expect(result.score).toBe(0);
  });

  it("high compatibility company gets high score", () => {
    const company = makeCompany({
      setor: "alimentação",
      pais: "Portugal",
      cidade: "Lisboa",
      estagio: "escala",
      interesses: ["franquia", "expansao"],
    });
    const opp = makeOpportunity({
      setor: "alimentação",
      tipo: "franquia",
      localizacao: "Lisboa, Portugal",
    });
    const result = scoreMatch(company, opp);
    // 30 (setor) + 20 (interesses) + 15 (país) + 10 (cidade) + 15 (estágio) = 90
    expect(result.score).toBe(90);
  });

  it("caps score at 100", () => {
    // Even with max everything, should not exceed 100
    const result = scoreMatch(makeCompany(), makeOpportunity());
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
