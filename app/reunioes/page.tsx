"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SharedHeader } from "@/components/reunioes/SharedHeader";
import { HealthRing } from "@/components/reunioes/HealthRing";
import { stagger, fadeUp } from "@/lib/reunioes/animations";
import { prioConfig, statusConfig, getTagColor, catIconColors } from "@/lib/reunioes/constants";
import { formatDateShort, slugify, daysSince } from "@/lib/reunioes/utils";
import {
  Shield, AlertTriangle, Zap, TrendingUp, CalendarDays, ListChecks,
  Users, Map, ChevronRight, ArrowRight, Target, Clock, Layers,
  CheckCircle2, MessageSquare, User, Lightbulb, Flag,
} from "lucide-react";

interface Project {
  id: string; nome: string; descricao: string; coluna: string; prioridade: string;
  categoria: string; responsavel: string; dataUltima: string; totalReunioes: number;
  totalAcoes: number; checkDone: number; checkTotal: number; health: number; notas: string;
}

interface HubData {
  totalReunioes: number; totalProjetos: number; totalAcoes: number; totalPessoas: number;
  projects: Project[];
  alerts: { tipo: string; titulo: string; descricao: string; link: string; cor: string }[];
  recentMeetings: { titulo: string; data: string; participantes?: string[]; acoes?: string[]; tags?: string[] }[];
  activePeople: { nome: string; count: number }[];
  emerging: { tema: string; recente: number; anterior: number }[];
  nextActions: { acao: string; projeto: string; data: string }[];
  colDist: Record<string, number>;
}

const alertColors: Record<string, { bg: string; border: string; icon: string; dot: string }> = {
  red: { bg: "bg-red-500/[0.04]", border: "border-red-500/15", icon: "text-red-500", dot: "bg-red-500" },
  amber: { bg: "bg-amber-500/[0.04]", border: "border-amber-500/15", icon: "text-amber-500", dot: "bg-amber-500" },
  violet: { bg: "bg-violet-500/[0.04]", border: "border-violet-500/15", icon: "text-violet-500", dot: "bg-violet-500" },
};

