"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SharedHeader } from "@/components/reunioes/SharedHeader";
import {
  Brain,
  Network,
  Users,
  ListChecks,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Target,
  Zap,
  ArrowRight,
  BarChart3,
  Shield,
  Search,
  X,
  Layers,
  GitBranch,
  Clock,
  AlertTriangle,
  Lightbulb,
  Repeat,
  User,
  Tag,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const tagColors: Record<string, string> = {
  IPO: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  IA: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  China: "bg-red-500/10 text-red-700 border-red-500/20",
  Paraguai: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  Portugal: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  Tecnologia: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  Importação: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  Parceria: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  Brook: "bg-green-500/10 text-green-700 border-green-500/20",
  Franquia: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Estratégia: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  Marketing: "bg-pink-500/10 text-pink-700 border-pink-500/20",
  Financeiro: "bg-lime-500/10 text-lime-700 border-lime-500/20",
  "E-Commerce": "bg-purple-500/10 text-purple-700 border-purple-500/20",
};

function getTagColor(tag: string) {
  for (const [key, value] of Object.entries(tagColors)) {
    if (tag.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return "bg-black/[0.04] text-foreground/70 border-black/[0.06]";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

type Tab = "threads" | "pessoas" | "acoes" | "insights";

interface Thread {
  nome: string;
  tags: string[];
  totalReunioes: number;
  periodo: string;
  dataInicio: string;
  dataFim: string;
  participantesChave: string[];
  totalAcoes: number;
  evolucao: { data: string; titulo: string; resumo: string }[];
  reunioes: { titulo: string; data: string; resumo: string; participantes: string[]; acoes: string[] }[];
}

interface Person {
  nome: string;
  totalReunioes: number;
  primeiraReuniao: string;
  ultimaReuniao: string;
  temasPrincipais: string[];
  conexoes: { nome: string; reunioesJuntos: number }[];
  reunioesRecentes: { idx: number; titulo: string; data: string }[];
}

interface Analysis {
  geradoEm: string;
  totalReunioes: number;
  threads: Thread[];
  pessoas: Person[];
  acoes: {
    total: number;
    porCategoria: Record<string, number>;
    porResponsavel: Record<string, number>;
    recentes: { acao: string; reuniao: string; data: string; responsavel: string | null; categoria: string }[];
  };
  insights: {
    distribuicaoDiaSemana: Record<string, number>;
    temasEmergentes: { tema: string; recente: number; anterior: number }[];
    temasDeclinando: { tema: string; recente: number; anterior: number }[];
    discussoesRecorrentes: { tema: string; vezes: number; periodo: string; dias: number }[];
    mediaSemanal: number;
    semanasMaisAtivas: [string, number][];
    periodoAnalisado: string;
    totalSemanas: number;
  };
  contextos: {
    projeto: string;
    tags: string[];
    periodo: string;
    totalReunioes: number;
    participantesChave: string[];
    cronologia: { data: string; titulo: string; resumo: string }[];
    todasAcoes: string[];
    totalAcoes: number;
  }[];
}

const catIcons: Record<string, string> = {
  Estratégia: "text-sky-500",
  Financeiro: "text-lime-600",
  Juridico: "text-amber-600",
  Marketing: "text-pink-500",
  Operacional: "text-orange-500",
  Tecnologia: "text-indigo-500",
  RH: "text-violet-500",
  Geral: "text-muted",
};

export default function InteligenciaPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("threads");
  const [expandedThread, setExpandedThread] = useState<number | null>(null);
  const [expandedPerson, setExpandedPerson] = useState<number | null>(null);
  const [expandedContext, setExpandedContext] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  useEffect(() => {
    if (!token) { queueMicrotask(() => { setLoading(false); setError(true); }); return; }
    fetch(`/api/reunioes/analise?token=${encodeURIComponent(token)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setLoading(false); setError(true); });
  }, [token]);

  const filteredActions = useMemo(() => {
    if (!data) return [];
    return data.acoes.recentes.filter((a) => {
      if (selectedCat && a.categoria !== selectedCat) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.acao.toLowerCase().includes(q) || a.reuniao.toLowerCase().includes(q) || (a.responsavel?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [data, search, selectedCat]);

  if (error || (!loading && !token)) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease }} className="bg-white rounded-3xl border border-black/[0.04] shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground font-display tracking-tight mb-2">Acesso restrito</h1>
          <p className="text-sm text-muted leading-relaxed">Token de acesso inválido.</p>
        </motion.div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Compilando inteligência...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Brain }[] = [
    { id: "threads", label: "Projetos", icon: GitBranch },
    { id: "pessoas", label: "Pessoas", icon: Network },
    { id: "acoes", label: "Acoes", icon: ListChecks },
    { id: "insights", label: "Insights", icon: Lightbulb },
  ];

  const maxCatCount = Math.max(...Object.values(data.acoes.porCategoria), 1);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <SharedHeader active="inteligencia" subtitle={`${data.totalReunioes} reuniões analisadas`} />

      <main className="max-w-6xl mx-auto p-5 lg:p-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

          {/* KPIs */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { icon: GitBranch, label: "Threads ativas", value: data.threads.length, color: "from-indigo-500/10 to-indigo-600/5", iconColor: "text-indigo-500" },
              { icon: Users, label: "Pessoas mapeadas", value: data.pessoas.length, color: "from-violet-500/10 to-violet-600/5", iconColor: "text-violet-500" },
              { icon: ListChecks, label: "Ações totais", value: data.acoes.total, color: "from-emerald-500/10 to-emerald-600/5", iconColor: "text-emerald-500" },
              { icon: TrendingUp, label: "Temas emergentes", value: data.insights.temasEmergentes.length, color: "from-amber-500/10 to-amber-600/5", iconColor: "text-amber-500" },
              { icon: Repeat, label: "Discussões recorrentes", value: data.insights.discussoesRecorrentes.length, color: "from-red-500/10 to-red-600/5", iconColor: "text-red-500" },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-2xl border border-black/[0.04] p-4 hover:shadow-md transition-all duration-300">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
                  </div>
                  <p className="text-xl font-bold text-foreground tracking-tight">{kpi.value}</p>
                  <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wider font-medium">{kpi.label}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp} className="flex gap-1 bg-[#f0f0f2] rounded-xl p-1 w-fit">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${
                    tab === t.id ? "bg-white shadow-sm text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </motion.div>

          {/* ===================== THREADS TAB ===================== */}
          {tab === "threads" && (
            <div className="space-y-3">
              <p className="text-[12px] text-muted">{data.threads.length} threads de projeto identificadas a partir de temas recorrentes</p>
              {data.threads.map((thread, i) => {
                const isOpen = expandedThread === i;
                return (
                  <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden hover:shadow-md transition-all duration-300">
                    <button onClick={() => setExpandedThread(isOpen ? null : i)} className="w-full flex items-start gap-4 p-5 text-left">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getTagColor(thread.nome)}`}>
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">{thread.nome}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {thread.tags.slice(0, 5).map((tag) => (
                            <span key={tag} className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getTagColor(tag)}`}>{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{thread.totalReunioes} reuniões</span>
                          <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" />{thread.totalAcoes} ações</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{thread.periodo}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex -space-x-1.5">
                          {thread.participantesChave.slice(0, 3).map((p, pi) => (
                            <div key={pi} className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-2 border-white flex items-center justify-center text-[8px] font-bold text-violet-600">
                              {p.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4 text-muted/40" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                          <div className="px-5 pb-5 border-t border-black/[0.04]">
                            <div className="pt-4 space-y-5">
                              {/* Participants */}
                              <div>
                                <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2">Participantes-chave</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {thread.participantesChave.map((p) => (
                                    <span key={p} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-violet-500/[0.06] text-violet-700">{p}</span>
                                  ))}
                                </div>
                              </div>

                              {/* Timeline */}
                              <div>
                                <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-3">Cronologia</p>
                                <div className="space-y-0">
                                  {thread.evolucao.map((ev, ei) => (
                                    <div key={ei} className="flex gap-3 group">
                                      <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                                        {ei < thread.evolucao.length - 1 && <div className="w-px flex-1 bg-black/[0.06] group-hover:bg-accent/30 transition-colors" />}
                                      </div>
                                      <div className="pb-4 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[11px] text-muted font-medium">{formatDate(ev.data)}</span>
                                        </div>
                                        <p className="text-[13px] font-medium text-foreground">{ev.titulo}</p>
                                        {ev.resumo && <p className="text-[12px] text-muted leading-relaxed mt-1">{ev.resumo}</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Actions from this thread */}
                              {thread.reunioes.some(m => m.acoes?.length > 0) && (
                                <div>
                                  <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2">Ações acumuladas ({thread.totalAcoes})</p>
                                  <div className="max-h-48 overflow-y-auto space-y-1">
                                    {thread.reunioes.flatMap(m => (m.acoes || []).map(a => ({ acao: a, data: m.data }))).slice(0, 15).map((item, ai) => (
                                      <div key={ai} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <span className="text-[12px] text-muted leading-relaxed">{item.acao}</span>
                                        <span className="text-[10px] text-muted/50 shrink-0 ml-auto">{formatDate(item.data)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ===================== PESSOAS TAB ===================== */}
          {tab === "pessoas" && (
            <div className="space-y-3">
              <p className="text-[12px] text-muted">{data.pessoas.length} participantes frequentes com conexões mapeadas</p>
              <div className="grid lg:grid-cols-2 gap-3">
                {data.pessoas.map((person, i) => {
                  const isOpen = expandedPerson === i;
                  return (
                    <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden hover:shadow-md transition-all duration-300">
                      <button onClick={() => setExpandedPerson(isOpen ? null : i)} className="w-full flex items-center gap-4 p-4 text-left">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                          <span className="text-white text-sm font-bold">{person.nome.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-semibold text-foreground">{person.nome}</h3>
                          <p className="text-[11px] text-muted">{person.totalReunioes} reuniões · desde {formatDate(person.primeiraReuniao)}</p>
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4 text-muted/40" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                            <div className="px-4 pb-4 border-t border-black/[0.04] space-y-3 pt-3">
                              {/* Topics */}
                              <div>
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-1.5">Temas principais</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {person.temasPrincipais.map((t) => (
                                    <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getTagColor(t)}`}>{t}</span>
                                  ))}
                                </div>
                              </div>

                              {/* Connections */}
                              <div>
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-1.5">Conexões frequentes</p>
                                <div className="space-y-1">
                                  {person.conexoes.map((c) => (
                                    <div key={c.nome} className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center text-[8px] font-bold text-violet-600">{c.nome.charAt(0)}</div>
                                      <span className="text-[12px] text-foreground flex-1">{c.nome}</span>
                                      <span className="text-[10px] text-muted">{c.reunioesJuntos}x juntos</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Recent meetings */}
                              <div>
                                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-1.5">Reuniões recentes</p>
                                <div className="space-y-1">
                                  {person.reunioesRecentes.map((r, ri) => (
                                    <div key={ri} className="flex items-center gap-2">
                                      <span className="text-[10px] text-muted shrink-0 w-16">{formatDate(r.data)}</span>
                                      <span className="text-[11px] text-foreground truncate">{r.titulo}</span>
                                    </div>
                                  ))}
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
            </div>
          )}

          {/* ===================== ACOES TAB ===================== */}
          {tab === "acoes" && (
            <div className="space-y-4">
              {/* Category breakdown */}
              <motion.div variants={fadeUp} className="grid lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    <h2 className="font-semibold text-foreground text-[15px]">Ações por Categoria</h2>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(data.acoes.porCategoria).map(([cat, count]) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
                        className={`flex items-center gap-3 w-full rounded-lg p-2 transition-all ${selectedCat === cat ? "bg-accent/5 ring-1 ring-accent/20" : "hover:bg-[#f5f5f7]"}`}
                      >
                        <Target className={`w-3.5 h-3.5 ${catIcons[cat] || "text-muted"}`} />
                        <span className="text-[12px] text-foreground w-24 text-left">{cat}</span>
                        <div className="flex-1 h-5 bg-[#f5f5f7] rounded-md overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-md"
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / maxCatCount) * 100}%` }}
                            transition={{ duration: 0.5, ease }}
                          />
                        </div>
                        <span className="text-[12px] font-semibold text-foreground w-8 text-right">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-violet-500" />
                    <h2 className="font-semibold text-foreground text-[15px]">Ações por Responsável</h2>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(data.acoes.porResponsavel).map(([name, count]) => (
                      <div key={name} className="flex items-center gap-3 px-2 py-1.5">
                        <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center text-[9px] font-bold text-violet-600 shrink-0">{name.charAt(0)}</div>
                        <span className="text-[12px] text-foreground flex-1">{name}</span>
                        <span className="text-[12px] font-semibold text-foreground">{count} ações</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Action list */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-semibold text-foreground text-[15px]">Ações Recentes</h2>
                  <div className="flex-1" />
                  {selectedCat && (
                    <button onClick={() => setSelectedCat(null)} className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-accent/10 text-accent">
                      {selectedCat} <X className="w-3 h-3" />
                    </button>
                  )}
                  <div className="relative w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/40" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Filtrar ações..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-black/[0.06] bg-transparent text-[12px] focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {filteredActions.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-[#f5f5f7] transition-colors">
                      <Target className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${catIcons[a.categoria] || "text-muted"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground leading-relaxed">{a.acao}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted">{formatDate(a.data)}</span>
                          <span className="text-[10px] text-muted/40">·</span>
                          <span className="text-[10px] text-muted truncate">{a.reuniao}</span>
                        </div>
                      </div>
                      {a.responsavel && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-violet-500/[0.06] text-violet-700 shrink-0">{a.responsavel}</span>
                      )}
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md shrink-0 ${getTagColor(a.categoria)}`}>{a.categoria}</span>
                    </div>
                  ))}
                  {filteredActions.length === 0 && (
                    <p className="text-center text-[12px] text-muted py-8">Nenhuma ação encontrada</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* ===================== INSIGHTS TAB ===================== */}
          {tab === "insights" && (
            <div className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Emerging Topics */}
                <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h2 className="font-semibold text-foreground text-[15px]">Temas Emergentes</h2>
                  </div>
                  <p className="text-[11px] text-muted mb-3">Tópicos ganhando mais atenção nas últimas semanas</p>
                  <div className="space-y-2">
                    {data.insights.temasEmergentes.slice(0, 10).map((t) => (
                      <div key={t.tema} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[#f5f5f7] transition-colors">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-md ${getTagColor(t.tema)}`}>{t.tema}</span>
                        <div className="flex-1" />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted">{t.anterior}</span>
                          <ArrowRight className="w-3 h-3 text-emerald-500" />
                          <span className="text-[11px] font-bold text-emerald-600">{t.recente}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Declining Topics */}
                <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <h2 className="font-semibold text-foreground text-[15px]">Temas em Declínio</h2>
                  </div>
                  <p className="text-[11px] text-muted mb-3">Tópicos perdendo espaço nas discussões recentes</p>
                  <div className="space-y-2">
                    {data.insights.temasDeclinando.slice(0, 10).map((t) => (
                      <div key={t.tema} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[#f5f5f7] transition-colors">
                        <TrendingDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-md ${getTagColor(t.tema)}`}>{t.tema}</span>
                        <div className="flex-1" />
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-foreground">{t.anterior}</span>
                          <ArrowRight className="w-3 h-3 text-red-400" />
                          <span className="text-[10px] text-muted">{t.recente}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Recurring Discussions - attention needed */}
                <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h2 className="font-semibold text-foreground text-[15px]">Discussões Recorrentes</h2>
                    <span className="text-[10px] text-muted ml-1">Temas discutidos em 4+ reuniões ao longo de semanas — podem requerer decisão</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {data.insights.discussoesRecorrentes.slice(0, 12).map((d) => (
                      <div key={d.tema} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#f8f9fb] hover:bg-amber-500/5 transition-colors">
                        <Repeat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[12px] font-medium text-foreground block truncate">{d.tema}</span>
                          <span className="text-[10px] text-muted">{d.vezes}x em {d.dias} dias</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Day of week distribution */}
                <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDays className="w-4 h-4 text-blue-500" />
                    <h2 className="font-semibold text-foreground text-[15px]">Dia da Semana</h2>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(data.insights.distribuicaoDiaSemana).sort((a, b) => b[1] - a[1]).map(([day, count]) => {
                      const max = Math.max(...Object.values(data.insights.distribuicaoDiaSemana));
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-[12px] text-muted w-16 shrink-0">{day}</span>
                          <div className="flex-1 h-5 bg-[#f5f5f7] rounded-md overflow-hidden">
                            <motion.div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-md" initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 0.5, ease }} />
                          </div>
                          <span className="text-[12px] font-semibold text-foreground w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted mt-3">Média: {data.insights.mediaSemanal} reuniões/semana em {data.insights.totalSemanas} semanas</p>
                </motion.div>

                {/* Most active weeks */}
                <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h2 className="font-semibold text-foreground text-[15px]">Semanas Mais Ativas</h2>
                  </div>
                  <div className="space-y-2">
                    {data.insights.semanasMaisAtivas.map(([week, count]) => (
                      <div key={week} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f5f5f7] transition-colors">
                        <CalendarDays className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-[12px] text-foreground">Semana de {formatDate(week)}</span>
                        <div className="flex-1" />
                        <span className="text-[13px] font-bold text-foreground">{count} reuniões</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Decision Contexts */}
              <motion.div variants={fadeUp}>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-indigo-500" />
                  <h2 className="font-semibold text-foreground text-[15px]">Contexto para Decisão</h2>
                  <span className="text-[11px] text-muted ml-1">Compilação de todas as informações por projeto</span>
                </div>
                <div className="space-y-2">
                  {data.contextos.map((ctx, i) => {
                    const isOpen = expandedContext === i;
                    return (
                      <div key={i} className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
                        <button onClick={() => setExpandedContext(isOpen ? null : i)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#f8f9fb] transition-colors">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getTagColor(ctx.projeto)}`}>
                            <Target className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[14px] font-semibold text-foreground">{ctx.projeto}</h3>
                            <p className="text-[11px] text-muted">{ctx.totalReunioes} reuniões · {ctx.totalAcoes} ações · {ctx.periodo}</p>
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                            {ctx.participantesChave.slice(0, 3).map((p) => (
                              <span key={p} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-violet-500/[0.06] text-violet-700">{p}</span>
                            ))}
                          </div>
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-4 h-4 text-muted/40" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                              <div className="px-4 pb-4 border-t border-black/[0.04] pt-3 space-y-4">
                                <div>
                                  <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Evolução das Discussões</p>
                                  {ctx.cronologia.map((ev, ei) => (
                                    <div key={ei} className="flex gap-3 mb-2">
                                      <span className="text-[10px] text-muted w-16 shrink-0 pt-0.5">{formatDate(ev.data)}</span>
                                      <div>
                                        <p className="text-[12px] font-medium text-foreground">{ev.titulo}</p>
                                        {ev.resumo && <p className="text-[11px] text-muted mt-0.5">{ev.resumo}</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {ctx.todasAcoes.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Todas as Ações ({ctx.totalAcoes})</p>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                      {ctx.todasAcoes.map((a, ai) => (
                                        <div key={ai} className="flex items-start gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                          <span className="text-[11px] text-muted">{a}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}

        </motion.div>
      </main>

      <footer className="border-t border-black/[0.04] py-6 mt-12">
        <p className="text-center text-[11px] text-muted/50">Grupo +351 · Inteligência de Governança · Acesso restrito por link</p>
      </footer>
    </div>
  );
}
