"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Plus, X, Pencil, Wallet, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPage } from "@/components/ui/skeleton";

interface Opp {
  id: string;
  titulo: string;
  tipo: string;
  setor: string;
  descricao: string;
  budget?: string;
  localizacao?: string;
  criadoEm: string;
  company: { slug: string; nome: string; verificada: boolean };
}

const tipos = ["franquia", "investimento", "parceria", "fornecedor", "expansao"] as const;

const tipoColors: Record<string, string> = {
  franquia: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/10",
  investimento: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
  parceria: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10",
  fornecedor: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
  expansao: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10",
};

export default function OportunidadesPage() {
  const [opps, setOpps] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titulo: "", tipo: "parceria" as string, setor: "", descricao: "",
    requisitos: "", budget: "", localizacao: "",
  });

  function loadOpps() {
    fetch("/api/platform/opportunities?limit=50")
      .then((r) => r.json())
      .then((d) => setOpps(d.opportunities || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadOpps(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const res = await fetch("/api/platform/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar");
        return;
      }

      setShowForm(false);
      setForm({ titulo: "", tipo: "parceria", setor: "", descricao: "", requisitos: "", budget: "", localizacao: "" });
      loadOpps();
    } finally {
      setCreating(false);
    }
  }

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all placeholder:text-gray-300";

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-6">
      <PageHeader icon={Lightbulb} iconBg="bg-blue-50" iconColor="text-blue-600" title="Oportunidades" description={`${opps.length} oportunidade(s) aberta(s)`}>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Publicar"}
        </button>
      </PageHeader>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-black/[0.04] p-6 space-y-5 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Titulo *</label>
              <input className={inputClass} value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Parceiro logistico para Lisboa" required />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tipo *</label>
              <select className={inputClass} value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                {tipos.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Setor *</label>
              <input className={inputClass} value={form.setor} onChange={(e) => set("setor", e.target.value)} placeholder="Food, Tech..." required />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Budget</label>
              <input className={inputClass} value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="10k-50k EUR" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Localizacao</label>
              <input className={inputClass} value={form.localizacao} onChange={(e) => set("localizacao", e.target.value)} placeholder="Lisboa, Portugal" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Descricao *</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Descreva a oportunidade em detalhe" required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Requisitos</label>
            <textarea className={`${inputClass} resize-none`} rows={2} value={form.requisitos} onChange={(e) => set("requisitos", e.target.value)} placeholder="O que o parceiro ideal deve ter?" />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <button type="submit" disabled={creating} className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50">
            {creating ? "Publicando..." : "Publicar oportunidade"}
          </button>
        </form>
      )}

      {/* List */}
      {opps.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Nenhuma oportunidade publicada"
          description="Crie sua primeira oportunidade para comecar a receber matches."
          action={{ label: "Publicar oportunidade", href: "#" }}
        />
      ) : (
        <div className="grid gap-4">
          {opps.map((opp) => (
            <div key={opp.id} className="group bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-xl hover:shadow-black/[0.03] hover:border-black/[0.06] transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">{opp.titulo}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{opp.company.nome}</span>
                    {opp.company.verificada && (
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    )}
                    <span className="text-xs text-gray-300">{opp.setor}</span>
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${tipoColors[opp.tipo] || "bg-gray-50 text-gray-600 ring-1 ring-gray-600/10"}`}>
                  {opp.tipo}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{opp.descricao}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-4">
                  {opp.budget && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                      <Wallet className="w-3 h-3" />
                      {opp.budget}
                    </span>
                  )}
                  {opp.localizacao && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {opp.localizacao}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-300">
                    <Calendar className="w-3 h-3" />
                    {new Date(opp.criadoEm).toLocaleDateString("pt-PT")}
                  </span>
                </div>
                <Link
                  href={`/dashboard/oportunidades/${opp.id}/editar`}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
