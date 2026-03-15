import { describe, it, expect } from "vitest";
import {
  organizationSchema,
  webSiteSchema,
  faqSchema,
  breadcrumbSchema,
  portfolioListSchema,
  projetoSchema,
  artigoSchema,
  jsonLdString,
} from "@/lib/schema";

describe("organizationSchema", () => {
  it("returns valid schema.org Organization", () => {
    const schema = organizationSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("GRUPO +351");
    expect(schema.url).toBe("https://grupo351.com");
  });

  it("includes founders", () => {
    const schema = organizationSchema();
    expect(schema.founders).toHaveLength(3);
    expect(schema.founders[0].name).toBe("Henrique Lemos");
  });

  it("includes contact points", () => {
    const schema = organizationSchema();
    expect(schema.contactPoint).toHaveLength(2);
  });

  it("includes areas served", () => {
    const schema = organizationSchema();
    expect(schema.areaServed.length).toBeGreaterThan(0);
  });
});

describe("webSiteSchema", () => {
  it("returns WebSite type", () => {
    const schema = webSiteSchema();
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.inLanguage).toBe("pt-PT");
  });

  it("includes search action", () => {
    const schema = webSiteSchema();
    expect(schema.potentialAction["@type"]).toBe("SearchAction");
  });
});

describe("faqSchema", () => {
  it("creates FAQ page with questions", () => {
    const faqs = [
      { q: "O que é o Grupo +351?", a: "Um hub de negócios." },
      { q: "Como participar?", a: "Aplicar via site." },
    ];
    const schema = faqSchema(faqs);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0]["@type"]).toBe("Question");
    expect(schema.mainEntity[0].name).toBe("O que é o Grupo +351?");
    expect(schema.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
  });

  it("handles empty FAQ list", () => {
    const schema = faqSchema([]);
    expect(schema.mainEntity).toHaveLength(0);
  });
});

describe("breadcrumbSchema", () => {
  it("creates breadcrumb list with positions", () => {
    const items = [
      { name: "Home", url: "https://grupo351.com" },
      { name: "Portfolio", url: "https://grupo351.com/portfolio" },
    ];
    const schema = breadcrumbSchema(items);
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
  });
});

describe("portfolioListSchema", () => {
  it("creates collection page for projects", () => {
    const projetos = [
      { slug: "test", name: "Test", tagline: "t", description: "desc", detalhes: [], tag: "x", status: "active", mercado: "PT", controle: "100%", icon: "t" },
    ];
    const schema = portfolioListSchema(projetos as any);
    expect(schema["@type"]).toBe("CollectionPage");
    expect(schema.mainEntity.numberOfItems).toBe(1);
  });
});

describe("projetoSchema", () => {
  it("creates Service schema for a project", () => {
    const projeto = {
      slug: "delivery-express",
      name: "Delivery Express",
      tagline: "Fast delivery",
      description: "A delivery service",
      detalhes: ["Feature 1", "Feature 2"],
      tag: "food",
      status: "Em operação",
      mercado: "Portugal",
      controle: "100%",
      icon: "🚀",
    };
    const schemas = projetoSchema(projeto as any);
    expect(schemas).toHaveLength(2); // Service + Breadcrumb
    expect(schemas[0]["@type"]).toBe("Service");
    expect(schemas[0].name).toBe("Delivery Express");
    expect(schemas[1]["@type"]).toBe("BreadcrumbList");
  });
});

describe("artigoSchema", () => {
  it("creates Article schema", () => {
    const artigo = {
      slug: "modelo-jv",
      titulo: "Modelo JV",
      resumo: "Como funciona o modelo JV",
      conteudo: ["Parágrafo um com muitas palavras", "Parágrafo dois"],
      categoria: "guia",
      destaque: false,
    };
    const schemas = artigoSchema(artigo);
    expect(schemas).toHaveLength(2); // Article + Breadcrumb
    expect(schemas[0]["@type"]).toBe("Article");
    expect(schemas[0].headline).toBe("Modelo JV");
    expect(schemas[0].wordCount).toBeGreaterThan(0);
  });
});

describe("jsonLdString", () => {
  it("serializes single object to JSON string", () => {
    const data = { "@type": "Thing", name: "Test" };
    const result = jsonLdString(data);
    expect(result).toBe(JSON.stringify(data));
  });

  it("serializes array of objects", () => {
    const data = [{ "@type": "A" }, { "@type": "B" }];
    const result = jsonLdString(data);
    expect(result).toBe(JSON.stringify(data[0]) + JSON.stringify(data[1]));
  });
});
