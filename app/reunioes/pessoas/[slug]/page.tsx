"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { SharedHeader } from "@/components/reunioes/SharedHeader";
import { stagger, fadeUp } from "@/lib/reunioes/animations";
import { getTagColor, prioConfig, statusConfig, catIconColors } from "@/lib/reunioes/constants";
import { formatDateShort, slugify } from "@/lib/reunioes/utils";
import {
  Shield, Users, CalendarDays, ListChecks, Tag, Network,
  ChevronRight, Target, CheckCircle2, ArrowRight, Clock, Map,
} from "lucide-react";

interface PersonData {
  nome: string; slug: string; totalReunioes: number;
  primeiraReuniao: string; ultimaReuniao: string;
  temasPrincipais: string[];
  conexoes: { nome: string; reunioesJuntos: number }[];
  meetings: { titulo: string; data: string; tags: string[]; totalAcoes: number; participantes: number }[];
  projects: { id: string; nome: string; status: string; prioridade: string; totalReunioes: number; categoria: string }[];
  actions: { acao: string; reuniao: string; data: string; categoria: string }[];
}

export default function PessoaPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const token = searchParams.get("token");
  const slug = params.slug as string;

  const [data, setData] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token || !slug) { queueMicrotask(() => { setLoading(false); setError(true); }); return; }
    fetch(`/api/reunioes/pessoa?token=${encodeURIComponent(token)}&slug=${slug}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setLoading(false); setError(true); });
  }, [token, slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-black/[0.04] shadow-xl p-10 max-w-sm w-full text-center">
          <Shield className="w-7 h-7 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Acesso restrito</h1>
          <p className="text-sm text-muted">Token invalido ou pessoa nao encontrada.</p>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <SharedHeader active="" subtitle={data.nome} />

      <main className="flex-1 max-w-5xl mx-auto w-full p-5 lg:p-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

          {/* Profile header */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                <span className="text-white text-2xl font-bold">{data.nome.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">{data.nome}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[12px] text-muted">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{data.totalReunioes} reunioes</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Desde {formatDateShort(data.primeiraReuniao)}</span>
                  <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />Ultima: {formatDateShort(data.ultimaReuniao)}</span>
                  <span className="flex items-center gap-1"><Map className="w-3.5 h-3.5" />{data.projects.length} projetos</span>
                </div>
                {data.temasPrincipais.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {data.temasPrincipais.map((t) => (
                      <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getTagColor(t)}`}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Projetos envolvidos */}
              {data.projects.length > 0 && (
                <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Map className="w-4 h-4 text-amber-500" />
                    <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Projetos Envolvidos</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {data.projects.map((p) => {
                      const prio = prioConfig[p.prioridade];
                      const st = statusConfig[p.status];
                      return (
                        <a key={p.id} href={`/reunioes/roadmaps?token=${token}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f9fb] transition-colors border border-black/[0.03] group">
                          <div className={`w-2 h-2 rounded-full ${prio?.dot || "bg-muted"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-foreground group-hover:text-accent transition-colors truncate">{p.nome}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted">
                              <span className={st?.color}>{st?.label}</span>
                              <span>·</span>
                              <span>{p.totalReunioes}r</span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted/20 group-hover:text-accent shrink-0 transition-colors" />
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Timeline de reunioes */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Historico de Reunioes</h2>
                  <span className="text-[10px] text-muted">{data.meetings.length} total</span>
                </div>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {data.meetings.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-[#f8f9fb] transition-colors">
                      <span className="text-[10px] text-muted w-14 shrink-0 pt-0.5">{formatDateShort(m.data)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground leading-tight">{m.titulo}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.tags.slice(0, 3).map((t) => (
                            <span key={t} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${getTagColor(t)}`}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted shrink-0">
                        <span><Users className="w-3 h-3 inline" /> {m.participantes}</span>
                        {m.totalAcoes > 0 && <span className="text-emerald-600"><CheckCircle2 className="w-3 h-3 inline" /> {m.totalAcoes}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: connections + actions */}
            <div className="space-y-5">
              {/* Connection graph */}
              {data.conexoes.length > 0 && (
                <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Network className="w-4 h-4 text-indigo-500" />
                    <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Conexoes</h2>
                  </div>
                  {/* Visual graph */}
                  <div className="relative w-full aspect-square mb-4">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Center node */}
                      <circle cx="100" cy="100" r="20" className="fill-violet-500/10 stroke-violet-500/30" strokeWidth="1" />
                      <text x="100" y="104" textAnchor="middle" className="fill-violet-700 text-[8px] font-bold">{data.nome.split(" ")[0]}</text>
                      {/* Connection nodes */}
                      {data.conexoes.slice(0, 8).map((c, i) => {
                        const angle = (i / Math.min(data.conexoes.length, 8)) * Math.PI * 2 - Math.PI / 2;
                        const dist = 65 + (i % 2) * 15;
                        const x = 100 + Math.cos(angle) * dist;
                        const y = 100 + Math.sin(angle) * dist;
                        const thick = Math.min(c.reunioesJuntos / 3, 3);
                        return (
                          <g key={c.nome}>
                            <line x1="100" y1="100" x2={x} y2={y} stroke="currentColor" strokeWidth={thick} className="text-black/[0.06]" />
                            <circle cx={x} cy={y} r="14" className="fill-indigo-500/[0.06] stroke-indigo-500/20" strokeWidth="1" />
                            <text x={x} y={y + 1} textAnchor="middle" className="fill-foreground text-[6px] font-medium">{c.nome.split(" ")[0]}</text>
                            <text x={x} y={y + 9} textAnchor="middle" className="fill-muted text-[5px]">{c.reunioesJuntos}x</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="space-y-1">
                    {data.conexoes.slice(0, 8).map((c) => (
                      <a key={c.nome} href={`/reunioes/pessoas/${slugify(c.nome)}?token=${token}`} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[#f8f9fb] transition-colors group">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[8px] font-bold text-indigo-600">{c.nome.charAt(0)}</div>
                        <span className="text-[11px] text-foreground flex-1 group-hover:text-accent transition-colors">{c.nome}</span>
                        <span className="text-[10px] text-muted">{c.reunioesJuntos}x</span>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              {data.actions.length > 0 && (
                <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Acoes Atribuidas</h2>
                  </div>
                  <div className="space-y-1.5">
                    {data.actions.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5">
                        <ArrowRight className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-foreground leading-relaxed">{a.acao}</p>
                          <p className="text-[9px] text-muted">{a.reuniao} · {formatDateShort(a.data)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
