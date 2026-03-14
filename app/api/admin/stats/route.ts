import { NextResponse } from "next/server";
import { getCandidaturas, getContatos } from "@/lib/db";
import { getProjetos } from "@/lib/projetos";
import { getGlossario, getArtigos } from "@/lib/conhecimento";
import type { DashboardStats } from "@/lib/admin-types";

export async function GET() {
  const [candidaturas, contatos, allProjetos, glossario, artigos] = await Promise.all([
    getCandidaturas(),
    getContatos(),
    getProjetos(),
    getGlossario(),
    getArtigos(),
  ]);

  const stats: DashboardStats = {
    candidaturas: {
      total: candidaturas.length,
      novas: candidaturas.filter((c) => c.status === "nova").length,
      emAnalise: candidaturas.filter((c) => c.status === "em-analise").length,
      entrevista: candidaturas.filter((c) => c.status === "entrevista").length,
      aprovadas: candidaturas.filter((c) => c.status === "aprovada").length,
      recusadas: candidaturas.filter((c) => c.status === "recusada").length,
    },
    contatos: {
      total: contatos.length,
      naoLidos: contatos.filter((c) => !c.lido).length,
    },
    projetos: {
      emOperacao: allProjetos.filter((p) => p.status === "Em operação").length,
      emDesenvolvimento: allProjetos.filter((p) => p.status === "Em desenvolvimento").length,
      emEstruturacao: allProjetos.filter((p) => p.status === "Em estruturação").length,
    },
    conhecimento: {
      termos: glossario.length,
      artigos: artigos.length,
    },
  };

  return NextResponse.json(stats);
}
