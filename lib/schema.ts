import type { Projeto } from "./projetos";
import type { Artigo, Termo } from "./conhecimento-types";

const SITE_URL = "https://grupo351.com";
const ORG_NAME = "GRUPO +351";
const ORG_LOGO = `${SITE_URL}/logo.png`;

// ── Shared org reference ──
const orgRef = {
  "@type": "Organization",
  name: ORG_NAME,
  url: SITE_URL,
};

// ── Root Organization (full) ──
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    legalName: "GRUPO +351, Lda.",
    description:
      "Hub de negócios e joint ventures sediado em Cascais, Portugal. Construímos empresas FIGITAIS combinando operações físicas, plataformas digitais e software proprietário.",
    url: SITE_URL,
    logo: ORG_LOGO,
    image: ORG_LOGO,
    foundingDate: "2024",
    foundingLocation: {
      "@type": "Place",
      name: "Cascais, Portugal",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cascais",
      addressRegion: "Lisboa",
      postalCode: "2765",
      addressCountry: "PT",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "partnerships",
        url: `${SITE_URL}/aplicar`,
        availableLanguage: ["Portuguese", "English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        url: `${SITE_URL}/contato`,
        availableLanguage: ["Portuguese", "English"],
      },
    ],
    founders: [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#henrique-lemos`,
        name: "Henrique Lemos",
        jobTitle: "Co-fundador",
        url: "https://www.linkedin.com/in/henrique-lemos-39712b22b/",
        nationality: { "@type": "Country", name: "BR" },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#fernando-vieira`,
        name: "Fernando Vieira",
        jobTitle: "Co-fundador",
        nationality: { "@type": "Country", name: "BR" },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#herson-rosa`,
        name: "Herson Rosa",
        jobTitle: "Co-fundador",
        nationality: { "@type": "Country", name: "BR" },
      },
    ],
    areaServed: [
      { "@type": "Country", name: "Portugal" },
      { "@type": "Country", name: "Brazil" },
      { "@type": "Continent", name: "Europe" },
    ],
    knowsAbout: [
      "Joint Ventures",
      "FIGITAL Business Model",
      "Dark Kitchens",
      "3D Printing",
      "E-commerce",
      "International Sourcing",
      "Franchise Operations",
      "Digital Transformation",
    ],
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 10,
      maxValue: 50,
    },
  };
}

// ── WebSite + SearchAction (Home) ──
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: ORG_NAME,
    url: SITE_URL,
    description:
      "Hub de negócios e joint ventures. Construímos empresas FIGITAIS combinando operações físicas, plataformas digitais e software proprietário.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "pt-PT",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/conhecimento?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ── FAQPage (Home) ──
export function faqSchema(
  faqs: { q: string; a: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

// ── BreadcrumbList ──
export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── Portfolio CollectionPage + ItemList ──
export function portfolioListSchema(projetos: Projeto[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/portfolio`,
    name: "Portfólio de Negócios — GRUPO +351",
    description:
      "Negócios e projetos em desenvolvimento pelo Grupo +351. Manufatura digital, e-commerce, sourcing internacional e mais.",
    url: `${SITE_URL}/portfolio`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projetos.length,
      itemListElement: projetos.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        description: p.description,
        url: `${SITE_URL}/portfolio/${p.slug}`,
      })),
    },
  };
}

// ── Projeto individual → Service schema ──
export function projetoSchema(projeto: Projeto) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${SITE_URL}/portfolio/${projeto.slug}`,
      name: projeto.name,
      description: projeto.description,
      slogan: projeto.tagline,
      url: `${SITE_URL}/portfolio/${projeto.slug}`,
      provider: { "@id": `${SITE_URL}/#organization` },
      serviceType: projeto.tag,
      areaServed: projeto.mercado,
      category: projeto.tag,
      additionalType: "https://schema.org/BusinessService",
      termsOfService: `${SITE_URL}/parceiros`,
      ...(projeto.detalhes.length > 0 && {
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `Detalhes — ${projeto.name}`,
          itemListElement: projeto.detalhes.map((d, i) => ({
            "@type": "Offer",
            position: i + 1,
            description: d,
          })),
        },
      }),
    },
    breadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Portfólio", url: `${SITE_URL}/portfolio` },
      { name: projeto.name, url: `${SITE_URL}/portfolio/${projeto.slug}` },
    ]),
  ];
}

// ── Conhecimento CollectionPage ──
export function conhecimentoListSchema(
  artigos: Artigo[],
  termos: Termo[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/conhecimento`,
    name: "Base de Conhecimento — GRUPO +351",
    description:
      "Glossário FIGITAL, artigos sobre o modelo de negócio e guias sobre joint ventures do Grupo +351.",
    url: `${SITE_URL}/conhecimento`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: [
      {
        "@type": "ItemList",
        name: "Artigos",
        numberOfItems: artigos.length,
        itemListElement: artigos.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: a.titulo,
          description: a.resumo,
          url: `${SITE_URL}/conhecimento/${a.slug}`,
        })),
      },
      {
        "@type": "DefinedTermSet",
        name: "Glossário FIGITAL",
        description: "Termos-chave do ecossistema FIGITAL do Grupo +351",
        hasDefinedTerm: termos.map((t) => ({
          "@type": "DefinedTerm",
          name: t.termo,
          description: t.definicao,
          url: `${SITE_URL}/conhecimento#${t.slug}`,
          inDefinedTermSet: `${SITE_URL}/conhecimento`,
        })),
      },
    ],
  };
}

