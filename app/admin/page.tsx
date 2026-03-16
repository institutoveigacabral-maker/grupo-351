"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Mail,
  Briefcase,
  BookOpen,
  TrendingUp,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Sparkles,
  CalendarDays,
  Building2,
  Target,
  GitPullRequest,
  Wallet,
  UserPlus,
} from "lucide-react";
import type { Candidatura, Contato } from "@/lib/admin-types";

interface DashboardStatsV2 {
  candidaturas: { total: number; novas: number; emAnalise: number; entrevista: number; aprovadas: number; recusadas: number };
  contatos: { total: number; naoLidos: number };
  projetos: { ideacao: number; emEstruturacao: number; emDesenvolvimento: number; emOperacao: number; consolidado: number };
  conhecimento: { termos: number; artigos: number };
  plataforma: {
    users: number;
    companies: number;
    opportunities: number;
    matches: number;
    subscriptions: number;
    activeSubscriptions: number;
    projects: number;
    closedDeals: number;
    growth7d: { users: number; companies: number; opportunities: number };
  };
}

const statusColors: Record<string, string> = {
  nova: "bg-accent text-white",
  "em-analise": "bg-warning text-white",
  entrevista: "bg-primary text-white",
  aprovada: "bg-success text-white",
  recusada: "bg-error text-white",
  arquivada: "bg-muted text-white",
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStatsV2 | null>(null);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/candidaturas").then((r) => r.json()),
      fetch("/api/admin/contatos").then((r) => r.json()),
    ]).then(([s, c, ct]) => {
      setStats(s);
      setCandidaturas(c.slice(0, 5));
      setContatos(ct.filter((x: Contato) => !x.lido).slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const p = stats?.plataforma;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
          Centro de Comando
        </h1>
        <p className="text-muted text-sm mt-0.5">
          Visão 360° do ecossistema Grupo +351
        </p>
      </motion.div>

      {/* Platform Health — Top KPIs */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Users,
            label: "Utilizadores",
            value: p?.users || 0,
            sub: p?.growth7d.users ? `+${p.growth7d.users} esta semana` : "plataforma",
            color: "from-blue-500/10 to-blue-600/5",
            iconColor: "text-blue-500",
            href: "/admin/usuarios",
          },
          {
            icon: Building2,
            label: "Empresas",
            value: p?.companies || 0,
            sub: p?.growth7d.companies ? `+${p.growth7d.companies} esta semana` : "registradas",
            color: "from-purple-500/10 to-purple-600/5",
            iconColor: "text-purple-500",
            href: "/admin/empresas",
          },
          {
            icon: Target,
            label: "Oportunidades",
            value: p?.opportunities || 0,
            sub: p?.growth7d.opportunities ? `+${p.growth7d.opportunities} esta semana` : "marketplace",
            color: "from-emerald-500/10 to-emerald-600/5",
            iconColor: "text-emerald-500",
            href: "/admin/oportunidades",
          },
          {
            icon: GitPullRequest,
            label: "Deals Fechados",
            value: p?.closedDeals || 0,
            sub: `${p?.matches || 0} matches total`,
            color: "from-amber-500/10 to-amber-600/5",
            iconColor: "text-amber-500",
            href: "/admin/deals",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <a
              key={kpi.label}
              href={kpi.href}
              className="bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <Icon className={`w-[18px] h-[18px] ${kpi.iconColor}`} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted/30 group-hover:text-muted transition-colors" />
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</p>
              <p className="text-[11px] text-muted mt-0.5 font-medium">{kpi.sub}</p>
            </a>
          );
        })}
      </motion.div>

      {/* Secondary KPIs */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Candidaturas", value: stats?.candidaturas.total || 0, sub: `${stats?.candidaturas.novas || 0} novas`, color: "text-blue-600" },
          { label: "Contatos", value: stats?.contatos.naoLidos || 0, sub: "não lidos", color: "text-rose-500" },
          { label: "Assinaturas", value: p?.activeSubscriptions || 0, sub: `de ${p?.subscriptions || 0}`, color: "text-emerald-600" },
          { label: "Projetos", value: p?.projects || 0, sub: "plataforma", color: "text-purple-600" },
          { label: "Portfólio", value: (stats?.projetos.emOperacao || 0) + (stats?.projetos.consolidado || 0), sub: "em operação", color: "text-amber-600" },
          { label: "Conhecimento", value: (stats?.conhecimento?.termos || 0) + (stats?.conhecimento?.artigos || 0), sub: "termos+artigos", color: "text-violet-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-black/[0.04] p-4 text-center">
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wider font-medium">{kpi.label}</p>
            <p className="text-[9px] text-muted/60 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Navigation */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-6 gap-2.5">
        {[
          { href: "/admin/usuarios", label: "Utilizadores", icon: Users, accent: "group-hover:text-blue-500" },
          { href: "/admin/empresas", label: "Empresas", icon: Building2, accent: "group-hover:text-purple-500" },
          { href: "/admin/oportunidades", label: "Oportunidades", icon: Target, accent: "group-hover:text-emerald-500" },
          { href: "/admin/deals", label: "Pipeline", icon: GitPullRequest, accent: "group-hover:text-amber-500" },
          { href: "/admin/financeiro", label: "Financeiro", icon: Wallet, accent: "group-hover:text-green-500" },
          { href: "/admin/inteligencia", label: "IA", icon: Brain, accent: "group-hover:text-violet-500" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.href}
              href={action.href}
              className="group flex items-center gap-2.5 bg-white rounded-xl border border-black/[0.04] px-3.5 py-3 hover:shadow-md hover:border-black/[0.06] transition-all duration-300"
            >
              <Icon className={`w-4 h-4 text-muted transition-colors ${action.accent}`} />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
              <ArrowUpRight className="w-3 h-3 text-muted/30 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
            </a>
          );
        })}
      </motion.div>

      {/* Candidaturas Pipeline */}
      {stats && stats.candidaturas.total > 0 && (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-foreground text-[15px]">Pipeline de Candidaturas</h2>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Novas", count: stats.candidaturas.novas, color: "bg-accent", track: "bg-accent/10" },
              { label: "Análise", count: stats.candidaturas.emAnalise, color: "bg-amber-500", track: "bg-amber-500/10" },
              { label: "Entrevista", count: stats.candidaturas.entrevista, color: "bg-primary", track: "bg-primary/10" },
              { label: "Aprovadas", count: stats.candidaturas.aprovadas, color: "bg-emerald-500", track: "bg-emerald-500/10" },
              { label: "Recusadas", count: stats.candidaturas.recusadas, color: "bg-rose-500", track: "bg-rose-500/10" },
            ].map((stage) => (
              <div key={stage.label} className="flex-1 text-center">
                <div className={`h-1.5 rounded-full ${stage.track} overflow-hidden mb-3`}>
                  <motion.div
                    className={`h-full rounded-full ${stage.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: stage.count > 0 ? "100%" : "0%" }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="text-lg font-bold text-foreground">{stage.count}</p>
                <p className="text-[10px] text-muted uppercase tracking-widest font-medium">{stage.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Candidaturas */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground text-[15px]">Últimas candidaturas</h2>
            <Link href="/admin/candidaturas" className="text-accent text-xs font-medium hover:underline flex items-center gap-1 group">
              Ver todas <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {candidaturas.length === 0 ? (
            <div className="text-center py-10">
              <Users className="w-8 h-8 text-muted/30 mx-auto mb-2" />
              <p className="text-muted text-sm">Nenhuma candidatura</p>
            </div>
          ) : (
            <div className="space-y-1">
              {candidaturas.map((c) => (
                <a
                  key={c.id}
                  href={`/admin/candidaturas/${c.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary text-[11px] font-bold shrink-0">
                    {c.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                    <p className="text-[11px] text-muted">{c.perfil} · {c.modelo.length} marca(s)</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>
                    {c.status}
                  </span>
                </a>
              ))}
            </div>
          )}
        </motion.div>

        {/* Contatos */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground text-[15px]">Contatos não lidos</h2>
            <a href="/admin/contatos" className="text-accent text-xs font-medium hover:underline flex items-center gap-1 group">
              Ver todos <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
          {contatos.length === 0 ? (
            <div className="text-center py-10">
              <Mail className="w-8 h-8 text-muted/30 mx-auto mb-2" />
              <p className="text-muted text-sm">Nenhum contato não lido</p>
            </div>
          ) : (
            <div className="space-y-1">
              {contatos.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500/10 to-rose-600/5 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                    <p className="text-[11px] text-muted truncate">{c.mensagem}</p>
                  </div>
                  <span className="text-[10px] text-muted/60 shrink-0 mt-1">
                    {new Date(c.criadoEm).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Suggestion Banner */}
      <motion.a
        variants={fadeUp}
        href="/admin/inteligencia"
        className="group flex items-center gap-4 bg-gradient-to-r from-[#111d2e] to-[#1a2f4a] rounded-2xl p-5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500"
      >
        <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-accent-light" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-[15px]">Assistente de Inteligência</p>
          <p className="text-white/50 text-xs mt-0.5">
            Análises do pipeline, artigos, sinergias e métricas do ecossistema
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
      </motion.a>
    </motion.div>
  );
}
