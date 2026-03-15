"use client";

import { useEffect, useState } from "react";
import { Building2, Lightbulb, GitMerge, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { OnboardingTour } from "@/components/OnboardingTour";

interface DashboardData {
  company: { slug: string; nome: string; setor: string; estagio: string; verificada: boolean } | null;
  opportunities: number;
  matches: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<{ nome: string; role: string } | null>(null);

  useEffect(() => {
    // Fetch user + company
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

  if (!data || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Boas-vindas */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Olá, {user.nome.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Bem-vindo ao ecossistema +351. Aqui está o resumo da sua atividade.
        </p>
      </div>

      {/* Onboarding tour */}
      <OnboardingTour
        hasCompany={!!data.company}
        hasOpportunity={data.opportunities > 0}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Building2,
            label: "Empresa",
            value: data.company?.nome || "Não cadastrada",
            bgColor: "bg-amber-50",
            textColor: "text-amber-600",
            href: "/dashboard/empresa",
          },
          {
            icon: Lightbulb,
            label: "Oportunidades abertas",
            value: String(data.opportunities),
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            href: "/dashboard/oportunidades",
          },
          {
            icon: GitMerge,
            label: "Matches ativos",
            value: String(data.matches),
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-600",
            href: "/dashboard/matches",
          },
        ].map(({ icon: Icon, label, value, bgColor, textColor, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300 group"
          >
            <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${textColor}`} />
            </div>
            <p className="text-lg font-bold text-gray-900 tracking-tight">{value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">{label}</p>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Feed de oportunidades recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Oportunidades recentes</h2>
          <Link href="/dashboard/oportunidades" className="text-sm text-amber-600 hover:text-amber-500 flex items-center gap-1">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <RecentOpportunities />
      </div>
    </div>
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
    return <div className="bg-white rounded-2xl border border-black/[0.04] p-8 text-center text-gray-400 text-sm">Carregando...</div>;
  }

  if (opps.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/[0.04] p-8 text-center">
        <TrendingUp className="w-8 h-8 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Nenhuma oportunidade publicada ainda.</p>
        <p className="text-gray-300 text-xs mt-1">Seja o primeiro a criar uma.</p>
      </div>
    );
  }

  const tipoColors: Record<string, string> = {
    franquia: "bg-purple-50 text-purple-700",
    investimento: "bg-emerald-50 text-emerald-700",
    parceria: "bg-blue-50 text-blue-700",
    fornecedor: "bg-amber-50 text-amber-700",
    expansao: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-black/[0.04] divide-y divide-black/[0.03]">
      {opps.map((opp) => (
        <div key={opp.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-900">{opp.titulo}</p>
            <p className="text-xs text-gray-400 mt-0.5">{opp.company?.nome || "—"} — {opp.setor}</p>
          </div>
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${tipoColors[opp.tipo] || "bg-gray-50 text-gray-600"}`}>
            {opp.tipo}
          </span>
        </div>
      ))}
    </div>
  );
}