export default function HubPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [data, setData] = useState<HubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); setError(true); return; }
    fetch(`/api/reunioes/hub?token=${encodeURIComponent(token)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setLoading(false); setError(true); });
  }, [token]);

  if (error || (!loading && !token)) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-black/[0.04] shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5"><Shield className="w-7 h-7 text-red-500" /></div>
          <h1 className="text-xl font-bold text-foreground font-display tracking-tight mb-2">Acesso restrito</h1>
          <p className="text-sm text-muted">Token invalido.</p>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Carregando hub...</p>
        </div>
      </div>
    );
  }

  const projectsByHealth = [...data.projects].sort((a, b) => a.health - b.health);
  const colLabels: Record<string, string> = { planejamento: "Plan.", em_desenvolvimento: "Dev.", em_andamento: "Ativo", pausado: "Pausa", concluido: "Done" };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <SharedHeader active="hub" subtitle={`${data.totalProjetos} projetos · ${data.totalReunioes} reunioes`} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-5 lg:p-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

          {/* PULSO - Alerts */}
          {data.alerts.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Pulso</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.alerts.map((alert, i) => {
                  const ac = alertColors[alert.cor] || alertColors.amber;
                  return (
                    <a key={i} href={`${alert.link}?token=${token}`} className={`flex items-start gap-3 p-3.5 rounded-xl border ${ac.bg} ${ac.border} hover:shadow-md transition-all group`}>
                      <div className={`w-2 h-2 rounded-full ${ac.dot} mt-1.5 shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-foreground leading-tight">{alert.titulo}</p>
                        <p className="text-[11px] text-muted mt-0.5">{alert.descricao}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted/30 group-hover:text-muted mt-0.5 shrink-0 ml-auto transition-colors" />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* KPIs */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: CalendarDays, value: data.totalReunioes, label: "Reunioes", color: "text-blue-500", bg: "from-blue-500/10 to-blue-600/5" },
              { icon: Layers, value: data.totalProjetos, label: "Projetos", color: "text-indigo-500", bg: "from-indigo-500/10 to-indigo-600/5" },
              { icon: ListChecks, value: data.totalAcoes, label: "Acoes", color: "text-emerald-500", bg: "from-emerald-500/10 to-emerald-600/5" },
              { icon: Users, value: data.totalPessoas, label: "Pessoas", color: "text-violet-500", bg: "from-violet-500/10 to-violet-600/5" },
              { icon: Target, value: data.projects.filter(p => p.health >= 70).length, label: "Saudaveis", color: "text-emerald-500", bg: "from-emerald-500/10 to-emerald-600/5" },
              { icon: AlertTriangle, value: data.projects.filter(p => p.health < 40).length, label: "Em risco", color: "text-red-500", bg: "from-red-500/10 to-red-600/5" },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-2xl border border-black/[0.04] p-4 hover:shadow-md transition-all duration-300">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${kpi.bg} flex items-center justify-center mb-2.5`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <p className="text-xl font-bold text-foreground tracking-tight">{kpi.value}</p>
                  <p className="text-[10px] text-muted uppercase tracking-wider font-medium">{kpi.label}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Portfolio de Projetos */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-2 mb-3">
              <Map className="w-4 h-4 text-amber-500" />
              <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Portfolio de Projetos</h2>
              <div className="flex-1" />
              {/* Column distribution */}
              <div className="flex items-center gap-1.5">
                {Object.entries(data.colDist).filter(([, v]) => v > 0).map(([col, count]) => {
                  const st = statusConfig[col];
                  return (
                    <span key={col} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${st?.bg || ""} ${st?.color || "text-muted"}`}>
                      {colLabels[col] || col} {count}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {data.projects.sort((a, b) => {
                const po: Record<string, number> = { critica: 0, alta: 1, media: 2, baixa: 3 };
                return (po[a.prioridade] ?? 9) - (po[b.prioridade] ?? 9);
              }).map((p) => {
                const prio = prioConfig[p.prioridade];
                const days = daysSince(p.dataUltima);
                return (
                  <a key={p.id} href={`/reunioes/roadmaps?token=${token}`} className="bg-white rounded-xl border border-black/[0.04] p-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                    <div className="flex items-start gap-2 mb-2">
                      <HealthRing score={p.health} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${prio?.dot || "bg-muted"}`} />
                          <span className={`text-[8px] font-bold uppercase tracking-wider ${catIconColors[p.categoria] || "text-muted"}`}>{p.categoria}</span>
                        </div>
                        <h4 className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">{p.nome}</h4>
                      </div>
                    </div>
                    {/* Checklist bar */}
                    {p.checkTotal > 0 && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(p.checkDone / p.checkTotal) * 100}%` }} />
                        </div>
                        <span className="text-[8px] text-muted">{p.checkDone}/{p.checkTotal}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[9px] text-muted">
                      <span>{p.totalReunioes}r</span>
                      <span className="opacity-30">·</span>
                      {days <= 7 ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />Ativo</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{days}d</span>
                      )}
                      {p.responsavel && (
                        <>
                          <span className="opacity-30">·</span>
                          <span className="truncate">{p.responsavel.split(" ")[0]}</span>
                        </>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Ultimas reunioes */}
            <motion.div variants={fadeUp} className="lg:col-span-2 bg-white rounded-2xl border border-black/[0.04] p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Ultimos 7 Dias</h2>
                <div className="flex-1" />
                <a href={`/reunioes/timeline?token=${token}`} className="text-[11px] text-accent font-medium flex items-center gap-1 hover:underline">
                  Ver todas <ChevronRight className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-2">
                {data.recentMeetings.length === 0 && <p className="text-[12px] text-muted py-4 text-center">Nenhuma reuniao nos ultimos 7 dias</p>}
                {data.recentMeetings.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f8f9fb] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[13px] font-bold text-foreground leading-none">{new Date(m.data + "T12:00:00").getDate()}</span>
                      <span className="text-[8px] text-muted uppercase">{new Date(m.data + "T12:00:00").toLocaleDateString("pt-BR", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground leading-tight">{m.titulo}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted">
                        {m.participantes && <span><Users className="w-3 h-3 inline -mt-0.5" /> {m.participantes.length}</span>}
                        {m.acoes && m.acoes.length > 0 && <span><CheckCircle2 className="w-3 h-3 inline -mt-0.5 text-emerald-500" /> {m.acoes.length} acoes</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 max-w-[120px] justify-end">
                      {(m.tags || []).slice(0, 2).map((t) => (
                        <span key={t} className={`text-[8px] font-medium px-1.5 py-0.5 rounded ${getTagColor(t)}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Active people */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-violet-500" />
                  <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Pessoas Ativas</h2>
                </div>
                <div className="space-y-1">
                  {data.activePeople.map((p) => (
                    <a key={p.nome} href={`/reunioes/pessoas/${slugify(p.nome)}?token=${token}`} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-[#f8f9fb] transition-colors group">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/10 to-violet-600/5 flex items-center justify-center text-[9px] font-bold text-violet-600 shrink-0">{p.nome.charAt(0)}</div>
                      <span className="text-[12px] text-foreground flex-1 truncate group-hover:text-accent transition-colors">{p.nome}</span>
                      <span className="text-[10px] text-muted">{p.count}r</span>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Emerging topics */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Emergentes</h2>
                </div>
                <div className="space-y-1.5">
                  {data.emerging.map((t) => (
                    <div key={t.tema} className="flex items-center gap-2 px-2 py-1">
                      <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getTagColor(t.tema)}`}>{t.tema}</span>
                      <div className="flex-1" />
                      <span className="text-[9px] text-muted">{t.anterior}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600">{t.recente}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Proximos Passos Consolidados */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="w-4 h-4 text-accent" />
              <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Proximos Passos</h2>
              <span className="text-[10px] text-muted">Consolidado de todos os projetos</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
              {data.nextActions.map((a, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <ArrowRight className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-foreground leading-relaxed">{a.acao}</p>
                    <p className="text-[9px] text-muted">{a.projeto} · {formatDateShort(a.data)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </main>

      <footer className="border-t border-black/[0.04] py-4">
        <p className="text-center text-[11px] text-muted/50">Grupo +351 · Hub de Governanca</p>
      </footer>
    </div>
  );
}
