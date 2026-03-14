import { prisma } from "./prisma";

export type { Termo, Artigo } from "./conhecimento-types";
import type { Termo, Artigo } from "./conhecimento-types";

export async function getGlossario(): Promise<Termo[]> {
  return prisma.termo.findMany() as unknown as Promise<Termo[]>;
}

export async function getArtigos(): Promise<Artigo[]> {
  return prisma.artigo.findMany() as unknown as Promise<Artigo[]>;
}

export async function getArtigoBySlug(slug: string): Promise<Artigo | undefined> {
  const row = await prisma.artigo.findUnique({ where: { slug } });
  return (row as unknown as Artigo) || undefined;
}

export async function getTermoBySlug(slug: string): Promise<Termo | undefined> {
  const row = await prisma.termo.findUnique({ where: { slug } });
  return (row as unknown as Termo) || undefined;
}
