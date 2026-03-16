"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SharedHeader } from "@/components/reunioes/SharedHeader";
import {
  CalendarDays,
  Users,
  Tag,
  Search,
  ChevronDown,
  CheckCircle2,
  Filter,
  BarChart3,
  X,
  ListChecks,
  MessageSquare,
  Shield,
} from "lucide-react";

interface Reuniao {
  titulo: string;
  data: string;
  participantes?: string[];
  tags?: string[];
  resumo?: string;
  acoes?: string[];
}

const ease = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const tagColors: Record<string, string> = {
  IPO: "bg-amber-500/10 text-amber-700",
  IA: "bg-violet-500/10 text-violet-700",
  China: "bg-red-500/10 text-red-700",
  "Supply Chain": "bg-cyan-500/10 text-cyan-700",
  Franquia: "bg-emerald-500/10 text-emerald-700",
  Parceria: "bg-blue-500/10 text-blue-700",
  Importação: "bg-orange-500/10 text-orange-700",
  "Grupo Rao": "bg-primary/10 text-primary",
  Tecnologia: "bg-indigo-500/10 text-indigo-700",
  WhatsApp: "bg-green-500/10 text-green-700",
  Estratégia: "bg-sky-500/10 text-sky-700",
  Marketing: "bg-pink-500/10 text-pink-700",
  Financeiro: "bg-lime-500/10 text-lime-700",
};

