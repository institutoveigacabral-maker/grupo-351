"use client";

import { useEffect, useState } from "react";
import { Building2, Save, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonPage } from "@/components/ui/skeleton";

interface CompanyData {
  slug: string;
  nome: string;
  tagline?: string;
  descricao?: string;
  setor: string;
  pais: string;
  cidade?: string;
  website?: string;
  linkedin?: string;
  estagio: string;
  faturamento?: string;
  interesses: string[];
}

const estagios = [
  { value: "ideacao", label: "Ideacao" },
  { value: "validacao", label: "Validacao" },
  { value: "operando", label: "Em operacao" },
  { value: "escala", label: "Escala" },
  { value: "consolidado", label: "Consolidado" },
];

const faixas = [
  { value: "ate-100k", label: "Ate 100k EUR" },
  { value: "100k-500k", label: "100k-500k EUR" },
  { value: "500k-1m", label: "500k-1M EUR" },
  { value: "1m-5m", label: "1M-5M EUR" },
  { value: "5m+", label: "5M+ EUR" },
];

const interesseOptions = [
  "expansao", "investimento", "fornecedor", "franquia", "mentoria",
  "tecnologia", "logistica", "marketing", "financeiro", "legal",
];

export default function EmpresaPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    nome: "", slug: "", tagline: "", descricao: "", setor: "", pais: "Portugal",
    cidade: "", website: "", linkedin: "", estagio: "operando", faturamento: "",
    interesses: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform/me")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(async (u) => {
        if (u.company) {
          const r = await fetch(`/api/platform/companies/${u.company.slug}`);
          if (!r.ok) throw new Error();
          const c = await r.json();
          setCompany(c);
          setForm({
            nome: c.nome, slug: c.slug, tagline: c.tagline || "",
            descricao: c.descricao || "", setor: c.setor, pais: c.pais,
            cidade: c.cidade || "", website: c.website || "",
            linkedin: c.linkedin || "", estagio: c.estagio,
            faturamento: c.faturamento || "", interesses: c.interesses || [],
          });
        } else {
          setIsNew(true);
        }
      })
      .catch(() => { setIsNew(true); })
      .finally(() => setLoading(false));
  }, []);

  function set(field: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleInteresse(tag: string) {
    const current = form.interesses;
    set("interesses", current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]);
  }

  function autoSlug(nome: string) {
    return nome
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);
  }

  async function handleSave() {
    setError("");
    setSaving(true);

    try {
      if (isNew) {
        const res = await fetch("/api/platform/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, slug: form.slug || autoSlug(form.nome) }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Erro ao criar empresa");
          return;
        }
        const created = await res.json();
        setCompany(created);
        setIsNew(false);
      } else if (company) {
        const { slug: _, ...updates } = form;
        const res = await fetch(`/api/platform/companies/${company.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Erro ao atualizar");
          return;
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SkeletonPage />;

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all placeholder:text-gray-300";

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        icon={Building2}
        title={isNew ? "Criar empresa" : "Perfil da empresa"}
        description={isNew ? "Registre sua empresa para acessar o ecossistema" : "Gerencie informacoes publicas"}
      />

      <div className="bg-white rounded-2xl border border-black/[0.04] p-6 space-y-5 shadow-sm">
        {/* Nome e Slug */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nome da empresa *</label>
            <input
              className={inputClass}
              value={form.nome}
              onChange={(e) => {
                set("nome", e.target.value);
                if (isNew) set("slug", autoSlug(e.target.value));
              }}
              placeholder="Minha Empresa"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Slug (URL) *</label>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="minha-empresa"
              disabled={!isNew}
            />
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tagline</label>
          <input
            className={inputClass}
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="Frase curta sobre a empresa"
          />
        </div>

        {/* Descricao */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Descricao</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Conte sobre sua empresa, mercado e objetivos"
          />
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Informacoes do negocio</p>
        </div>

        {/* Setor, Pais, Cidade */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Setor *</label>
            <input
              className={inputClass}
              value={form.setor}
              onChange={(e) => set("setor", e.target.value)}
              placeholder="Foodtech, SaaS..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Pais *</label>
            <input
              className={inputClass}
              value={form.pais}
              onChange={(e) => set("pais", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Cidade</label>
            <input
              className={inputClass}
              value={form.cidade}
              onChange={(e) => set("cidade", e.target.value)}
              placeholder="Lisboa, Cascais..."
            />
          </div>
        </div>

        {/* Website e LinkedIn */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Website</label>
            <input
              className={inputClass}
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">LinkedIn</label>
            <input
              className={inputClass}
              value={form.linkedin}
              onChange={(e) => set("linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </div>

        {/* Estagio e Faturamento */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Estagio</label>
            <select className={inputClass} value={form.estagio} onChange={(e) => set("estagio", e.target.value)}>
              {estagios.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Faturamento anual</label>
            <select className={inputClass} value={form.faturamento} onChange={(e) => set("faturamento", e.target.value)}>
              <option value="">Prefiro nao informar</option>
              {faixas.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {/* Interesses */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Interesses</label>
          <div className="flex flex-wrap gap-2">
            {interesseOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleInteresse(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  form.interesses.includes(tag)
                    ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200 shadow-sm"
                    : "bg-gray-50 text-gray-500 ring-1 ring-gray-100 hover:bg-gray-100 hover:ring-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !form.nome || !form.setor || !form.pais}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:shadow-lg hover:shadow-amber-500/20"
            }`}
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando..." : saved ? "Salvo" : isNew ? "Criar empresa" : "Salvar alteracoes"}
          </button>
        </div>
      </div>
    </div>
  );
}
