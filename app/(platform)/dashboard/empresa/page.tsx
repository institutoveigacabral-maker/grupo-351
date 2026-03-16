"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Save, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonPage } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { useMe } from "@/hooks/queries";
import { api, ApiError, type Company } from "@/lib/api-client";

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
  const { data: me, isLoading: meLoading } = useMe();
  const qc = useQueryClient();

  const companySlug = me?.company?.slug;
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["company", companySlug],
    queryFn: () => api.company(companySlug!),
    enabled: !!companySlug,
    staleTime: 5 * 60_000,
  });

  const isNew = !meLoading && !companySlug;
  const loading = meLoading || (!!companySlug && companyLoading);

  const [form, setForm] = useState<{
    nome: string; slug: string; tagline: string; descricao: string;
    setor: string; pais: string; cidade: string; website: string;
    linkedin: string; estagio: string; faturamento: string; interesses: string[];
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Initialize form from fetched company (or defaults for new)
  const formData = form ?? (company ? {
    nome: company.nome, slug: company.slug, tagline: company.tagline || "",
    descricao: company.descricao || "", setor: company.setor, pais: company.pais,
    cidade: company.cidade || "", website: company.website || "",
    linkedin: company.linkedin || "", estagio: company.estagio,
    faturamento: company.faturamento || "", interesses: company.interesses || [],
  } : {
    nome: "", slug: "", tagline: "", descricao: "", setor: "", pais: "Portugal",
    cidade: "", website: "", linkedin: "", estagio: "operando", faturamento: "",
    interesses: [] as string[],
  });

  function set(field: string, value: string | string[]) {
    setForm((prev) => ({ ...(prev ?? formData), [field]: value }));
  }

  function toggleInteresse(tag: string) {
    const current = formData.interesses;
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
        await api.createCompany({ ...formData, slug: formData.slug || autoSlug(formData.nome) });
        qc.invalidateQueries({ queryKey: ["me"] });
      } else if (company) {
        const { slug: _slug, ...updates } = formData;
        await api.updateCompany(company.slug, updates);
        qc.invalidateQueries({ queryKey: ["company", company.slug] });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SkeletonPage />;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        icon={Building2}
        title={isNew ? "Criar empresa" : "Perfil da empresa"}
        description={isNew ? "Registre sua empresa para acessar o ecossistema" : "Gerencie informacoes publicas"}
      />

      <Card padding="lg">
        <div className="space-y-5">
          {/* Nome e Slug */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Nome da empresa" htmlFor="nome" required>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => {
                  set("nome", e.target.value);
                  if (isNew) set("slug", autoSlug(e.target.value));
                }}
                placeholder="Minha Empresa"
                aria-required="true"
              />
            </FormField>
            <FormField label="Slug (URL)" htmlFor="slug" required>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="minha-empresa"
                disabled={!isNew}
                aria-required="true"
              />
            </FormField>
          </div>

          {/* Tagline */}
          <FormField label="Tagline" htmlFor="tagline">
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="Frase curta sobre a empresa"
            />
          </FormField>

          {/* Descricao */}
          <FormField label="Descricao" htmlFor="descricao">
            <Textarea
              id="descricao"
              rows={3}
              value={formData.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Conte sobre sua empresa, mercado e objetivos"
            />
          </FormField>

          {/* Divisor */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Informacoes do negocio</p>
          </div>

          {/* Setor, Pais, Cidade */}
          <div className="grid md:grid-cols-3 gap-4">
            <FormField label="Setor" htmlFor="setor" required>
              <Input
                id="setor"
                value={formData.setor}
                onChange={(e) => set("setor", e.target.value)}
                placeholder="Foodtech, SaaS..."
                aria-required="true"
              />
            </FormField>
            <FormField label="Pais" htmlFor="pais" required>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => set("pais", e.target.value)}
                aria-required="true"
              />
            </FormField>
            <FormField label="Cidade" htmlFor="cidade">
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => set("cidade", e.target.value)}
                placeholder="Lisboa, Cascais..."
              />
            </FormField>
          </div>

          {/* Website e LinkedIn */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Website" htmlFor="website">
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://..."
              />
            </FormField>
            <FormField label="LinkedIn" htmlFor="linkedin">
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </FormField>
          </div>

          {/* Estagio e Faturamento */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Estagio" htmlFor="estagio">
              <Select id="estagio" value={formData.estagio} onChange={(e) => set("estagio", e.target.value)}>
                {estagios.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Faturamento anual" htmlFor="faturamento">
              <Select id="faturamento" value={formData.faturamento} onChange={(e) => set("faturamento", e.target.value)}>
                <option value="">Prefiro nao informar</option>
                {faixas.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </Select>
            </FormField>
          </div>

          {/* Interesses */}
          <FormField label="Interesses">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Selecione seus interesses">
              {interesseOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInteresse(tag)}
                  aria-pressed={formData.interesses.includes(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    formData.interesses.includes(tag)
                      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200 shadow-sm"
                      : "bg-gray-50 text-gray-500 ring-1 ring-gray-100 hover:bg-gray-100 hover:ring-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </FormField>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={saving || !formData.nome || !formData.setor || !formData.pais}
              loading={saving}
              variant={saved ? "success" : "primary"}
              size="lg"
            >
              {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Salvo" : isNew ? "Criar empresa" : "Salvar alteracoes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
