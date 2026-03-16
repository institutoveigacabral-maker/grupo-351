"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Copy, Trash2, Check, Shield, Code, X } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPage } from "@/components/ui/skeleton";

interface ApiKeyData {
  id: string;
  key: string;
  nome: string;
  scopes: string[];
  ativa: boolean;
  ultimoUso: string | null;
  criadoEm: string;
}

const AVAILABLE_SCOPES = [
  { id: "companies:read", label: "Ler empresas" },
  { id: "opportunities:read", label: "Ler oportunidades" },
  { id: "opportunities:write", label: "Criar oportunidades" },
  { id: "matches:read", label: "Ler matches" },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [scopes, setScopes] = useState<string[]>(["companies:read", "opportunities:read"]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    const res = await fetch("/api/platform/api-keys");
    if (res.ok) setKeys(await res.json());
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/platform/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, scopes }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setNewKey(data.key);
      setShowForm(false);
      setNome("");
      setScopes(["companies:read", "opportunities:read"]);
      fetchKeys();
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revogar esta chave? Esta acao nao pode ser desfeita.")) return;

    const res = await fetch(`/api/platform/api-keys?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchKeys();
  }

  function toggleScope(scope: string) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <SkeletonPage />;

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader icon={Key} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="API Keys" description="Gerencie o acesso a API publica v1">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Nova chave"}
        </button>
      </PageHeader>

      {/* New key alert */}
      {newKey && (
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-200/60 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-900">
                Chave criada com sucesso!
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">Copie agora — ela nao sera exibida novamente.</p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 bg-white border border-emerald-200/60 rounded-xl px-3 py-2.5 text-xs font-mono text-gray-800 break-all">
                  {newKey}
                </code>
                <button
                  onClick={copyKey}
                  className="shrink-0 p-2.5 bg-white border border-emerald-200/60 rounded-xl hover:bg-emerald-50 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 ml-12 text-xs text-emerald-600 hover:text-emerald-800 font-medium"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-black/[0.04] p-6 space-y-5 shadow-sm">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nome da chave</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Integracao CRM, App Mobile..."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all placeholder:text-gray-300"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Permissoes (scopes)</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SCOPES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleScope(id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm transition-all ${
                    scopes.includes(id)
                      ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200 shadow-sm"
                      : "bg-gray-50 text-gray-500 ring-1 ring-gray-100 hover:bg-gray-100"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    scopes.includes(id) ? "bg-amber-500 border-amber-500" : "border-gray-300"
                  }`}>
                    {scopes.includes(id) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || scopes.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {creating ? "Criando..." : "Criar chave"}
            </button>
          </div>
        </form>
      )}

      {/* Keys list */}
      <div className="space-y-3">
        {keys.length === 0 ? (
          <EmptyState
            icon={Key}
            title="Nenhuma chave API criada"
            description="Crie uma chave para integrar com a API publica. Requer plano Enterprise."
          />
        ) : (
          keys.map((k) => (
            <div
              key={k.id}
              className={`bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300 ${
                !k.ativa ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{k.nome}</p>
                    {!k.ativa && (
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium ring-1 ring-red-600/10">
                        Revogada
                      </span>
                    )}
                  </div>
                  <code className="text-xs text-gray-400 font-mono mt-1 block">{k.key}</code>
                </div>

                {k.ativa && (
                  <button
                    onClick={() => handleRevoke(k.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                    title="Revogar chave"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {k.scopes.map((s) => (
                  <span key={s} className="text-[10px] bg-gray-50 text-gray-500 px-2.5 py-0.5 rounded-full ring-1 ring-gray-100 font-medium">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-2.5 flex items-center gap-4 text-[10px] text-gray-400">
                <span>Criada: {new Date(k.criadoEm).toLocaleDateString("pt-PT")}</span>
                {k.ultimoUso && (
                  <span>Ultimo uso: {new Date(k.ultimoUso).toLocaleDateString("pt-PT")}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Docs hint */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-gray-500" />
          <p className="text-sm font-semibold text-gray-700">Como usar a API</p>
        </div>
        <code className="block bg-white border border-gray-200/60 rounded-xl p-4 font-mono text-[11px] text-gray-600 leading-relaxed">
          curl -H &quot;Authorization: Bearer pk351_xxx&quot; \<br />
          &nbsp;&nbsp;https://grupo351.com/api/v1/companies
        </code>
        <p className="mt-3 text-xs text-gray-400">
          Endpoints: <code className="bg-white px-1.5 py-0.5 rounded text-gray-600 text-[10px]">/api/v1/companies</code>{" "}
          <code className="bg-white px-1.5 py-0.5 rounded text-gray-600 text-[10px]">/api/v1/opportunities</code>
        </p>
      </div>
    </div>
  );
}
