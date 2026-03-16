"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonPage } from "@/components/ui/skeleton";

const tipos = ["franquia", "investimento", "parceria", "fornecedor", "expansao"] as const;
const statuses = ["aberta", "em-negociacao", "fechada", "cancelada"] as const;

const statusColors: Record<string, string> = {
  aberta: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
  "em-negociacao": "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10",
  fechada: "bg-gray-50 text-gray-600 ring-1 ring-gray-600/10",
  cancelada: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
};

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
      .catch(() => setError("Oportunidade nao encontrada"))
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
    if (!confirm("Cancelar esta oportunidade? Ela sera removida do marketplace.")) return;

    const res = await fetch(`/api/platform/opportunities/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/oportunidades");
    }
  }

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all placeholder:text-gray-300";

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader icon={Pencil} iconBg="bg-blue-50" iconColor="text-blue-600" title="Editar oportunidade" />
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-black/[0.04] p-6 space-y-5 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Titulo *</label>
            <input className={inputClass} value={form.titulo} onChange={(e) => set("titulo", e.target.value)} required />
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
            <input className={inputClass} value={form.setor} onChange={(e) => set("setor", e.target.value)} required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Budget</label>
            <input className={inputClass} value={form.budget} onChange={(e) => set("budget", e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Localizacao</label>
            <input className={inputClass} value={form.localizacao} onChange={(e) => set("localizacao", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
          <div className="flex gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("status", s)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition-all ${
                  form.status === s ? statusColors[s] : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Descricao *</label>
          <textarea className={`${inputClass} resize-none`} rows={4} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} required />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Requisitos</label>
          <textarea className={`${inputClass} resize-none`} rows={2} value={form.requisitos} onChange={(e) => set("requisitos", e.target.value)} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {saved && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-emerald-700 text-sm">Alteracoes salvas com sucesso!</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors hover:bg-red-50 px-3 py-1.5 rounded-lg"
          >
            Cancelar oportunidade
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
              saved ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:shadow-lg hover:shadow-amber-500/20"
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
