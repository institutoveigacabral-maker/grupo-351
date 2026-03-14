import { prisma } from "./prisma";
import type { Candidatura, Contato } from "./admin-types";
import type { Projeto } from "./projetos";
import type { Termo, Artigo } from "./conhecimento-types";

/* ─── Candidaturas ─── */

export async function getCandidaturas(): Promise<Candidatura[]> {
  const rows = await prisma.candidatura.findMany({
    orderBy: { criadoEm: "desc" },
  });
  return rows.map(mapCandidatura);
}

export async function addCandidatura(
  data: Omit<Candidatura, "id" | "criadoEm" | "status">
): Promise<Candidatura> {
  const row = await prisma.candidatura.create({
    data: {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      pais: data.pais,
      cidade: data.cidade,
      perfil: data.perfil,
      experiencia: data.experiencia,
      setor: data.setor,
      empresaAtual: data.empresaAtual || null,
      linkedin: data.linkedin || null,
      modelo: data.modelo,
      capitalDisponivel: data.capitalDisponivel,
      prazo: data.prazo,
      dedicacao: data.dedicacao,
      motivacao: data.motivacao,
      diferenciais: data.diferenciais,
      disponibilidade: data.disponibilidade || null,
      aceitaNDA: data.aceitaNDA,
      status: "nova",
    },
  });
  return mapCandidatura(row);
}

export async function updateCandidatura(
  id: string,
  updates: Partial<Candidatura>
): Promise<Candidatura | null> {
  try {
    const { id: _id, criadoEm: _c, ...safe } = updates;
    const row = await prisma.candidatura.update({
      where: { id },
      data: safe,
    });
    return mapCandidatura(row);
  } catch {
    return null;
  }
}

export async function getCandidaturaById(id: string): Promise<Candidatura | undefined> {
  const row = await prisma.candidatura.findUnique({ where: { id } });
  return row ? mapCandidatura(row) : undefined;
}

function mapCandidatura(row: Record<string, unknown>): Candidatura {
  return {
    id: row.id as string,
    criadoEm: (row.criadoEm as Date).toISOString(),
    status: row.status as Candidatura["status"],
    nome: row.nome as string,
    email: row.email as string,
    telefone: row.telefone as string,
    pais: row.pais as string,
    cidade: row.cidade as string,
    perfil: row.perfil as Candidatura["perfil"],
    experiencia: row.experiencia as string,
    setor: row.setor as string,
    empresaAtual: (row.empresaAtual as string) || undefined,
    linkedin: (row.linkedin as string) || undefined,
    modelo: row.modelo as string[],
    capitalDisponivel: row.capitalDisponivel as string,
    prazo: row.prazo as string,
    dedicacao: row.dedicacao as string,
    motivacao: row.motivacao as string,
    diferenciais: row.diferenciais as string,
    disponibilidade: (row.disponibilidade as string) || undefined,
    aceitaNDA: row.aceitaNDA as boolean,
    notas: (row.notas as string) || undefined,
    atribuidoA: (row.atribuidoA as string) || undefined,
  };
}

/* ─── Contatos ─── */

export async function getContatos(): Promise<Contato[]> {
  const rows = await prisma.contato.findMany({
    orderBy: { criadoEm: "desc" },
  });
  return rows.map(mapContato);
}

export async function addContato(
  data: Omit<Contato, "id" | "criadoEm" | "lido" | "arquivado">
): Promise<Contato> {
  const row = await prisma.contato.create({
    data: {
      nome: data.nome,
      email: data.email,
      empresa: data.empresa || null,
      tipo: data.tipo,
      orcamento: data.orcamento || null,
      mensagem: data.mensagem,
      lido: false,
      arquivado: false,
    },
  });
  return mapContato(row);
}

export async function updateContato(
  id: string,
  updates: Partial<Contato>
): Promise<Contato | null> {
  try {
    const { id: _id, criadoEm: _c, ...safe } = updates;
    const row = await prisma.contato.update({
      where: { id },
      data: safe,
    });
    return mapContato(row);
  } catch {
    return null;
  }
}