// ── Artigo individual → Article schema ──
export function artigoSchema(artigo: Artigo) {
  const wordCount = artigo.conteudo.join(" ").split(/\s+/).length;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${SITE_URL}/conhecimento/${artigo.slug}`,
      headline: artigo.titulo,
      description: artigo.resumo,
      url: `${SITE_URL}/conhecimento/${artigo.slug}`,
      wordCount,
      articleSection: artigo.categoria,
      inLanguage: "pt-PT",
      isAccessibleForFree: true,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/conhecimento/${artigo.slug}`,
      },
      about: [
        { "@type": "Thing", name: "Joint Ventures" },
        { "@type": "Thing", name: "FIGITAL" },
        { "@type": "Thing", name: ORG_NAME },
      ],
    },
    breadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Conhecimento", url: `${SITE_URL}/conhecimento` },
      {
        name: artigo.titulo,
        url: `${SITE_URL}/conhecimento/${artigo.slug}`,
      },
    ]),
  ];
}

// ── Sobre → AboutPage + Person schemas ──
export function sobreSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${SITE_URL}/sobre`,
      name: "Sobre o GRUPO +351",
      description:
        "Conheça os fundadores do Grupo +351: Henrique Lemos, Fernando Vieira e Herson Rosa. Empreendedores brasileiros construindo negócios FIGITAIS em Portugal.",
      url: `${SITE_URL}/sobre`,
      mainEntity: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${SITE_URL}/#henrique-lemos`,
      name: "Henrique Lemos",
      jobTitle: "Co-fundador do GRUPO +351",
      description:
        "Co-fundador do Grupo Rão, maior rede de delivery do Brasil com 20+ marcas e 200+ unidades. Autor do livro Delivery Milionário.",
      url: "https://www.linkedin.com/in/henrique-lemos-39712b22b/",
      worksFor: { "@id": `${SITE_URL}/#organization` },
      nationality: { "@type": "Country", name: "BR" },
      knowsAbout: [
        "Franchising",
        "Dark Kitchens",
        "Food Delivery",
        "Joint Ventures",
        "FIGITAL Business Model",
      ],
    },
    breadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Sobre", url: `${SITE_URL}/sobre` },
    ]),
  ];
}

// ── Parceiros → WebPage ──
export function parceirosSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE_URL}/parceiros`,
      name: "Portal do Parceiro — GRUPO +351",
      description:
        "Modelos de joint venture do Grupo +351. Estruturas societárias, investimento necessário e oportunidades para operadores e investidores em Portugal e Europa.",
      url: `${SITE_URL}/parceiros`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h2", ".speakable"],
      },
      about: [
        { "@type": "Thing", name: "Joint Ventures" },
        { "@type": "Thing", name: "Business Partnerships" },
        { "@type": "Thing", name: "Investment Opportunities in Portugal" },
      ],
    },
    breadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Parceiros", url: `${SITE_URL}/parceiros` },
    ]),
  ];
}

// ── Ecossistema → WebPage ──
export function ecossistemaSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE_URL}/ecossistema`,
      name: "Ecossistema FIGITAL — GRUPO +351",
      description:
        "Arquitetura FIGITAL do Grupo +351: como operações físicas, plataformas digitais e software proprietário se integram num ecossistema de negócios em rede.",
      url: `${SITE_URL}/ecossistema`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: [
        { "@type": "Thing", name: "FIGITAL Business Architecture" },
        { "@type": "Thing", name: "Business Ecosystem" },
        { "@type": "Thing", name: "Digital Transformation" },
      ],
    },
    breadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Ecossistema", url: `${SITE_URL}/ecossistema` },
    ]),
  ];
}

// ── Contato → ContactPage ──
export function contatoSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": `${SITE_URL}/contato`,
      name: "Contato — GRUPO +351",
      description:
        "Entre em contato com o Grupo +351. Proponha uma joint venture, parceria estratégica ou conheça oportunidades de negócio em Portugal.",
      url: `${SITE_URL}/contato`,
      mainEntity: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          url: `${SITE_URL}/contato`,
          availableLanguage: ["Portuguese", "English"],
        },
      },
    },
    breadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Contato", url: `${SITE_URL}/contato` },
    ]),
  ];
}

// ── Aplicar → WebPage ──
export function aplicarSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE_URL}/aplicar`,
      name: "Candidatura a Joint Venture — GRUPO +351",
      description:
        "Formulário de candidatura para joint ventures com o Grupo +351. Para operadores, investidores e parceiros estratégicos.",
      url: `${SITE_URL}/aplicar`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      potentialAction: {
        "@type": "ApplyAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/aplicar`,
          actionPlatform: "https://schema.org/DesktopWebPlatform",
        },
        name: "Candidatar-se a uma Joint Venture",
      },
    },
    breadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Aplicar", url: `${SITE_URL}/aplicar` },
    ]),
  ];
}

// ── Helper: render JSON-LD script tag content ──
export function jsonLdString(data: unknown): string {
  const items = Array.isArray(data) ? data : [data];
  return items.map((d) => JSON.stringify(d)).join("");
}
