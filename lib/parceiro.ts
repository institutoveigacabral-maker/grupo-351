import { prisma } from "./prisma";
import { logger } from "./logger";

export interface ParceiroData {
  id: string;
  nome: string;
  email: string;
  token: string;
  projetoSlug: string;
  papel: string;
  ativo: boolean;
  criadoEm: string;
  ultimoAcesso?: string;
  metricas?: ParceiroMetricas;
}

export interface ParceiroMetricas {
  faturamentoMensal?: number;
  ticketMedio?: number;
  pedidosMes?: number;
  satisfacao?: number;
  metaMensal?: number;
  historico?: { mes: string; valor: number }[];
  observacoes?: string;
}

export async function getParceiroByToken(token: string): Promise<ParceiroData | null> {
  const row = await prisma.parceiro.findUnique({ where: { token } });
  if (!row || !row.ativo) return null;

  // Atualizar último acesso
  await prisma.parceiro.update({
    where: { id: row.id },
    data: { ultimoAcesso: new Date() },
  }).catch((err) => logger.warn("Failed to update parceiro ultimoAcesso", "parceiro", { error: String(err) }));

  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    token: row.token,
    projetoSlug: row.projetoSlug,
    papel: row.papel,
    ativo: row.ativo,
    criadoEm: row.criadoEm.toISOString(),
    ultimoAcesso: row.ultimoAcesso?.toISOString(),
    metricas: (row.metricas as ParceiroMetricas) || undefined,
  };
}

export async function getParceiros(): Promise<ParceiroData[]> {
  const rows = await prisma.parceiro.findMany({
    orderBy: { criadoEm: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    nome: row.nome,
    email: row.email,
    token: row.token,
    projetoSlug: row.projetoSlug,
    papel: row.papel,
    ativo: row.ativo,
    criadoEm: row.criadoEm.toISOString(),
    ultimoAcesso: row.ultimoAcesso?.toISOString(),
    metricas: (row.metricas as ParceiroMetricas) || undefined,
  }));
}

export async function updateParceiroMetricas(
  id: string,
  metricas: ParceiroMetricas
): Promise<void> {
  await prisma.parceiro.update({
    where: { id },
    data: { metricas: metricas as object },
  });
}
