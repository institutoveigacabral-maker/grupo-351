"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SharedHeader } from "@/components/reunioes/SharedHeader";
import {
  Map,
  ChevronDown,
  CalendarDays,
  ListChecks,
  Users,
  Target,
  Shield,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Milestone,
  Filter,
  X,
  ChevronRight,
  Layers,
  TrendingUp,
  Flag,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface Phase {
  fase: number;
  periodo: string;
  marcos: {
    data: string;
    titulo: string;
    resumo: string;
    acoes: string[];
    participantes: string[];
    tags: string[];
  }[];
}

interface Roadmap {
  id: string;
  nome: string;
  descricao: string;
  status: string;
  categoria: string;
  prioridade: string;
  totalReunioes: number;
  totalAcoes: number;
  periodo: string;
  dataInicio: string;
  dataUltima: string;
  participantesChave: string[];
  tagsPrincipais: string[];
  fases: Phase[];
  decisoesChave: { data: string; decisao: string; reuniao: string }[];
  proximosPassos: { acao: string; data: string }[];
  cronologia: { data: string; titulo: string; resumo: string }[];
}

interface Data {
  geradoEm: string;
  totalRoadmaps: number;
  totalReunioes: number;
  roadmaps: Roadmap[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  em_andamento: { label: "Em andamento", color: "text-blue-600", bg: "bg-blue-500/10", icon: TrendingUp },
  em_desenvolvimento: { label: "Em desenvolvimento", color: "text-amber-600", bg: "bg-amber-500/10", icon: Clock },
  planejamento: { label: "Planejamento", color: "text-violet-600", bg: "bg-violet-500/10", icon: Circle },
  concluido: { label: "Concluido", color: "text-emerald-600", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  pausado: { label: "Pausado", color: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle },
};

const prioridadeConfig: Record<string, { label: string; color: string; dot: string }> = {
  critica: { label: "Crítica", color: "text-red-600 bg-red-500/10", dot: "bg-red-500" },
  alta: { label: "Alta", color: "text-orange-600 bg-orange-500/10", dot: "bg-orange-500" },
  media: { label: "Média", color: "text-blue-600 bg-blue-500/10", dot: "bg-blue-500" },
  baixa: { label: "Baixa", color: "text-muted bg-black/[0.04]", dot: "bg-muted" },
};

const catColors: Record<string, string> = {
  Estrategico: "from-red-500/15 to-red-600/5",
  Operacional: "from-orange-500/15 to-orange-600/5",
  Expansao: "from-blue-500/15 to-blue-600/5",
  Tecnologia: "from-violet-500/15 to-violet-600/5",
  Wellness: "from-green-500/15 to-green-600/5",
  Franquia: "from-emerald-500/15 to-emerald-600/5",
  "E-commerce": "from-purple-500/15 to-purple-600/5",
  Plataforma: "from-indigo-500/15 to-indigo-600/5",
  Holding: "from-slate-500/15 to-slate-600/5",
  Conteudo: "from-pink-500/15 to-pink-600/5",
  Mobilidade: "from-cyan-500/15 to-cyan-600/5",
  "Nova Vertical": "from-amber-500/15 to-amber-600/5",
};

const catIconColors: Record<string, string> = {
  Estrategico: "text-red-500",
  Operacional: "text-orange-500",
  Expansao: "text-blue-500",
  Tecnologia: "text-violet-500",
  Wellness: "text-green-500",
  Franquia: "text-emerald-500",
  "E-commerce": "text-purple-500",
  Plataforma: "text-indigo-500",
  Holding: "text-slate-500",
  Conteudo: "text-pink-500",
  Mobilidade: "text-cyan-500",
  "Nova Vertical": "text-amber-500",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function daysSince(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RoadmapsPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPrioridade, setFilterPrioridade] = useState<string | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!token) { queueMicrotask(() => { setLoading(false); setError(true); }); return; }
    fetch(`/api/reunioes/roadmaps?token=${encodeURIComponent(token)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setLoading(false); setError(true); });
  }, [token]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.roadmaps.filter((r) => {
      if (filterPrioridade && r.prioridade !== filterPrioridade) return false;
      if (filterCategoria && r.categoria !== filterCategoria) return false;
      return true;
    });
  }, [data, filterPrioridade, filterCategoria]);

  const categorias = useMemo(() => {
    if (!data) return [];
    const cats = new Set(data.roadmaps.map((r) => r.categoria));
    return Array.from(cats).sort();
  }, [data]);

  if (error || (!loading && !token)) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border border-black/[0.04] shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5"><Shield className="w-7 h-7 text-red-500" /></div>
          <h1 className="text-xl font-bold text-foreground font-display tracking-tight mb-2">Acesso restrito</h1>
          <p className="text-sm text-muted">Token invalido.</p>
        </motion.div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Compilando roadmaps...</p>
        </div>
      </div>
    );
  }

  const totalAcoes = data.roadmaps.reduce((s, r) => s + r.totalAcoes, 0);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <SharedHeader active="roadmaps" subtitle={`${data.totalRoadmaps} projetos mapeados`} />

      <main className="max-w-6xl mx-auto p-5 lg:p-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

          {/* KPIs */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Map, label: "Projetos ativos", value: data.roadmaps.filter(r => r.status === "em_andamento").length, sub: `de ${data.totalRoadmaps} mapeados`, color: "from-amber-500/10 to-amber-600/5", iconColor: "text-amber-500" },
              { icon: ListChecks, label: "Acoes totais", value: totalAcoes, sub: `${(totalAcoes / data.totalRoadmaps).toFixed(0)} media por projeto`, color: "from-emerald-500/10 to-emerald-600/5", iconColor: "text-emerald-500" },
              { icon: Flag, label: "Prioridade critica", value: data.roadmaps.filter(r => r.prioridade === "critica").length + data.roadmaps.filter(r => r.prioridade === "alta").length, sub: "critica + alta", color: "from-red-500/10 to-red-600/5", iconColor: "text-red-500" },
              { icon: Layers, label: "Categorias", value: categorias.length, sub: "verticais distintas", color: "from-violet-500/10 to-violet-600/5", iconColor: "text-violet-500" },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-md transition-all duration-300">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                    <Icon className={`w-[18px] h-[18px] ${kpi.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</p>
                  <p className="text-[11px] text-muted mt-0.5 uppercase tracking-wider font-medium">{kpi.sub}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Overview grid - mini cards */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
            <h2 className="text-[15px] font-semibold text-foreground mb-4">Visão Geral</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {data.roadmaps.map((rm) => {
                const prio = prioridadeConfig[rm.prioridade];
                const st = statusConfig[rm.status];
                const days = daysSince(rm.dataUltima);
                return (
                  <button
                    key={rm.id}
                    onClick={() => setExpandedId(expandedId === rm.id ? null : rm.id)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                      expandedId === rm.id
                        ? "border-accent/30 bg-accent/[0.03] shadow-md"
                        : "border-black/[0.04] hover:border-black/[0.08] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${prio?.dot || "bg-muted"}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${st?.color || "text-muted"}`}>
                        {st?.label.split(" ")[0] || rm.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2 mb-1.5">{rm.nome}</p>
                    <div className="flex items-center gap-2 text-[9px] text-muted">
                      <span>{rm.totalReunioes}r</span>
                      <span>·</span>
                      <span>{rm.totalAcoes}a</span>
                      {days <= 7 && <Zap className="w-2.5 h-2.5 text-amber-500 ml-auto" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider mr-1">Filtrar:</span>
            {/* Priority filters */}
            {["critica", "alta", "media"].map((p) => {
              const cfg = prioridadeConfig[p];
              return (
                <button
                  key={p}
                  onClick={() => setFilterPrioridade(filterPrioridade === p ? null : p)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    filterPrioridade === p ? cfg.color + " ring-1 ring-current/20" : "text-muted hover:text-foreground bg-white border border-black/[0.04]"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </button>
              );
            })}
            <div className="w-px h-4 bg-border mx-1" />
            {/* Category filters */}
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategoria(filterCategoria === cat ? null : cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  filterCategoria === cat ? "bg-accent/10 text-accent ring-1 ring-accent/20" : "text-muted hover:text-foreground bg-white border border-black/[0.04]"
                }`}
              >
                {cat}
              </button>
            ))}
            {(filterPrioridade || filterCategoria) && (
              <button onClick={() => { setFilterPrioridade(null); setFilterCategoria(null); }} className="text-[11px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1 ml-1">
                <X className="w-3 h-3" /> Limpar
              </button>
            )}
          </motion.div>

          {/* Roadmap cards */}
          <div className="space-y-3">
            {filtered.map((rm) => {
              const isOpen = expandedId === rm.id;
              const st = statusConfig[rm.status];
              const prio = prioridadeConfig[rm.prioridade];
              const StatusIcon = st?.icon || Circle;
              const days = daysSince(rm.dataUltima);
              const currentPhase = activePhase[rm.id] ?? (rm.fases.length - 1);

              return (
                <motion.div key={rm.id} variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden hover:shadow-md transition-all duration-300">
                  {/* Card header */}
                  <button onClick={() => setExpandedId(isOpen ? null : rm.id)} className="w-full flex items-start gap-4 p-5 text-left">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${catColors[rm.categoria] || "from-slate-500/15 to-slate-600/5"} flex items-center justify-center shrink-0`}>
                      <Map className={`w-5 h-5 ${catIconColors[rm.categoria] || "text-slate-500"}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">{rm.nome}</h3>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${prio?.color || ""}`}>
                          {prio?.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted leading-relaxed line-clamp-2 mb-2">{rm.descricao}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                        <span className={`flex items-center gap-1 font-medium ${st?.color || ""}`}>
                          <StatusIcon className="w-3 h-3" /> {st?.label || rm.status}
                        </span>
                        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{rm.totalReunioes} reunioes</span>
                        <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" />{rm.totalAcoes} acoes</span>
                        <span className="flex items-center gap-1"><Milestone className="w-3 h-3" />{rm.fases.length} fase{rm.fases.length !== 1 ? "s" : ""}</span>
                        {days <= 7 ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium"><Zap className="w-3 h-3" />Ativo esta semana</span>
                        ) : (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{days}d desde ultima</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex -space-x-1.5">
                        {rm.participantesChave.slice(0, 4).map((p, pi) => (
                          <div key={pi} className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-2 border-white flex items-center justify-center text-[8px] font-bold text-violet-600">
                            {p.charAt(0)}
                          </div>
                        ))}
                        {rm.participantesChave.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-black/[0.04] border-2 border-white flex items-center justify-center text-[8px] font-bold text-muted">
                            +{rm.participantesChave.length - 4}
                          </div>
                        )}
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4 text-muted/40" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-black/[0.04]">

                          {/* Phase navigation */}
                          {rm.fases.length > 1 && (
                            <div className="px-5 pt-4">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Fases</span>
                              </div>
                              <div className="flex gap-1.5">
                                {rm.fases.map((fase, fi) => (
                                  <button
                                    key={fi}
                                    onClick={() => setActivePhase(prev => ({ ...prev, [rm.id]: fi }))}
                                    className={`flex-1 py-2 px-3 rounded-lg text-[11px] font-medium transition-all ${
                                      currentPhase === fi
                                        ? "bg-accent/10 text-accent border border-accent/20"
                                        : "bg-[#f5f5f7] text-muted hover:text-foreground"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold">F{fase.fase}</span>
                                      <span className="opacity-70 truncate">{fase.periodo}</span>
                                    </div>
                                    <div className="text-[9px] opacity-60 mt-0.5">{fase.marcos.length} marcos</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="p-5 grid lg:grid-cols-3 gap-5">
                            {/* Left: Timeline */}
                            <div className="lg:col-span-2 space-y-4">
                              {/* Phase milestones */}
                              <div>
                                <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-3">
                                  Cronologia {rm.fases.length > 1 ? `· Fase ${rm.fases[currentPhase]?.fase}` : ""}
                                </p>
                                <div className="space-y-0">
                                  {(rm.fases[currentPhase]?.marcos || rm.cronologia).map((ev, ei, arr) => (
                                    <div key={ei} className="flex gap-3 group">
                                      <div className="flex flex-col items-center">
                                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${ei === arr.length - 1 ? "bg-accent ring-4 ring-accent/10" : "bg-black/[0.12]"}`} />
                                        {ei < arr.length - 1 && <div className="w-px flex-1 bg-black/[0.06] group-hover:bg-accent/20 transition-colors" />}
                                      </div>
                                      <div className="pb-4 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[10px] text-muted font-medium bg-[#f5f5f7] px-1.5 py-0.5 rounded">{formatDate(ev.data)}</span>
                                          {ei === arr.length - 1 && <span className="text-[9px] font-bold text-accent uppercase tracking-wider">Mais recente</span>}
                                        </div>
                                        <p className="text-[13px] font-medium text-foreground mt-1">{ev.titulo}</p>
                                        {ev.resumo && <p className="text-[12px] text-muted leading-relaxed mt-1">{ev.resumo}</p>}
                                        {/* Show actions for this milestone */}
                                        {"acoes" in ev && (ev as Phase["marcos"][0]).acoes?.length > 0 && (
                                          <div className="mt-2 space-y-1">
                                            {(ev as Phase["marcos"][0]).acoes.slice(0, 3).map((a, ai) => (
                                              <div key={ai} className="flex items-start gap-1.5">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="text-[11px] text-muted">{a}</span>
                                              </div>
                                            ))}
                                            {(ev as Phase["marcos"][0]).acoes.length > 3 && (
                                              <span className="text-[10px] text-muted/50 pl-4.5">+{(ev as Phase["marcos"][0]).acoes.length - 3} mais</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Key decisions */}
                              {rm.decisoesChave.length > 0 && (
                                <div>
                                  <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2">Decisões-chave</p>
                                  <div className="space-y-2">
                                    {rm.decisoesChave.map((d, di) => (
                                      <div key={di} className="flex gap-3 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10">
                                        <Flag className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                        <div>
                                          <p className="text-[12px] text-foreground leading-relaxed">{d.decisao}</p>
                                          <p className="text-[10px] text-muted mt-1">{formatDate(d.data)} · {d.reuniao}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right: Sidebar info */}
                            <div className="space-y-4">
                              {/* Participants */}
                              <div className="bg-[#f8f9fb] rounded-xl p-4">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Participantes-chave</p>
                                <div className="space-y-1.5">
                                  {rm.participantesChave.map((p) => (
                                    <div key={p} className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/10 to-violet-600/5 flex items-center justify-center text-[9px] font-bold text-violet-600">{p.charAt(0)}</div>
                                      <span className="text-[12px] text-foreground">{p}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Next steps */}
                              <div className="bg-[#f8f9fb] rounded-xl p-4">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Proximos passos</p>
                                <div className="space-y-1.5">
                                  {rm.proximosPassos.slice(0, 6).map((ps, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <ArrowRight className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                                      <div>
                                        <p className="text-[11px] text-foreground leading-relaxed">{ps.acao}</p>
                                        <p className="text-[9px] text-muted">{formatDate(ps.data)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Tags */}
                              <div className="bg-[#f8f9fb] rounded-xl p-4">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Temas</p>
                                <div className="flex flex-wrap gap-1">
                                  {rm.tagsPrincipais.map((t) => (
                                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-black/[0.04] text-muted">{t}</span>
                                  ))}
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="bg-[#f8f9fb] rounded-xl p-4">
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Numeros</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-lg font-bold text-foreground">{rm.totalReunioes}</p>
                                    <p className="text-[9px] text-muted uppercase">Reunioes</p>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-foreground">{rm.totalAcoes}</p>
                                    <p className="text-[9px] text-muted uppercase">Acoes</p>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-foreground">{rm.fases.length}</p>
                                    <p className="text-[9px] text-muted uppercase">Fases</p>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-foreground">{rm.decisoesChave.length}</p>
                                    <p className="text-[9px] text-muted uppercase">Decisões</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Map className="w-10 h-10 text-muted/20 mx-auto mb-3" />
              <p className="text-muted text-sm">Nenhum roadmap encontrado com esses filtros</p>
            </div>
          )}

        </motion.div>
      </main>

      <footer className="border-t border-black/[0.04] py-6 mt-12">
        <p className="text-center text-[11px] text-muted/50">Grupo +351 · Roadmaps de Governança · Acesso restrito por link</p>
      </footer>
    </div>
  );
}
