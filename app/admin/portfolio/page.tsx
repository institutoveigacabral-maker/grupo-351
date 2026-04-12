"use client";

import {
  Save,
  CheckCircle,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { iconMap, statusColor, emptyProjeto } from "./shared";
import { usePortfolio } from "./usePortfolio";
import { ProjectForm } from "./components/ProjectForm";

export default function PortfolioAdminPage() {
  const pf = usePortfolio();

  if (pf.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Portfolio</h1>
          <p className="text-muted text-sm mt-1">
            {pf.projetos.length} marcas — edite, adicione ou exclua
          </p>
        </div>
        <button
          onClick={() => pf.setShowNew(!pf.showNew)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-all"
        >
          {pf.showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {pf.showNew ? "Cancelar" : "Nova Marca"}
        </button>
      </div>

      {pf.error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4" />
          {pf.error}
        </div>
      )}

      {pf.showNew && (
        <div className="bg-white rounded-xl border-2 border-accent/20 p-6 space-y-4">
          <h2 className="font-bold text-foreground text-lg">Nova Marca</h2>
          <ProjectForm
            data={pf.newProjeto}
            onChange={(field, value) => pf.setNewProjeto((prev) => ({ ...prev, [field]: value }))}
            onChangeDetalhe={(idx, value) => {
              pf.setNewProjeto((prev) => {
                const detalhes = [...prev.detalhes];
                detalhes[idx] = value;
                return { ...prev, detalhes };
              });
            }}
            onAddDetalhe={() =>
              pf.setNewProjeto((prev) => ({ ...prev, detalhes: [...prev.detalhes, ""] }))
            }
            onRemoveDetalhe={(idx) =>
              pf.setNewProjeto((prev) => ({
                ...prev,
                detalhes: prev.detalhes.filter((_, i) => i !== idx),
              }))
            }
            autoSlug
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                pf.setShowNew(false);
                pf.setNewProjeto({ ...emptyProjeto });
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:bg-surface transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={pf.handleCreate}
              disabled={pf.saving === "__new__" || !pf.newProjeto.name.trim()}
              className="px-6 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-all disabled:opacity-50"
            >
              {pf.saving === "__new__" ? "Criando..." : "Criar Marca"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {pf.projetos.map((p) => {
          const Icon = iconMap[p.icon] || Briefcase;
          const isExpanded = pf.expanded === p.slug;
          const state = pf.editState[p.slug];
          if (!state) return null;
          const statusDot = statusColor[state.status] || "bg-muted";

          return (
            <div
              key={p.slug}
              className={`bg-white rounded-xl border transition-all ${
                pf.dirty[p.slug]
                  ? "border-accent/30 shadow-sm"
                  : isExpanded
                    ? "border-primary/20 shadow-sm"
                    : "border-border"
              }`}
            >
              <button
                onClick={() => pf.setExpanded(isExpanded ? null : p.slug)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-foreground truncate">{p.name}</h3>
                    <span className="text-[10px] font-medium text-muted bg-surface px-2 py-0.5 rounded shrink-0">
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-sm text-muted truncate">{p.tagline}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusDot}`} />
                    <span className="text-xs text-muted hidden sm:inline">{p.status}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border/50 pt-5 space-y-4">
                  <ProjectForm
                    data={state}
                    onChange={(field, value) => pf.updateField(p.slug, field, value)}
                    onChangeDetalhe={(idx, value) => pf.updateDetalhe(p.slug, idx, value)}
                    onAddDetalhe={() => pf.addDetalhe(p.slug)}
                    onRemoveDetalhe={(idx) => pf.removeDetalhe(p.slug, idx)}
                  />

                  <div>
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                      Notas Internas
                    </label>
                    <textarea
                      value={state.notasInternas || ""}
                      onChange={(e) => pf.updateField(p.slug, "notasInternas", e.target.value)}
                      rows={2}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground resize-none placeholder:text-muted/40"
                      placeholder="Notas visiveis apenas para os socios..."
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {pf.confirmDelete === p.slug ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-500">Confirmar exclusao?</span>
                          <button
                            onClick={() => pf.handleDelete(p.slug)}
                            disabled={pf.deleting === p.slug}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-all disabled:opacity-50"
                          >
                            {pf.deleting === p.slug ? "Excluindo..." : "Sim, excluir"}
                          </button>
                          <button
                            onClick={() => pf.setConfirmDelete(null)}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:bg-surface transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => pf.setConfirmDelete(p.slug)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir marca
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => pf.handleSave(p.slug)}
                      disabled={!pf.dirty[p.slug] || pf.saving === p.slug}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                        pf.saved === p.slug
                          ? "bg-success"
                          : pf.dirty[p.slug]
                            ? "bg-primary hover:bg-primary-light"
                            : "bg-muted cursor-not-allowed"
                      }`}
                    >
                      {pf.saving === p.slug ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : pf.saved === p.slug ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {pf.saving === p.slug
                        ? "Salvando..."
                        : pf.saved === p.slug
                          ? "Salvo!"
                          : "Salvar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
