import { NextResponse } from "next/server";
import { getReuniaoDataset } from "@/lib/db";

const SHARE_TOKEN = process.env.REUNIOES_TOKEN;

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr + "T12:00:00").getTime()) / 86400000);
}

function healthScore(p: { dataUltima: string; prioridade: string; checkDone: number; checkTotal: number; totalAcoes: number; responsavel: string }) {
  let s = 0;
  const d = daysSince(p.dataUltima);
  s += d <= 7 ? 30 : d <= 14 ? 21 : d <= 30 ? 12 : 3;
  s += p.checkTotal > 0 ? Math.round((p.checkDone / p.checkTotal) * 25) : 10;
  s += p.totalAcoes > 10 ? 20 : p.totalAcoes > 5 ? 15 : p.totalAcoes > 0 ? 10 : 0;
  s += p.responsavel ? 15 : 0;
  const pw: Record<string, number> = { critica: 10, alta: 8, media: 6, baixa: 4 };
  if (d <= 14) s += pw[p.prioridade] || 4;
  return Math.min(100, s);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== SHARE_TOKEN) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const [reunioes, analise, roadmaps, kanban] = await Promise.all([
    getReuniaoDataset("reunioes"),
    getReuniaoDataset("analise"),
    getReuniaoDataset("roadmaps"),
    getReuniaoDataset("kanban"),
  ]) as [unknown[], Record<string, unknown>, Record<string, unknown>, Record<string, unknown>];

  // Build project portfolio with health scores
  const cards = (kanban.cards as Record<string, unknown>[]) || [];
  const projects = cards.map((card) => {
    const checklist = (card.checklist as { feito: boolean }[]) || [];
    const checkDone = checklist.filter((c) => c.feito).length;
    const checkTotal = checklist.length;
    const score = healthScore({
      dataUltima: card.dataUltima as string,
      prioridade: card.prioridade as string,
      checkDone,
      checkTotal,
      totalAcoes: card.totalAcoes as number,
      responsavel: card.responsavel as string,
    });
    return {
      id: card.id,
      nome: card.nome,
      descricao: card.descricao,
      coluna: card.coluna,
      prioridade: card.prioridade,
      categoria: card.categoria,
      responsavel: card.responsavel,
      dataUltima: card.dataUltima,
      totalReunioes: card.totalReunioes,
      totalAcoes: card.totalAcoes,
      checkDone,
      checkTotal,
      health: score,
      notas: card.notas,
    };
  });

  // Alerts
  const alerts: { tipo: string; titulo: string; descricao: string; link: string; cor: string }[] = [];

  // Critical projects inactive
  projects.forEach((p) => {
    if (p.prioridade === "critica" && daysSince(p.dataUltima as string) > 7) {
      alerts.push({ tipo: "risco", titulo: `${p.nome} sem atividade`, descricao: `Prioridade critica, ${daysSince(p.dataUltima as string)} dias sem reuniao`, link: `/reunioes/kanban`, cor: "red" });
    }
  });

  // Low health projects
  projects.forEach((p) => {
    if ((p.health as number) < 40 && p.prioridade !== "baixa") {
      alerts.push({ tipo: "atencao", titulo: `${p.nome} (score ${p.health})`, descricao: `Saude baixa — verificar progresso`, link: `/reunioes/roadmaps`, cor: "amber" });
    }
  });

  // Recurring discussions
  const analiseTyped = analise as { insights?: { discussoesRecorrentes?: { tema: string; vezes: number; dias: number }[]; temasEmergentes?: unknown[] }; acoes?: { total?: number; recentes?: unknown[] }; pessoas?: unknown[] };
  const recurring = (analiseTyped.insights?.discussoesRecorrentes || []).filter((d) => d.vezes >= 6).slice(0, 3);
  recurring.forEach((d) => {
    alerts.push({ tipo: "decisao", titulo: `"${d.tema}" discutido ${d.vezes}x`, descricao: `${d.dias} dias sem resolucao aparente`, link: `/reunioes/inteligencia`, cor: "violet" });
  });

  // Recent meetings (last 7 days)
  const reunioesArr = reunioes as { data: string; participantes?: string[] }[];
  const recentMeetings = reunioesArr.filter((r) => daysSince(r.data) <= 7).slice(0, 8);

  // Top people (last 30 days)
  const peopleLast30: Record<string, number> = {};
  reunioesArr.filter((r) => daysSince(r.data) <= 30).forEach((r) => {
    (r.participantes || []).forEach((p: string) => {
      const name = p.replace(/\s*\(.*?\)\s*/g, "").trim();
      if (name.length > 1) peopleLast30[name] = (peopleLast30[name] || 0) + 1;
    });
  });
  const activePeople = Object.entries(peopleLast30).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([nome, count]) => ({ nome, count }));

  // Emerging topics
  const emerging = (analiseTyped.insights?.temasEmergentes || []).slice(0, 6);

  // Next actions across all roadmaps
  const roadmapsTyped = roadmaps as { roadmaps?: { nome: string; proximosPassos: { acao: string; data: string }[] }[] };
  const nextActions: { acao: string; projeto: string; data: string }[] = [];
  (roadmapsTyped.roadmaps || []).forEach((rm) => {
    (rm.proximosPassos || []).slice(0, 3).forEach((ps) => {
      nextActions.push({ acao: ps.acao, projeto: rm.nome, data: ps.data });
    });
  });
  nextActions.sort((a, b) => b.data.localeCompare(a.data));

  // Column distribution
  const colDist: Record<string, number> = {};
  projects.forEach((p) => {
    colDist[p.coluna as string] = (colDist[p.coluna as string] || 0) + 1;
  });

  return NextResponse.json({
    totalReunioes: reunioesArr.length,
    totalProjetos: projects.length,
    totalAcoes: analiseTyped.acoes?.total || 0,
    totalPessoas: analiseTyped.pessoas?.length || 0,
    projects,
    alerts: alerts.slice(0, 6),
    recentMeetings,
    activePeople,
    emerging,
    nextActions: nextActions.slice(0, 15),
    colDist,
  });
}
