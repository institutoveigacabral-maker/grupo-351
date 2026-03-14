import { prisma } from "./prisma";

export interface Projeto {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  detalhes: string[];
  tag: string;
  status: "Em operação" | "Em desenvolvimento" | "Em estruturação";
  mercado: string;
  parceiro?: string;
  controle: string;
  icon: string;
  notasInternas?: string;
  ultimaAtualizacao?: string;
}

function mapRow(row: Record<string, unknown>): Projeto {
  return {
    slug: row.slug as string,
    name: row.name as string,
    tagline: row.tagline as string,
    description: row.description as string,
    detalhes: row.detalhes as string[],
    tag: row.tag as string,
    status: row.status as Projeto["status"],
    mercado: row.mercado as string,
    parceiro: (row.parceiro as string) || undefined,
    controle: row.controle as string,
    icon: row.icon as string,
    notasInternas: (row.notasInternas as string) || undefined,
    ultimaAtualizacao: row.ultimaAtualizacao
      ? (row.ultimaAtualizacao as Date).toISOString()
      : undefined,
  };
}

export async function getProjetos(): Promise<Projeto[]> {
  const rows = await prisma.projeto.findMany();
  return rows.map(mapRow);
}

export async function getProjetoBySlug(slug: string): Promise<Projeto | undefined> {
  const row = await prisma.projeto.findUnique({ where: { slug } });
  return row ? mapRow(row) : undefined;
}
