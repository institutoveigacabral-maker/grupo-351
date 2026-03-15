import { describe, it, expect } from "vitest";
import {
  candidaturaCreateSchema,
  contatoCreateSchema,
  candidaturaUpdateSchema,
  contatoUpdateSchema,
  projetoSchema,
  termoSchema,
  artigoSchema,
  loginSchema,
  registerSchema,
  companyCreateSchema,
  companyUpdateSchema,
  opportunityCreateSchema,
  opportunityUpdateSchema,
  aiMessagesSchema,
} from "@/lib/validations";

describe("candidaturaCreateSchema", () => {
  const validData = {
    tipo: "aplicacao-jv" as const,
    nome: "João Silva",
    email: "joao@example.com",
    telefone: "+351912345678",
    pais: "Portugal",
    cidade: "Lisboa",
    perfil: "operador" as const,
    experiencia: "10+ anos em food delivery e logística",
    setor: "alimentação",
    capitalDisponivel: "50k-200k",
    prazo: "3 meses",
    dedicacao: "integral",
    motivacao: "Expandir negócios de delivery para Portugal com expertise",
    diferenciais: "Rede de contatos em Portugal e experiência com dark kitchens",
    aceitaNDA: true,
  };

  it("accepts valid candidatura data", () => {
    const result = candidaturaCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = candidaturaCreateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = candidaturaCreateSchema.safeParse({ ...validData, email: "not-email" });
    expect(result.success).toBe(false);
  });

  it("rejects nome too short", () => {
    const result = candidaturaCreateSchema.safeParse({ ...validData, nome: "X" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid perfil enum", () => {
    const result = candidaturaCreateSchema.safeParse({ ...validData, perfil: "alien" });
    expect(result.success).toBe(false);
  });

  it("accepts optional linkedin with valid URL", () => {
    const result = candidaturaCreateSchema.safeParse({ ...validData, linkedin: "https://linkedin.com/in/joao" });
    expect(result.success).toBe(true);
  });

  it("accepts empty string linkedin", () => {
    const result = candidaturaCreateSchema.safeParse({ ...validData, linkedin: "" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid linkedin URL", () => {
    const result = candidaturaCreateSchema.safeParse({ ...validData, linkedin: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects experiencia too short", () => {
    const result = candidaturaCreateSchema.safeParse({ ...validData, experiencia: "short" });
    expect(result.success).toBe(false);
  });

  it("defaults modelo to empty array", () => {
    const result = candidaturaCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.modelo).toEqual([]);
    }
  });
});

describe("contatoCreateSchema", () => {
  it("accepts valid contato", () => {
    const result = contatoCreateSchema.safeParse({
      nome: "Maria Costa",
      email: "maria@empresa.pt",
      tipo: "parceria",
      mensagem: "Gostaria de saber mais sobre oportunidades de JV.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mensagem too short", () => {
    const result = contatoCreateSchema.safeParse({
      nome: "Maria Costa",
      email: "maria@empresa.pt",
      tipo: "parceria",
      mensagem: "Oi",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional empresa and orcamento", () => {
    const result = contatoCreateSchema.safeParse({
      nome: "Maria Costa",
      email: "maria@empresa.pt",
      tipo: "investimento",
      mensagem: "Tenho interesse em investir no ecossistema.",
      empresa: "ACME Portugal",
      orcamento: "100k-500k",
    });
    expect(result.success).toBe(true);
  });
});

describe("candidaturaUpdateSchema", () => {
  it("accepts valid status update", () => {
    const result = candidaturaUpdateSchema.safeParse({ status: "em-analise" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = candidaturaUpdateSchema.safeParse({ status: "invalid-status" });
    expect(result.success).toBe(false);
  });

  it("accepts notas", () => {
    const result = candidaturaUpdateSchema.safeParse({ notas: "Candidato promissor" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    const result = candidaturaUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("contatoUpdateSchema", () => {
  it("accepts lido boolean", () => {
    const result = contatoUpdateSchema.safeParse({ lido: true });
    expect(result.success).toBe(true);
  });

  it("accepts arquivado boolean", () => {
    const result = contatoUpdateSchema.safeParse({ arquivado: true });
    expect(result.success).toBe(true);
  });
});

describe("projetoSchema", () => {
  const validProjeto = {
    slug: "minha-empresa",
    name: "Minha Empresa",
    tagline: "Delivery de qualidade",
    description: "Uma descrição completa do projeto",
    detalhes: ["Ponto 1", "Ponto 2"],
    tag: "food",
    status: "Em operação" as const,
    mercado: "Portugal",
    controle: "100%",
    icon: "🍕",
  };

  it("accepts valid projeto", () => {
    const result = projetoSchema.safeParse(validProjeto);
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug format (uppercase)", () => {
    const result = projetoSchema.safeParse({ ...validProjeto, slug: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status enum", () => {
    const result = projetoSchema.safeParse({ ...validProjeto, status: "inexistente" });
    expect(result.success).toBe(false);
  });

  it("accepts optional socio and porcentagem", () => {
    const result = projetoSchema.safeParse({ ...validProjeto, socio: "João", porcentagem: 50 });
    expect(result.success).toBe(true);
  });

  it("rejects porcentagem > 100", () => {
    const result = projetoSchema.safeParse({ ...validProjeto, porcentagem: 150 });
    expect(result.success).toBe(false);
  });
});

describe("termoSchema", () => {
  it("accepts valid termo", () => {
    const result = termoSchema.safeParse({
      slug: "figital",
      termo: "FIGITAL",
      definicao: "Combinação de físico, digital e software num modelo de negócio integrado",
      categoria: "conceito",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid categoria", () => {
    const result = termoSchema.safeParse({
      slug: "test",
      termo: "Test",
      definicao: "Test def",
      categoria: "invalida",
    });
    expect(result.success).toBe(false);
  });
});

describe("artigoSchema", () => {
  it("accepts valid artigo", () => {
    const result = artigoSchema.safeParse({
      slug: "modelo-jv",
      titulo: "Como Funciona o Modelo JV",
      resumo: "Um guia completo sobre joint ventures.",
      conteudo: ["Parágrafo 1", "Parágrafo 2"],
      categoria: "guia",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid categoria", () => {
    const result = artigoSchema.safeParse({
      slug: "test",
      titulo: "Te",
      resumo: "Resumo",
      conteudo: [],
      categoria: "blog",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "admin@grupo351.com", senha: "123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "bad", senha: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty senha", () => {
    const result = loginSchema.safeParse({ email: "admin@test.com", senha: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      nome: "Empresa Nova",
      email: "nova@empresa.pt",
      senha: "senhaSegura123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("empresa"); // default
    }
  });

  it("rejects senha too short", () => {
    const result = registerSchema.safeParse({
      nome: "Test",
      email: "test@test.com",
      senha: "123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts parceiro role", () => {
    const result = registerSchema.safeParse({
      nome: "Parceiro PT",
      email: "parceiro@test.com",
      senha: "senhaSegura123",
      role: "parceiro",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("parceiro");
    }
  });
});

describe("companyCreateSchema", () => {
  const validCompany = {
    nome: "Empresa Portugal",
    slug: "empresa-portugal",
    setor: "tecnologia",
    pais: "Portugal",
  };

  it("accepts valid company", () => {
    const result = companyCreateSchema.safeParse(validCompany);
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const result = companyCreateSchema.safeParse({ ...validCompany, slug: "Invalid Slug!" });
    expect(result.success).toBe(false);
  });

  it("defaults estagio to operando", () => {
    const result = companyCreateSchema.safeParse(validCompany);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estagio).toBe("operando");
    }
  });

  it("accepts all estagio values", () => {
    for (const estagio of ["ideacao", "validacao", "operando", "escala", "consolidado"]) {
      const result = companyCreateSchema.safeParse({ ...validCompany, estagio });
      expect(result.success).toBe(true);
    }
  });

  it("accepts faturamento ranges", () => {
    for (const faturamento of ["ate-100k", "100k-500k", "500k-1m", "1m-5m", "5m+"]) {
      const result = companyCreateSchema.safeParse({ ...validCompany, faturamento });
      expect(result.success).toBe(true);
    }
  });
});

describe("companyUpdateSchema", () => {
  it("accepts partial updates without slug", () => {
    const result = companyUpdateSchema.safeParse({ nome: "Novo Nome" });
    expect(result.success).toBe(true);
  });

  it("is partial (empty object valid)", () => {
    const result = companyUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("opportunityCreateSchema", () => {
  const validOpportunity = {
    titulo: "Franquia de Delivery em Lisboa",
    tipo: "franquia" as const,
    setor: "alimentação",
    descricao: "Oportunidade de franquia de delivery em Lisboa com modelo comprovado no Brasil",
  };

  it("accepts valid opportunity", () => {
    const result = opportunityCreateSchema.safeParse(validOpportunity);
    expect(result.success).toBe(true);
  });

  it("rejects titulo too short", () => {
    const result = opportunityCreateSchema.safeParse({ ...validOpportunity, titulo: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects descricao too short", () => {
    const result = opportunityCreateSchema.safeParse({ ...validOpportunity, descricao: "Curto" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tipo", () => {
    const result = opportunityCreateSchema.safeParse({ ...validOpportunity, tipo: "emprego" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid tipos", () => {
    for (const tipo of ["franquia", "investimento", "parceria", "fornecedor", "expansao"]) {
      const result = opportunityCreateSchema.safeParse({ ...validOpportunity, tipo });
      expect(result.success).toBe(true);
    }
  });
});

describe("opportunityUpdateSchema", () => {
  it("accepts status update", () => {
    const result = opportunityUpdateSchema.safeParse({ status: "em-negociacao" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = opportunityUpdateSchema.safeParse({ status: "aprovada" });
    expect(result.success).toBe(false);
  });
});

describe("aiMessagesSchema", () => {
  it("accepts valid messages", () => {
    const result = aiMessagesSchema.safeParse({
      messages: [{ role: "user", content: "Olá, como funciona?" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages array", () => {
    const result = aiMessagesSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = aiMessagesSchema.safeParse({
      messages: [{ role: "system", content: "test" }],
    });
    expect(result.success).toBe(false);
  });
});
