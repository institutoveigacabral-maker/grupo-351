"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Upload, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonPage } from "@/components/ui/skeleton";

interface Doc {
  id: string;
  tipo: string;
  nome: string;
  url: string;
  status: string;
  criadoEm: string;
}

const tipoLabels: Record<string, string> = {
  nif: "NIF / NIPC",
  certidao: "Certidao Comercial",
  contrato: "Contrato Social",
  outro: "Outro",
};

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  pendente: { icon: Clock, color: "text-amber-500 bg-amber-50", label: "Pendente" },
  aprovado: { icon: CheckCircle, color: "text-emerald-500 bg-emerald-50", label: "Aprovado" },
  rejeitado: { icon: XCircle, color: "text-red-500 bg-red-50", label: "Rejeitado" },
};

export default function VerificacaoPage() {
  const [verificada, setVerificada] = useState(false);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ tipo: "nif", nome: "", url: "" });

  function load() {
    fetch("/api/platform/verification")
      .then((r) => r.json())
      .then((data) => {
        setVerificada(data.verificada || false);
        setDocuments(data.documents || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/platform/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao submeter");
        return;
      }
      setSuccess("Documento submetido para analise");
      setForm({ tipo: "nif", nome: "", url: "" });
      load();
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all placeholder:text-gray-300";

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader icon={ShieldCheck} iconBg="bg-blue-50" iconColor="text-blue-600" title="Verificacao da Empresa" description={verificada ? "Empresa verificada" : "Submeta documentos para verificar a sua empresa"} />

      {verificada && (
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-200/60 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Empresa verificada</p>
            <p className="text-xs text-emerald-600 mt-0.5">O selo de verificacao aparece no perfil publico da sua empresa.</p>
          </div>
        </div>
      )}

      {!verificada && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/[0.04] p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Upload className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Submeter documento</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tipo *</label>
              <select className={inputClass} value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}>
                {Object.entries(tipoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nome do ficheiro *</label>
              <input className={inputClass} value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Ex: NIF_empresa.pdf" required />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">URL do ficheiro *</label>
              <input className={inputClass} type="url" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://drive.google.com/..." required />
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Faca upload do documento no Google Drive ou outro servico e cole o link publico aqui.</p>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-emerald-700 text-sm">{success}</p>
            </div>
          )}

          <button type="submit" disabled={submitting} className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50">
            {submitting ? "Submetendo..." : "Submeter documento"}
          </button>
        </form>
      )}

      {/* Documents list */}
      {documents.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-black/[0.04] bg-gray-50/50">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Documentos submetidos</h3>
          </div>
          <div className="divide-y divide-black/[0.03]">
            {documents.map((doc) => {
              const st = statusConfig[doc.status] || statusConfig.pendente;
              const StatusIcon = st.icon;
              return (
                <div key={doc.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.nome}</p>
                      <p className="text-xs text-gray-400">{tipoLabels[doc.tipo] || doc.tipo} — {new Date(doc.criadoEm).toLocaleDateString("pt-PT")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${st.color.split(" ")[1]} flex items-center justify-center`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${st.color.split(" ")[0]}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
