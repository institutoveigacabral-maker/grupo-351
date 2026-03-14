import { NextResponse } from "next/server";
import { getReuniaoDataset } from "@/lib/db";

const SHARE_TOKEN = process.env.REUNIOES_TOKEN || "r351-gov-2026";

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

  const [reunioes, analise, roadmaps] = await Promise.all([
    getReuniaoDataset("reunioes"),
    getReuniaoDataset("analise"),
    getReuniaoDataset("roadmaps"),
  ]) as [unknown[], Record<string, unknown>, Record<string, unknown>];

  const reunioesArr = reunioes as { titulo: string; data: string; tags?: string[]; acoes?: string[]; participantes?: string[] }[];
  const analiseTyped = analise as { pessoas?: { nome: string; totalReunioes?: number; primeiraReuniao?: string; ultimaReuniao?: string; temasPrincipais?: string[]; conexoes?: string[] }[]; acoes?: { recentes?: { responsavel: string | null }[] } };
  const roadmapsTyped = roadmaps as { roadmaps?: { id: string; nome: string; status: string; prioridade: string; totalReunioes: number; categoria: string; participantesChave: string[] }[] };

  // Find person in analise
  const person = (analiseTyped.pessoas || []).find((p) => slugify(p.nome) === slug);

  // Find all meetings this person participated in
  const meetings = reunioesArr.filter((r) =>
    (r.participantes || []).some((p: string) => {
      const clean = p.replace(/\s*\(.*?\)\s*/g, "").trim();
      return slugify(clean) === slug;
    })
  ).map((r) => ({
    titulo: r.titulo,
    data: r.data,
    tags: (r.tags || []).slice(0, 5),
    totalAcoes: (r.acoes || []).length,
    participantes: (r.participantes || []).length,
  }));

  // Find roadmaps involving this person
  const relatedProjects = (roadmapsTyped.roadmaps || []).filter((rm) =>
    (rm.participantesChave || []).some((p: string) => slugify(p) === slug)
  ).map((rm) => ({
    id: rm.id,
    nome: rm.nome,
    status: rm.status,
    prioridade: rm.prioridade,
    totalReunioes: rm.totalReunioes,
    categoria: rm.categoria,
  }));

  // Actions attributed to this person
  const actions = (analiseTyped.acoes?.recentes || []).filter((a) =>
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
