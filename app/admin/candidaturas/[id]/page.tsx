"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Linkedin,
  Wallet,
  Clock,
  Target,
  FileText,
  Shield,
  CheckCircle,
} from "lucide-react";
import type { Candidatura, CandidaturaStatus } from "@/lib/admin-types";

const statusOptions: { value: CandidaturaStatus; label: string; color: string }[] = [
  { value: "nova", label: "Nova", color: "bg-accent" },
  { value: "em-analise", label: "Em análise", color: "bg-warning" },
  { value: "entrevista", label: "Entrevista", color: "bg-primary" },
  { value: "aprovada", label: "Aprovada", color: "bg-success" },
  { value: "recusada", label: "Recusada", color: "bg-error" },
  { value: "arquivada", label: "Arquivada", color: "bg-muted" },
];

const socios = ["Henrique Lemos", "Fernando Vieira", "Herson Rosa"];

function Field({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted" />
      </div>
      <div>
        <p className="text-[10px] text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground">{value || "\u2014"}</p>
      </div>
    </div>
  );
}

export default function CandidaturaDetalhe() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Candidatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notas, setNotas] = useState("");
  const [status, setStatus] = useState<CandidaturaStatus>("nova");
  const [atribuido, setAtribuido] = useState("");

  useEffect(() => {
    fetch(`/api/admin/candidaturas/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        setData(d);
        setNotas(d.notas || "");
        setStatus(d.status);
        setAtribuido(d.atribuidoA || "");
        setLoading(false);
      })
      .catch(() => router.push("/admin/candidaturas"));
  }, [params.id, router]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/candidaturas/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notas, atribuidoA: atribuido || undefined }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/candidaturas")}
          className="text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground font-display">{data.nome}</h1>
          <p className="text-muted text-sm">
            Candidatura de {new Date(data.criadoEm).toLocaleDateString("pt-PT", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados pessoais */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Dados pessoais</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field icon={User} label="Nome" value={data.nome} />
              <Field icon={Mail} label="Email" value={data.email} />
              <Field icon={Phone} label="Telefone" value={data.telefone} />
              <Field icon={MapPin} label="Localização" value={`${data.cidade}, ${data.pais}`} />
              <Field icon={Target} label="Perfil" value={data.perfil} />
              <Field icon={Linkedin} label="LinkedIn" value={data.linkedin} />
            </div>
          </div>

          {/* Experiência */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Experiência</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field icon={Briefcase} label="Setor" value={data.setor} />
              <Field icon={Briefcase} label="Empresa atual" value={data.empresaAtual} />
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Resumo</p>
              <p className="text-sm text-foreground bg-surface rounded-lg p-3 leading-relaxed">
                {data.experiencia}
              </p>
            </div>
          </div>

          {/* Modelo e investimento */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Modelo e investimento</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Field icon={Wallet} label="Capital" value={data.capitalDisponivel} />
              <Field icon={Clock} label="Prazo" value={data.prazo} />
              <Field icon={Target} label="Dedicação" value={data.dedicacao} />
            </div>
            <div className="mb-4">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Marcas de interesse</p>
              <div className="flex flex-wrap gap-2">
                {data.modelo.map((m) => (
                  <span key={m} className="text-xs font-medium text-accent bg-accent/5 px-3 py-1 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Proposta */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Proposta</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Motivação</p>
                <p className="text-sm text-foreground bg-surface rounded-lg p-3 leading-relaxed">
                  {data.motivacao}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Diferenciais</p>
                <p className="text-sm text-foreground bg-surface rounded-lg p-3 leading-relaxed">
                  {data.diferenciais}
                </p>
              </div>
              {data.disponibilidade && (
                <Field icon={Clock} label="Disponibilidade" value={data.disponibilidade} />
              )}
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-foreground">
                  NDA preliminar {data.aceitaNDA ? "aceito" : "não aceito"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar — Admin actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6 sticky top-20">
            <h2 className="font-semibold text-foreground mb-4">Ações</h2>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={`text-xs font-medium px-3 py-2 rounded-lg border-2 transition-all ${
                        status === opt.value
                          ? `${opt.color} text-white border-transparent`
                          : "border-border text-muted hover:border-accent/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Atribuir */}
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">
                  Atribuir a
                </label>
                <select
                  value={atribuido}
                  onChange={(e) => setAtribuido(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground"
                >
                  <option value="">Nenhum</option>
                  {socios.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">
                  Notas internas
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground resize-none"
                  placeholder="Observações sobre o candidato..."
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-light transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Salvo
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
