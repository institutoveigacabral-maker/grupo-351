"use client";

import { useEffect, useState } from "react";
import { Search, Star, StarOff, Building2 } from "lucide-react";
import Image from "next/image";

interface AdminOpportunity {
  id: string;
  titulo: string;
  tipo: string;
  setor: string;
  descricao: string;
  budget: string | null;
  localizacao: string | null;
  status: string;
  destaque: boolean;
  criadoEm: string;
  expiraEm: string | null;
  company: { id: string; nome: string; slug: string; logo: string | null };
  user: { id: string; nome: string; email: string };
  _count: { matches: number };
}

const statusLabels: Record<string, string> = {
  aberta: "Aberta",
  "em-negociacao": "Em negociação",
  fechada: "Fechada",
  cancelada: "Cancelada",
};

const statusColors: Record<string, string> = {
  aberta: "bg-emerald-100 text-emerald-700",
  "em-negociacao": "bg-amber-100 text-amber-700",
  fechada: "bg-blue-100 text-blue-700",
  cancelada: "bg-red-100 text-red-700",
};

const tipoLabels: Record<string, string> = {
  franquia: "Franquia",
  investimento: "Investimento",
  parceria: "Parceria",
  fornecedor: "Fornecedor",
  expansao: "Expansão",
};

const tipoColors: Record<string, string> = {
  franquia: "bg-purple-100 text-purple-700",
  investimento: "bg-emerald-100 text-emerald-700",
  parceria: "bg-blue-100 text-blue-700",
  fornecedor: "bg-orange-100 text-orange-700",
  expansao: "bg-pink-100 text-pink-700",
};

export default function OportunidadesPage() {
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/opportunities")
      .then((r) => r.json())
      .then((data) => { setOpportunities(data); setLoading(false); });
  }, []);

  async function toggleDestaque(opp: AdminOpportunity) {
    setToggling(opp.id);
    const res = await fetch("/api/admin/opportunities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: opp.id, destaque: !opp.destaque }),
    });
    if (res.ok) {
      setOpportunities((prev) => prev.map((o) => o.id === opp.id ? { ...o, destaque: !o.destaque } : o));
    }
    setToggling(null);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/admin/opportunities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setOpportunities((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    }
  }

  const filtered = opportunities.filter((o) => {
    if (filterTipo !== "todos" && o.tipo !== filterTipo) return false;
    if (filterStatus !== "todos" && o.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.titulo.toLowerCase().includes(q) || o.setor.toLowerCase().includes(q) || o.company.nome.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Oportunidades</h1>
        <p className="text-muted text-sm mt-1">
          {opportunities.length} oportunidade(s) — {opportunities.filter((o) => o.status === "aberta").length} abertas
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Abertas", value: opportunities.filter((o) => o.status === "aberta").length, color: "text-emerald-600" },
          { label: "Em negociação", value: opportunities.filter((o) => o.status === "em-negociacao").length, color: "text-amber-600" },
          { label: "Fechadas", value: opportunities.filter((o) => o.status === "fechada").length, color: "text-blue-600" },
          { label: "Total matches", value: opportunities.reduce((a, o) => a + o._count.matches, 0), color: "text-purple-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar por título, setor ou empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground">
          <option value="todos">Todos os tipos</option>
          {Object.entries(tipoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground">
          <option value="todos">Todos os status</option>
          {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted">Nenhuma oportunidade encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Oportunidade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Budget</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Matches</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Destaque</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{o.titulo}</p>
                      <p className="text-xs text-muted mt-0.5">{o.setor}{o.localizacao ? ` · ${o.localizacao}` : ""}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${tipoColors[o.tipo] || "bg-gray-100 text-gray-600"}`}>
                        {tipoLabels[o.tipo] || o.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {o.company.logo ? (
                          <Image src={o.company.logo} alt={`Logo de ${o.company.nome}`} width={24} height={24} className="w-6 h-6 rounded object-cover" />
                        ) : (
                          <Building2 className="w-4 h-4 text-muted" />
                        )}
                        <span className="text-xs text-foreground">{o.company.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-xs text-muted">
                      {o.budget || "—"}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="text-xs font-medium text-purple-600">{o._count.matches}</span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`text-[10px] font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[o.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <button
                        onClick={() => toggleDestaque(o)}
                        disabled={toggling === o.id}
                        className={`transition-colors ${toggling === o.id ? "opacity-50" : ""}`}
                      >
                        {o.destaque ? (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-300 hover:text-amber-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted hidden md:table-cell">
                      {new Date(o.criadoEm).toLocaleDateString("pt-PT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
