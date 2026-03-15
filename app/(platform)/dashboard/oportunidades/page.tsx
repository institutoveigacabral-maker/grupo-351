"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Plus, X, Pencil } from "lucide-react";
import Link from "next/link";

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
  franquia: "bg-purple-50 text-purple-700",
  investimento: "bg-emerald-50 text-emerald-700",
  parceria: "bg-blue-50 text-blue-700",
  fornecedor: "bg-amber-50 text-amber-700",
  expansao: "bg-rose-50 text-rose-700",
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
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Oportunidades</h1>
            <p className="text-sm text-gray-400">{opps.length} oportunidade(s) aberta(s)</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-500 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Publicar"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-black/[0.04] p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Título *</label>
              <input className={inputClass} value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Parceiro logístico para Lisboa" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo *</label>
              <select className={inputClass} value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                {tipos.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Setor *</label>
              <input className={inputClass} value={form.setor} onChange={(e) => set("setor", e.target.value)} placeholder="Food, Tech..." required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Budget</label>
              <input className={inputClass} value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="10k-50k EUR" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Localização</label>
              <input className={inputClass} value={form.localizacao} onChange={(e) => set("localizacao", e.target.value)} placeholder="Lisboa, Portugal" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descrição *</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Descreva a oportunidade em detalhe" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Requisitos</label>
            <textarea className={`${inputClass} resize-none`} rows={2} value={form.requisitos} onChange={(e) => set("requisitos", e.target.value)} placeholder="O que o parceiro ideal deve ter?" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={creating} className="bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-500 transition-all disabled:opacity-50">
            {creating ? "Publicando..." : "Publicar oportunidade"}
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-black/[0.04] p-12 text-center text-gray-400 text-sm">
          Carregando...
        </div>
      ) : opps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.04] p-12 text-center">
          <Lightbulb className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nenhuma oportunidade publicada.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {opps.map((opp) => (
            <div key={opp.id} className="bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-lg hover:shadow-black/[0.02] transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{opp.titulo}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {opp.company.nome} {opp.company.verificada && "•"} {opp.setor}
                    {opp.localizacao && ` — ${opp.localizacao}`}
                  </p>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${tipoColors[opp.tipo] || "bg-gray-50 text-gray-600"}`}>
                  {opp.tipo}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{opp.descricao}</p>
              <div className="flex items-center justify-between mt-2">
                {opp.budget && (
                  <p className="text-xs text-amber-600 font-medium">{opp.budget}</p>
                )}
                <Link
                  href={`/dashboard/oportunidades/${opp.id}/editar`}
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 transition-colors ml-auto"
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