function mapContato(row: Record<string, unknown>): Contato {
  return {
    id: row.id as string,
    criadoEm: (row.criadoEm as Date).toISOString(),
    lido: row.lido as boolean,
    arquivado: row.arquivado as boolean,
    nome: row.nome as string,
    email: row.email as string,
    empresa: (row.empresa as string) || undefined,
    tipo: row.tipo as string,
    orcamento: (row.orcamento as string) || undefined,
    mensagem: row.mensagem as string,
    notas: (row.notas as string) || undefined,
  };
}

/* ─── Projetos ─── */

export async function getProjetos(): Promise<Projeto[]> {
  const rows = await prisma.projeto.findMany();
  return rows.map(mapProjeto);
}

export async function getProjetoBySlug(slug: string): Promise<Projeto | undefined> {
  const row = await prisma.projeto.findUnique({ where: { slug } });
  return row ? mapProjeto(row) : undefined;
}

export async function addProjeto(data: Projeto): Promise<Projeto> {
  const row = await prisma.projeto.create({
    data: {
      slug: data.slug,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      detalhes: data.detalhes,
      tag: data.tag,
      status: data.status,
      mercado: data.mercado,
      parceiro: data.parceiro || null,
      controle: data.controle,
      icon: data.icon,
      notasInternas: data.notasInternas || null,
      ultimaAtualizacao: new Date(),
    },
  });
  return mapProjeto(row);
}

export async function updateProjeto(
  slug: string,
  updates: Partial<Projeto>
): Promise<Projeto | null> {
  try {
    const row = await prisma.projeto.update({
      where: { slug },
      data: {
        ...updates,
        ultimaAtualizacao: new Date(),
      },
    });
    return mapProjeto(row);
  } catch {
    return null;
  }
}

export async function deleteProjeto(slug: string): Promise<boolean> {
  try {
    await prisma.projeto.delete({ where: { slug } });
    return true;
  } catch {
    return false;
  }
}

function mapProjeto(row: Record<string, unknown>): Projeto {
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

/* ─── Glossário ─── */

export async function getGlossarioDb(): Promise<Termo[]> {
  return prisma.termo.findMany() as unknown as Promise<Termo[]>;
}

export async function addTermo(data: Termo): Promise<Termo> {
  return prisma.termo.create({ data }) as unknown as Promise<Termo>;
}

export async function updateTermo(slug: string, updates: Partial<Termo>): Promise<Termo | null> {
  try {
    return (await prisma.termo.update({
      where: { slug },
      data: updates,
    })) as unknown as Termo;
  } catch {
    return null;
  }
}

export async function deleteTermo(slug: string): Promise<boolean> {
  try {
    await prisma.termo.delete({ where: { slug } });
    return true;
  } catch {
    return false;
  }
}

/* ─── Artigos ─── */

export async function getArtigosDb(): Promise<Artigo[]> {
  return prisma.artigo.findMany() as unknown as Promise<Artigo[]>;
}

export async function addArtigo(data: Artigo): Promise<Artigo> {
  return prisma.artigo.create({ data }) as unknown as Promise<Artigo>;
}

export async function updateArtigo(slug: string, updates: Partial<Artigo>): Promise<Artigo | null> {
  try {
    return (await prisma.artigo.update({
      where: { slug },
      data: updates,
    })) as unknown as Artigo;
  } catch {
    return null;
  }
}

export async function deleteArtigo(slug: string): Promise<boolean> {
  try {
    await prisma.artigo.delete({ where: { slug } });
    return true;
  } catch {
    return false;
  }
}

/* ─── Reunioes Datasets (JSONB) ─── */

export async function getReuniaoDataset(tipo: string): Promise<unknown> {
  const row = await prisma.reuniaoDataset.findUnique({ where: { tipo } });
  return row?.data ?? null;
}

export async function upsertReuniaoDataset(tipo: string, data: unknown): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonData = data as any;
  await prisma.reuniaoDataset.upsert({
    where: { tipo },
    update: { data: jsonData },
    create: { tipo, data: jsonData },
  });
}
