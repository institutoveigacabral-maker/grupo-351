"use client";

import { useEffect, useState } from "react";
import { Search, ArrowRight, BadgeCheck, XCircle, Building2 } from "lucide-react";
import Image from "next/image";

interface AdminCompany {
  id: string;
  slug: string;
  nome: string;
  tagline: string | null;
  setor: string;
  pais: string;
  cidade: string | null;
  estagio: string;
  faturamento: string | null;
  verificada: boolean;
  ativa: boolean;
  logo: string | null;
  criadoEm: string;
  owner: { id: string; nome: string; email: string };
  subscription: { plano: string; status: string } | null;
  _count: { opportunities: number; members: number; projects: number };
}

const estagioLabels: Record<string, string> = {
  ideacao: "Ideação",
  validacao: "Validação",
  operando: "Operando",
  escala: "Escala",
  consolidado: "Consolidado",
};

const estagioColors: Record<string, string> = {
  ideacao: "bg-gray-100 text-gray-600",
  validacao: "bg-yellow-100 text-yellow-700",
  operando: "bg-blue-100 text-blue-700",
  escala: "bg-purple-100 text-purple-700",
  consolidado: "bg-emerald-100 text-emerald-700",
};

const planoColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  growth: "bg-accent/10 text-accent",
  enterprise: "bg-amber-100 text-amber-700",
};

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSetor, setFilterSetor] = useState<string>("todos");
  const [filterEstagio, setFilterEstagio] = useState<string>("todos");
  const [filterVerificada, setFilterVerificada] = useState<string>("todos");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/companies")
      .then((r) => r.json())
      .then((data) => { setCompanies(data); setLoading(false); });
  }, []);

  const setores = [...new Set(companies.map((c) => c.setor))].sort();

  async function toggleVerificada(company: AdminCompany) {
    setToggling(company.id);
    const res = await fetch(`/api/admin/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificada: !company.verificada }),
    });
    if (res.ok) {
      setCompanies((prev) => prev.map((c) => c.id === company.id ? { ...c, verificada: !c.verificada } : c));
    }
    setToggling(null);
  }

  const filtered = companies.filter((c) => {
    if (filterSetor !== "todos" && c.setor !== filterSetor) return false;
    if (filterEstagio !== "todos" && c.estagio !== filterEstagio) return false;
    if (filterVerificada === "sim" && !c.verificada) return false;
    if (filterVerificada === "nao" && c.verificada) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.nome.toLowerCase().includes(q) || c.setor.toLowerCase().includes(q) || c.owner.nome.toLowerCase().includes(q) || c.pais.toLowerCase().includes(q);
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
        <h1 className="text-2xl font-bold text-foreground font-display">Empresas</h1>
        <p className="text-muted text-sm mt-1">
          {companies.length} empresa(s) — {companies.filter((c) => c.verificada).length} verificadas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome, setor, dono ou país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <select
          value={filterSetor}
          onChange={(e) => setFilterSetor(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground"
        >
          <option value="todos">Todos os setores</option>
          {setores.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterEstagio}
          onChange={(e) => setFilterEstagio(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground"
        >
          <option value="todos">Todos os estágios</option>
          {Object.entries(estagioLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select
          value={filterVerificada}
          onChange={(e) => setFilterVerificada(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground"
        >
          <option value="todos">Verificação</option>
          <option value="sim">Verificadas</option>
          <option value="nao">Não verificadas</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted">Nenhuma empresa encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Setor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Estágio</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Plano</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Dono</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Atividade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Verificada</th>
                  <th className="py-3 px-4 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {c.logo ? (
                          <Image src={c.logo} alt={`Logo de ${c.nome}`} width={32} height={32} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary/60" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{c.nome}</p>
                          <p className="text-xs text-muted">{c.pais}{c.cidade ? ` · ${c.cidade}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-xs text-muted">{c.setor}</span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${estagioColors[c.estagio] || "bg-gray-100 text-gray-600"}`}>
                        {estagioLabels[c.estagio] || c.estagio}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {c.subscription ? (
                        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${planoColors[c.subscription.plano] || "bg-gray-100 text-gray-600"}`}>
                          {c.subscription.plano.charAt(0).toUpperCase() + c.subscription.plano.slice(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div>
                        <p className="text-xs text-foreground">{c.owner.nome}</p>
                        <p className="text-[10px] text-muted">{c.owner.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="text-xs text-muted">
                        <span>{c._count.opportunities} oport.</span>
                        <span className="mx-1">·</span>
                        <span>{c._count.members} membros</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleVerificada(c)}
                        disabled={toggling === c.id}
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                          c.verificada
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        } ${toggling === c.id ? "opacity-50" : ""}`}
                      >
                        {c.verificada ? <BadgeCheck className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {c.verificada ? "Sim" : "Não"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`/admin/empresas/${c.id}`}
                        className="text-accent hover:text-accent-light transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </a>
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
