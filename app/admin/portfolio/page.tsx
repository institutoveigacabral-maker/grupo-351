"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Printer,
  ShoppingBag,
  GraduationCap,
  Package,
  Brain,
  Telescope,
  Scissors,
  Save,
  CheckCircle,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Briefcase,
  Rocket,
  Store,
  Lightbulb,
  Wrench,
  Globe,
  Layers,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  printer: Printer,
  "shopping-bag": ShoppingBag,
  "graduation-cap": GraduationCap,
  package: Package,
  brain: Brain,
  telescope: Telescope,
  scissors: Scissors,
  briefcase: Briefcase,
  rocket: Rocket,
  store: Store,
  lightbulb: Lightbulb,
  wrench: Wrench,
  globe: Globe,
  layers: Layers,
};

const iconOptions = Object.keys(iconMap);

const statusOptions = ["Em operação", "Em desenvolvimento", "Em estruturação"] as const;

interface Projeto {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  detalhes: string[];
  tag: string;
  status: string;
  mercado: string;
  parceiro?: string;
  controle: string;
  icon: string;
  socio?: string;
  porcentagem?: number;
  notasInternas?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const emptyProjeto: Projeto = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  detalhes: [""],
  tag: "",
  status: "Em estruturação",
  mercado: "",
  parceiro: "",
  controle: "",
  icon: "briefcase",
  socio: "",
  porcentagem: undefined,
};

