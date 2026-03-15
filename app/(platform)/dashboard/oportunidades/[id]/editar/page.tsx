"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const tipos = ["franquia", "investimento", "parceria", "fornecedor", "expansao"] as const;
const statuses = ["aberta", "em-negociacao", "fechada", "cancelada"] as const;

export default function EditarOportunidadePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    titulo: "", tipo: "parceria", setor: "", descricao: "",
    requisitos: "", budget: "", localizacao: "", status: "aberta",
  });

  useEffect(() => {
    fetch(`/api/platform/opportunities/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((opp) => {
        setForm({
          titulo: opp.titulo || "",
          tipo: opp.tipo || "parceria",
          setor: opp.setor || "",
          descricao: opp.descricao || "",
          requisitos: opp.requisitos || "",
          budget: opp.budget || "",
          localizacao: opp.localizacao || "",
          status: opp.status || "aberta",
        });
      })
      .catch(() => setError("Oportunidade não encontrada"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/platform/opportunities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao salvar");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Cancelar esta oportunidade? Ela será removida do marketplace.")) return;

    const res = await fetch(`/api/platform/opportunities/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/oportunidades");
    }
  }

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition-all";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Editar oportunidade</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-black/[0.04] p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Título *</label>
            <input className={inputClass} value={form.titulo} onChange={(e) => set("titulo", e.target.value)} required />
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
            <input className={inputClass} value={form.setor} onChange={(e) => set("setor", e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Budget</label>
            <input className={inputClass} value={form.budget} onChange={(e) => set("budget", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Localização</label>
            <input className={inputClass} value={form.localizacao} onChange={(e) => set("localizacao", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Descrição *</label>
          <textarea className={`${inputClass} resize-none`} rows={4} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} required />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Requisitos</label>
          <textarea className={`${inputClass} resize-none`} rows={2} value={form.requisitos} onChange={(e) => set("requisitos", e.target.value)} />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saved && <p className="text-emerald-600 text-sm">Alterações salvas com sucesso!</p>}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Cancelar oportunidade
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              saved ? "bg-emerald-500 text-white" : "bg-amber-600 text-white hover:bg-amber-500"
            } disabled:opacity-50`}
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
