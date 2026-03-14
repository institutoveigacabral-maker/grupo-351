import type { MetadataRoute } from "next";
import { getProjetos } from "@/lib/projetos";
import { getArtigos } from "@/lib/conhecimento";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://grupo351.com";
  const now = new Date();

  const [projetos, artigos] = await Promise.all([getProjetos(), getArtigos()]);

  const projetoUrls = projetos.map((p) => ({
    url: `${base}/portfolio/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/sobre`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/portfolio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...projetoUrls,
    {
      url: `${base}/ecossistema`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/parceiros`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/aplicar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/conhecimento`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...artigos.map((a) => ({
      url: `${base}/conhecimento/${a.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${base}/contato`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${base}/legal/privacidade`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/legal/termos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