export default function PortfolioAdminPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newProjeto, setNewProjeto] = useState<Projeto>({ ...emptyProjeto });
  const [editState, setEditState] = useState<Record<string, Projeto>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const fetchProjetos = useCallback(async () => {
    const res = await fetch("/api/admin/portfolio");
    const data = await res.json();
    setProjetos(data);
    const state: Record<string, Projeto> = {};
    data.forEach((p: Projeto) => {
      state[p.slug] = { ...p };
    });
    setEditState(state);
    setDirty({});
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjetos();
  }, [fetchProjetos]);

  function updateField(slug: string, field: keyof Projeto, value: unknown) {
    setEditState((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value },
    }));
    setDirty((prev) => ({ ...prev, [slug]: true }));
  }

  function updateDetalhe(slug: string, idx: number, value: string) {
    setEditState((prev) => {
      const detalhes = [...prev[slug].detalhes];
      detalhes[idx] = value;
      return { ...prev, [slug]: { ...prev[slug], detalhes } };
    });
    setDirty((prev) => ({ ...prev, [slug]: true }));
  }

  function addDetalhe(slug: string) {
    setEditState((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], detalhes: [...prev[slug].detalhes, ""] },
    }));
    setDirty((prev) => ({ ...prev, [slug]: true }));
  }

  function removeDetalhe(slug: string, idx: number) {
    setEditState((prev) => {
      const detalhes = prev[slug].detalhes.filter((_, i) => i !== idx);
      return { ...prev, [slug]: { ...prev[slug], detalhes } };
    });
    setDirty((prev) => ({ ...prev, [slug]: true }));
  }

  async function handleSave(slug: string) {
    const data = editState[slug];
    if (!data) return;
    setSaving(slug);
    setError("");
    const res = await fetch("/api/admin/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setError("Erro ao salvar");
      setSaving(null);
      return;
    }
    setDirty((prev) => ({ ...prev, [slug]: false }));
    setSaving(null);
    setSaved(slug);
    setTimeout(() => setSaved(null), 2500);
    await fetchProjetos();
  }

  async function handleDelete(slug: string) {
    setDeleting(slug);
    const res = await fetch("/api/admin/portfolio", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) {
      setError("Erro ao excluir");
      setDeleting(null);
      return;
    }
    setConfirmDelete(null);
    setDeleting(null);
    setExpanded(null);
    await fetchProjetos();
  }

  async function handleCreate() {
    if (!newProjeto.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    setError("");
    setSaving("__new__");
    const slug = newProjeto.slug || slugify(newProjeto.name);
    const payload = {
      ...newProjeto,
      slug,
      detalhes: newProjeto.detalhes.filter((d) => d.trim()),
    };
    const res = await fetch("/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao criar");
      setSaving(null);
      return;
    }
    setSaving(null);
    setShowNew(false);
    setNewProjeto({ ...emptyProjeto });
    await fetchProjetos();
  }

  if (loading) {
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
          <h1 className="text-2xl font-bold text-foreground font-display">Portfólio</h1>
          <p className="text-muted text-sm mt-1">
            {projetos.length} marcas — edite, adicione ou exclua
          </p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-all"
        >
          {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showNew ? "Cancelar" : "Nova Marca"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* New project form */}
      {showNew && (
        <div className="bg-white rounded-xl border-2 border-accent/20 p-6 space-y-4">
          <h2 className="font-bold text-foreground text-lg">Nova Marca</h2>
          <ProjectForm
            data={newProjeto}
            onChange={(field, value) =>
              setNewProjeto((prev) => ({ ...prev, [field]: value }))
            }
            onChangeDetalhe={(idx, value) => {
              setNewProjeto((prev) => {
                const detalhes = [...prev.detalhes];
                detalhes[idx] = value;
                return { ...prev, detalhes };
              });
            }}
            onAddDetalhe={() =>
              setNewProjeto((prev) => ({ ...prev, detalhes: [...prev.detalhes, ""] }))
            }
            onRemoveDetalhe={(idx) =>
              setNewProjeto((prev) => ({
                ...prev,
                detalhes: prev.detalhes.filter((_, i) => i !== idx),
              }))
            }
            autoSlug
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowNew(false);
                setNewProjeto({ ...emptyProjeto });
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:bg-surface transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={saving === "__new__" || !newProjeto.name.trim()}
              className="px-6 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-all disabled:opacity-50"
            >
              {saving === "__new__" ? "Criando..." : "Criar Marca"}
            </button>
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="space-y-3">
        {projetos.map((p) => {
          const Icon = iconMap[p.icon] || Briefcase;
          const isExpanded = expanded === p.slug;
          const state = editState[p.slug];
          if (!state) return null;

          const statusColor =
            state.status === "Em operação"
              ? "bg-success"
              : state.status === "Em desenvolvimento"
              ? "bg-warning"
              : "bg-muted";

          return (
            <div
              key={p.slug}
              className={`bg-white rounded-xl border transition-all ${
                dirty[p.slug]
                  ? "border-accent/30 shadow-sm"
                  : isExpanded
                  ? "border-primary/20 shadow-sm"
                  : "border-border"
              }`}
            >
              {/* Header row */}
              <button
                onClick={() => setExpanded(isExpanded ? null : p.slug)}
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
                    <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                    <span className="text-xs text-muted hidden sm:inline">{p.status}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  )}
                </div>
              </button>

              {/* Expanded edit form */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border/50 pt-5 space-y-4">
                  <ProjectForm
                    data={state}
                    onChange={(field, value) => updateField(p.slug, field, value)}
                    onChangeDetalhe={(idx, value) => updateDetalhe(p.slug, idx, value)}
                    onAddDetalhe={() => addDetalhe(p.slug)}
                    onRemoveDetalhe={(idx) => removeDetalhe(p.slug, idx)}
                  />

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                      Notas Internas
                    </label>
                    <textarea
                      value={state.notasInternas || ""}
                      onChange={(e) => updateField(p.slug, "notasInternas", e.target.value)}
                      rows={2}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground resize-none placeholder:text-muted/40"
                      placeholder="Notas visíveis apenas para os sócios..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {confirmDelete === p.slug ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-500">Confirmar exclusão?</span>
                          <button
                            onClick={() => handleDelete(p.slug)}
                            disabled={deleting === p.slug}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-all disabled:opacity-50"
                          >
                            {deleting === p.slug ? "Excluindo..." : "Sim, excluir"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:bg-surface transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(p.slug)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir marca
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleSave(p.slug)}
                      disabled={!dirty[p.slug] || saving === p.slug}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                        saved === p.slug
                          ? "bg-success"
                          : dirty[p.slug]
                          ? "bg-primary hover:bg-primary-light"
                          : "bg-muted cursor-not-allowed"
                      }`}
                    >
                      {saving === p.slug ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : saved === p.slug ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving === p.slug
                        ? "Salvando..."
                        : saved === p.slug
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

/* ─── Reusable form for edit / create ─── */

function ProjectForm({
  data,
  onChange,
  onChangeDetalhe,
  onAddDetalhe,
  onRemoveDetalhe,
  autoSlug,
}: {
  data: Projeto;
  onChange: (field: keyof Projeto, value: unknown) => void;
  onChangeDetalhe: (idx: number, value: string) => void;
  onAddDetalhe: () => void;
  onRemoveDetalhe: (idx: number) => void;
  autoSlug?: boolean;
}) {
  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted/40";

  return (
    <div className="space-y-4">
      {/* Row 1: Name + Slug */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">Nome</label>
          <input
            value={data.name}
            onChange={(e) => {
              onChange("name", e.target.value);
              if (autoSlug) onChange("slug", slugify(e.target.value));
            }}
            className={`mt-1 ${inputClass}`}
            placeholder="Nome da marca"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">Slug</label>
          <input
            value={data.slug}
            onChange={(e) => onChange("slug", e.target.value)}
            className={`mt-1 ${inputClass} ${autoSlug ? "text-muted" : ""}`}
            placeholder="slug-da-marca"
          />
        </div>
      </div>

      {/* Row 2: Tagline */}
      <div>
        <label className="text-xs font-medium text-muted uppercase tracking-wider">Tagline</label>
        <input
          value={data.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
          className={`mt-1 ${inputClass}`}
          placeholder="Frase curta descritiva"
        />
      </div>

      {/* Row 3: Description */}
      <div>
        <label className="text-xs font-medium text-muted uppercase tracking-wider">
          Descrição
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          className={`mt-1 ${inputClass} resize-none`}
          placeholder="Descrição completa do projeto"
        />
      </div>

      {/* Row 4: Tag + Status + Icon */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Categoria (tag)
          </label>
          <input
            value={data.tag}
            onChange={(e) => onChange("tag", e.target.value)}
            className={`mt-1 ${inputClass}`}
            placeholder="Ex: EdTech, Franquia..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">Status</label>
          <select
            value={data.status}
            onChange={(e) => onChange("status", e.target.value)}
            className={`mt-1 ${inputClass}`}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">Ícone</label>
          <div className="mt-1 flex items-center gap-2">
            <select
              value={data.icon}
              onChange={(e) => onChange("icon", e.target.value)}
              className={`flex-1 ${inputClass}`}
            >
              {iconOptions.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
            {(() => {
              const IconPreview = iconMap[data.icon] || Briefcase;
              return (
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <IconPreview className="w-4 h-4 text-primary" />
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Row 5: Mercado + Parceiro + Controle */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Mercado
          </label>
          <input
            value={data.mercado}
            onChange={(e) => onChange("mercado", e.target.value)}
            className={`mt-1 ${inputClass}`}
            placeholder="Ex: Portugal / Europa"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Parceiro(s)
          </label>
          <input
            value={data.parceiro || ""}
            onChange={(e) => onChange("parceiro", e.target.value)}
            className={`mt-1 ${inputClass}`}
            placeholder="Nome do parceiro (opcional)"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Controle
          </label>
          <input
            value={data.controle}
            onChange={(e) => onChange("controle", e.target.value)}
            className={`mt-1 ${inputClass}`}
            placeholder="Ex: 100% Holding"
          />
        </div>
      </div>

      {/* Row 6: Sócio + Porcentagem */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Sócio
          </label>
          <input
            value={data.socio || ""}
            onChange={(e) => onChange("socio", e.target.value)}
            className={`mt-1 ${inputClass}`}
            placeholder="Nome do sócio operador"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Porcentagem (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={data.porcentagem ?? ""}
            onChange={(e) =>
              onChange("porcentagem", e.target.value === "" ? undefined : parseFloat(e.target.value))
            }
            className={`mt-1 ${inputClass}`}
            placeholder="Ex: 50"
          />
        </div>
      </div>

      {/* Detalhes list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Detalhes ({data.detalhes.length})
          </label>
          <button
            type="button"
            onClick={onAddDetalhe}
            className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" /> Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {data.detalhes.map((d, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={d}
                onChange={(e) => onChangeDetalhe(idx, e.target.value)}
                className={`flex-1 ${inputClass}`}
                placeholder={`Detalhe ${idx + 1}`}
              />
              {data.detalhes.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveDetalhe(idx)}
                  className="text-red-400 hover:text-red-600 px-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
