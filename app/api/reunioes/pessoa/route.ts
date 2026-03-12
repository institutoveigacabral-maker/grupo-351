import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const SHARE_TOKEN = process.env.REUNIOES_TOKEN || "r351-gov-2026";

function readJSON(name: string) {
  return JSON.parse(readFileSync(join(process.cwd(), "data", name), "utf-8"));
}

function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== SHARE_TOKEN) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const reunioes = readJSON("reunioes.json");
  const analise = readJSON("reunioes-analise.json");
  const roadmaps = readJSON("reunioes-roadmaps.json");

  // Find person in analise
  const person = (analise.pessoas || []).find((p: { nome: string }) => slugify(p.nome) === slug);

  // Find all meetings this person participated in
  const meetings = reunioes.filter((r: { participantes?: string[] }) =>
    (r.participantes || []).some((p: string) => {
      const clean = p.replace(/\s*\(.*?\)\s*/g, "").trim();
      return slugify(clean) === slug;
    })
  ).map((r: { titulo: string; data: string; tags?: string[]; acoes?: string[]; participantes?: string[] }) => ({
    titulo: r.titulo,
    data: r.data,
    tags: (r.tags || []).slice(0, 5),
    totalAcoes: (r.acoes || []).length,
    participantes: (r.participantes || []).length,
  }));

  // Find roadmaps involving this person
  const relatedProjects = (roadmaps.roadmaps || []).filter((rm: { participantesChave: string[] }) =>
    (rm.participantesChave || []).some((p: string) => slugify(p) === slug)
  ).map((rm: { id: string; nome: string; status: string; prioridade: string; totalReunioes: number; categoria: string }) => ({
    id: rm.id,
    nome: rm.nome,
    status: rm.status,
    prioridade: rm.prioridade,
    totalReunioes: rm.totalReunioes,
    categoria: rm.categoria,
  }));

  // Actions attributed to this person
  const actions = (analise.acoes?.recentes || []).filter((a: { responsavel: string | null }) =>
    a.responsavel && slugify(a.responsavel) === slug
  ).slice(0, 15);

  const nome = person?.nome || slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return NextResponse.json({
    nome,
    slug,
    totalReunioes: person?.totalReunioes || meetings.length,
    primeiraReuniao: person?.primeiraReuniao || meetings[meetings.length - 1]?.data,
    ultimaReuniao: person?.ultimaReuniao || meetings[0]?.data,
    temasPrincipais: person?.temasPrincipais || [],
    conexoes: person?.conexoes || [],
    meetings,
    projects: relatedProjects,
    actions,
  });
}
