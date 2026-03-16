import { prisma } from "./prisma";

export type { Termo, Artigo } from "./conhecimento-types";
import type { Termo, Artigo } from "./conhecimento-types";

export async function getGlossario(): Promise<Termo[]> {
  const rows = await prisma.termo.findMany();
  return rows as Termo[];
}

export async function getArtigos(): Promise<Artigo[]> {
  const rows = await prisma.artigo.findMany();
  return rows as Artigo[];
}

export async function getArtigoBySlug(slug: string): Promise<Artigo | undefined> {
  const row = await prisma.artigo.findUnique({ where: { slug } });
  return (row as Artigo | null) ?? undefined;
}

export async function getTermoBySlug(slug: string): Promise<Termo | undefined> {
  const row = await prisma.termo.findUnique({ where: { slug } });
  return (row as Termo | null) ?? undefined;
}