function getTagColor(tag: string) {
  for (const [key, value] of Object.entries(tagColors)) {
    if (tag.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return "bg-black/[0.04] text-foreground/70";
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default function ReunioesPublicPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [view, setView] = useState<"timeline" | "stats">("timeline");
  useEffect(() => {
    if (!token) {
      queueMicrotask(() => { setLoading(false); setError(true); });
      return;
    }
    fetch(`/api/reunioes?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        setReunioes(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [token]);

  const stats = useMemo(() => {
    const allTags: Record<string, number> = {};
    const allPeople: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    let totalAcoes = 0;

    reunioes.forEach((r) => {
      r.tags?.forEach((t) => {
        allTags[t] = (allTags[t] || 0) + 1;
      });
      r.participantes?.forEach((p) => {
        const name = p.replace(/\s*\(.*?\)\s*/g, "").trim();
        if (name) allPeople[name] = (allPeople[name] || 0) + 1;
      });
      const month = r.data.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
      totalAcoes += r.acoes?.length || 0;
    });

    return {
      total: reunioes.length,
      totalAcoes,
      tags: Object.entries(allTags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20),
      people: Object.entries(allPeople)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15),
      byMonth: Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])),
    };
  }, [reunioes]);

  const filtered = useMemo(() => {
    return reunioes.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          r.titulo.toLowerCase().includes(q) ||
          r.resumo?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)) ||
          r.participantes?.some((p) => p.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (selectedTag && !r.tags?.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()))) {
        return false;
      }
      if (selectedPerson && !r.participantes?.some((p) => p.toLowerCase().includes(selectedPerson.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [reunioes, search, selectedTag, selectedPerson]);

  const grouped = useMemo(() => {
    const groups: Record<string, Reuniao[]> = {};
    filtered.forEach((r) => {
      const month = r.data.slice(0, 7);
      if (!groups[month]) groups[month] = [];
      groups[month].push(r);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const toggleExpand = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Error / no token
  if (error || (!loading && !token)) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease }}
          className="bg-white rounded-3xl border border-black/[0.04] shadow-xl p-10 max-w-sm w-full text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground font-display tracking-tight mb-2">
            Acesso restrito
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Este link requer um token de acesso valido. Solicite um novo link ao administrador.
          </p>
        </motion.div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const maxMonthCount = Math.max(...stats.byMonth.map(([, c]) => c), 1);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <SharedHeader active="timeline" subtitle="Relatorio de Reunioes" />

      {/* Content */}
      <main className="max-w-5xl mx-auto p-5 lg:p-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          {/* Header */}
          <motion.div variants={fadeUp} className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
                Reunioes
              </h1>
              <p className="text-muted text-sm mt-0.5">
                {stats.total} reunioes registradas · {stats.totalAcoes} acoes identificadas
              </p>
            </div>
            <div className="flex gap-1.5 bg-[#f0f0f2] rounded-xl p-1">
              <button
                onClick={() => setView("timeline")}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  view === "timeline" ? "bg-white shadow-sm text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setView("stats")}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  view === "stats" ? "bg-white shadow-sm text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                Estatisticas
              </button>
            </div>
          </motion.div>

          {/* KPIs */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: CalendarDays, label: "Reunioes", value: stats.total, sub: `${stats.byMonth[0]?.[1] || 0} este mes`, color: "from-blue-500/10 to-blue-600/5", iconColor: "text-blue-500" },
              { icon: ListChecks, label: "Acoes", value: stats.totalAcoes, sub: `${(stats.totalAcoes / Math.max(stats.total, 1)).toFixed(1)} por reuniao`, color: "from-emerald-500/10 to-emerald-600/5", iconColor: "text-emerald-500" },
              { icon: Users, label: "Participantes", value: stats.people.length, sub: "unicos identificados", color: "from-violet-500/10 to-violet-600/5", iconColor: "text-violet-500" },
              { icon: Tag, label: "Temas", value: stats.tags.length, sub: "topicos distintos", color: "from-amber-500/10 to-amber-600/5", iconColor: "text-amber-500" },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                      <Icon className={`w-[18px] h-[18px] ${kpi.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</p>
                  <p className="text-[11px] text-muted mt-0.5 uppercase tracking-wider font-medium">{kpi.sub}</p>
                </div>
              );
            })}
          </motion.div>

          {view === "stats" ? (
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Monthly Chart */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <h2 className="font-semibold text-foreground text-[15px]">Reunioes por Mes</h2>
                </div>
                <div className="space-y-2.5">
                  {stats.byMonth.map(([month, count]) => (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-[12px] text-muted w-20 shrink-0 capitalize">
                        {formatMonth(month + "-01")}
                      </span>
                      <div className="flex-1 h-6 bg-[#f5f5f7] rounded-lg overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-accent to-accent-light rounded-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxMonthCount) * 100}%` }}
                          transition={{ duration: 0.6, ease }}
                        />
                      </div>
                      <span className="text-[13px] font-semibold text-foreground w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top People */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-4 h-4 text-violet-500" />
                  <h2 className="font-semibold text-foreground text-[15px]">Participantes Mais Frequentes</h2>
                </div>
                <div className="space-y-1.5">
                  {stats.people.map(([name, count], i) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedPerson(name === selectedPerson ? null : name);
                        setView("timeline");
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-[#f5f5f7] transition-all text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/10 to-violet-600/5 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-[13px] text-foreground flex-1 truncate">{name}</span>
                      <span className="text-[12px] text-muted font-medium">{count} reunioes</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Top Tags */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6 lg:col-span-2">
                <div className="flex items-center gap-2 mb-5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <h2 className="font-semibold text-foreground text-[15px]">Temas Mais Discutidos</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.tags.map(([tag, count]) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag === selectedTag ? null : tag);
                        setView("timeline");
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:shadow-sm ${getTagColor(tag)}`}
                    >
                      {tag}
                      <span className="opacity-60">({count})</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Search & Filters */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar reunioes, participantes, temas..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.06] bg-white text-[13px] text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
                  />
                </div>
                {(selectedTag || selectedPerson) && (
                  <div className="flex gap-2 items-center">
                    {selectedTag && (
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 text-accent text-[12px] font-medium"
                      >
                        <Filter className="w-3 h-3" />
                        {selectedTag}
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    {selectedPerson && (
                      <button
                        onClick={() => setSelectedPerson(null)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 text-violet-700 text-[12px] font-medium"
                      >
                        <Users className="w-3 h-3" />
                        {selectedPerson}
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>

              {(search || selectedTag || selectedPerson) && (
                <p className="text-[12px] text-muted">
                  {filtered.length} de {stats.total} reunioes
                </p>
              )}

              {/* Grouped by month */}
              {grouped.map(([month, meetings]) => (
                <motion.div key={month} variants={fadeUp} className="space-y-2.5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider capitalize">
                      {formatMonth(month + "-01")}
                    </h3>
                    <span className="text-[11px] text-muted font-medium">{meetings.length} reunioes</span>
                    <div className="flex-1 h-px bg-black/[0.04]" />
                  </div>

                  {meetings.map((r, i) => {
                    const globalIdx = reunioes.indexOf(r);
                    const isExpanded = expanded.has(globalIdx);
                    return (
                      <div
                        key={`${r.data}-${i}`}
                        className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <button
                          onClick={() => toggleExpand(globalIdx)}
                          className="w-full flex items-start gap-4 p-5 text-left"
                        >
                          <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] flex flex-col items-center justify-center shrink-0">
                            <span className="text-[15px] font-bold text-foreground leading-none">
                              {new Date(r.data + "T12:00:00").getDate()}
                            </span>
                            <span className="text-[9px] text-muted uppercase font-medium mt-0.5">
                              {new Date(r.data + "T12:00:00").toLocaleDateString("pt-BR", { month: "short" })}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-semibold text-foreground tracking-[-0.01em] leading-snug mb-1.5">
                              {r.titulo}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {r.tags?.slice(0, 4).map((tag) => (
                                <span key={tag} className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getTagColor(tag)}`}>
                                  {tag}
                                </span>
                              ))}
                              {(r.tags?.length || 0) > 4 && (
                                <span className="text-[10px] text-muted font-medium px-2 py-0.5">
                                  +{(r.tags?.length || 0) - 4}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {r.participantes && (
                              <div className="flex items-center gap-1 text-muted">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-medium">{r.participantes.length}</span>
                              </div>
                            )}
                            {r.acoes && r.acoes.length > 0 && (
                              <div className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-medium">{r.acoes.length}</span>
                              </div>
                            )}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-4 h-4 text-muted/40" />
                            </motion.div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 pt-0 border-t border-black/[0.04]">
                                <div className="pt-4 space-y-4">
                                  {r.resumo && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-accent" />
                                        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                                          Resumo
                                        </span>
                                      </div>
                                      <p className="text-[13px] text-muted leading-[1.7] pl-5">
                                        {r.resumo}
                                      </p>
                                    </div>
                                  )}

                                  {r.participantes && r.participantes.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-3.5 h-3.5 text-violet-500" />
                                        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                                          Participantes
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5 pl-5">
                                        {r.participantes.map((p) => (
                                          <button
                                            key={p}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const name = p.replace(/\s*\(.*?\)\s*/g, "").trim();
                                              setSelectedPerson(name === selectedPerson ? null : name);
                                            }}
                                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-violet-500/[0.06] text-violet-700 hover:bg-violet-500/10 transition-colors"
                                          >
                                            {p}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {r.acoes && r.acoes.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                                          Acoes ({r.acoes.length})
                                        </span>
                                      </div>
                                      <ul className="space-y-1.5 pl-5">
                                        {r.acoes.map((acao, ai) => (
                                          <li key={ai} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            <span className="text-[13px] text-muted leading-[1.6]">{acao}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {r.tags && r.tags.length > 4 && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Tag className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                                          Todos os Temas
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5 pl-5">
                                        {r.tags.map((tag) => (
                                          <button
                                            key={tag}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedTag(tag === selectedTag ? null : tag);
                                            }}
                                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition-all hover:shadow-sm ${getTagColor(tag)}`}
                                          >
                                            {tag}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <CalendarDays className="w-10 h-10 text-muted/20 mx-auto mb-3" />
                  <p className="text-muted text-sm">Nenhuma reuniao encontrada</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.04] py-6 mt-12">
        <p className="text-center text-[11px] text-muted/50">
          Grupo +351 · Relatório de Governança · Acesso restrito por link
        </p>
      </footer>
    </div>
  );
}
