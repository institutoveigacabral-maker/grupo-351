"use client";

import { useEffect, useState } from "react";
import { Building2, Lightbulb, GitMerge, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { OnboardingTour } from "@/components/OnboardingTour";
import { KPICard } from "@/components/ui/kpi-card";
import { SkeletonPage } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/page-transition";

interface DashboardData {
  company: { slug: string; nome: string; setor: string; estagio: string; verificada: boolean } | null;
  opportunities: number;
  matches: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<{ nome: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/platform/me")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((u) => {
        setUser({ nome: u.nome, role: u.role });
        setData({
          company: u.company,
          opportunities: 0,
          matches: 0,
        });
      })
      .catch(() => {});
  }, []);

  if (!data || !user) return <SkeletonPage />;

  const firstName = user.nome.split(" ")[0];

  return (
    <PageTransition className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Olá, {firstName}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Bem-vindo ao ecossistema +351. Aqui está o resumo da sua atividade.
          </p>
        </div>
      </div>

      {/* Onboarding tour */}
      <OnboardingTour
        hasCompany={!!data.company}
        hasOpportunity={data.opportunities > 0}
      />

      {/* KPI Cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StaggerItem>
          <KPICard
            icon={Building2}
            label="Empresa"
            value={data.company?.nome || "Não cadastrada"}
            href="/dashboard/empresa"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            icon={Lightbulb}
            label="Oportunidades abertas"
            value={data.opportunities}
            href="/dashboard/oportunidades"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            gradient="bg-gradient-to-br from-blue-500 to-indigo-500"
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            icon={GitMerge}
            label="Matches ativos"
            value={data.matches}
            href="/dashboard/matches"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Recent opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Oportunidades recentes</h2>
          <Link href="/dashboard/oportunidades" className="text-sm text-amber-600 hover:text-amber-500 flex items-center gap-1 font-medium">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <RecentOpportunities />
      </div>
    </PageTransition>
  );
}

function RecentOpportunities() {
  const [opps, setOpps] = useState<{ id: string; titulo: string; tipo: string; setor: string; company: { nome: string } }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform/opportunities?limit=5")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setOpps(d.opportunities || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-black/[0.04] divide-y divide-black/[0.03]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (opps.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Nenhuma oportunidade publicada ainda."
        description="Seja o primeiro a criar uma."
        action={{ label: "Criar oportunidade", href: "/dashboard/oportunidades" }}
      />
    );
  }

  const tipoColors: Record<string, string> = {
    franquia: "bg-purple-50 text-purple-700 ring-purple-500/10",
    investimento: "bg-emerald-50 text-emerald-700 ring-emerald-500/10",
    parceria: "bg-blue-50 text-blue-700 ring-blue-500/10",
    fornecedor: "bg-amber-50 text-amber-700 ring-amber-500/10",
    expansao: "bg-rose-50 text-rose-700 ring-rose-500/10",
  };

  return (
    <div className="bg-white rounded-2xl border border-black/[0.04] divide-y divide-black/[0.03] overflow-hidden">
      {opps.map((opp) => (
        <div key={opp.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-900">{opp.titulo}</p>
            <p className="text-xs text-gray-400 mt-0.5">{opp.company?.nome || "\u2014"} \u2014 {opp.setor}</p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${tipoColors[opp.tipo] || "bg-gray-50 text-gray-600 ring-gray-500/10"}`}>
            {opp.tipo}
          </span>
        </div>
      ))}
    </div>
  );
}
