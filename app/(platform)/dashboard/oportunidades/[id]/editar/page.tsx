"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonPage } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { useOpportunity, useUpdateOpportunity, useDeleteOpportunity } from "@/hooks/queries";
import { ApiError } from "@/lib/api-client";

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
  const oppId = id as string;

  const { data: opp, isLoading, isError } = useOpportunity(oppId);
  const updateMutation = useUpdateOpportunity(oppId);
  const deleteMutation = useDeleteOpportunity();

  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Initialize form from fetched data (once)
  const formData = form ?? (opp ? {
    titulo: opp.titulo || "",
    tipo: opp.tipo || "parceria",
    setor: opp.setor || "",
    descricao: opp.descricao || "",
    requisitos: opp.requisitos || "",
    budget: opp.budget || "",
    localizacao: opp.localizacao || "",
    status: opp.status || "aberta",
  } : null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData) return;
    setError("");
    setSaved(false);

    try {
      await updateMutation.mutateAsync(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar");
    }
  }

  async function handleDelete() {
    if (!confirm("Cancelar esta oportunidade? Ela sera removida do marketplace.")) return;

    try {
      await deleteMutation.mutateAsync(oppId);
      router.push("/dashboard/oportunidades");
    } catch {}
  }

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...(prev ?? formData ?? {}), [field]: value }));

  if (isLoading) return <SkeletonPage />;
  if (isError || !formData) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">
        <p className="text-red-600 text-sm">Oportunidade nao encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader icon={Pencil} iconBg="bg-blue-50" iconColor="text-blue-600" title="Editar oportunidade" />
      </div>

      <Card padding="lg">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Titulo" htmlFor="titulo" required>
              <Input id="titulo" value={formData.titulo} onChange={(e) => set("titulo", e.target.value)} required aria-required="true" />
            </FormField>
            <FormField label="Tipo" htmlFor="tipo" required>
              <Select id="tipo" value={formData.tipo} onChange={(e) => set("tipo", e.target.value)}>
                {tipos.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </Select>
            </FormField>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <FormField label="Setor" htmlFor="setor" required>
              <Input id="setor" value={formData.setor} onChange={(e) => set("setor", e.target.value)} required aria-required="true" />
            </FormField>
            <FormField label="Budget" htmlFor="budget">
              <Input id="budget" value={formData.budget} onChange={(e) => set("budget", e.target.value)} />
            </FormField>
            <FormField label="Localizacao" htmlFor="localizacao">
              <Input id="localizacao" value={formData.localizacao} onChange={(e) => set("localizacao", e.target.value)} />
            </FormField>
          </div>

          <FormField label="Status">
            <div className="flex gap-2" role="radiogroup" aria-label="Status da oportunidade">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={formData.status === s}
                  onClick={() => set("status", s)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition-all ${
                    formData.status === s ? statusColors[s] : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Descricao" htmlFor="descricao" required>
            <Textarea id="descricao" rows={4} value={formData.descricao} onChange={(e) => set("descricao", e.target.value)} required aria-required="true" />
          </FormField>

          <FormField label="Requisitos" htmlFor="requisitos">
            <Textarea id="requisitos" rows={2} value={formData.requisitos} onChange={(e) => set("requisitos", e.target.value)} />
          </FormField>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {saved && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2" role="status">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-emerald-700 text-sm">Alteracoes salvas com sucesso!</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <Button type="button" variant="danger" size="sm" onClick={handleDelete}>
              Cancelar oportunidade
            </Button>
            <Button type="submit" loading={updateMutation.isPending} variant={saved ? "success" : "primary"} size="lg">
              <Save className="w-4 h-4" />
              {saved ? "Salvo!" : "Salvar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
