"use client";

import { Plus, X, Briefcase } from "lucide-react";
import { type Projeto, iconMap, iconOptions, statusOptions, slugify, inputClass } from "../shared";

export function ProjectForm({
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
  return (
    <div className="space-y-4">
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

      <div>
        <label className="text-xs font-medium text-muted uppercase tracking-wider">Tagline</label>
        <input
          value={data.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
          className={`mt-1 ${inputClass}`}
          placeholder="Frase curta descritiva"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted uppercase tracking-wider">Descricao</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          className={`mt-1 ${inputClass} resize-none`}
          placeholder="Descricao completa do projeto"
        />
      </div>

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
          <label className="text-xs font-medium text-muted uppercase tracking-wider">Icone</label>
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

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">Mercado</label>
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

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">Socio</label>
          <input
            value={data.socio || ""}
            onChange={(e) => onChange("socio", e.target.value)}
            className={`mt-1 ${inputClass}`}
            placeholder="Nome do socio operador"
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
              onChange(
                "porcentagem",
                e.target.value === "" ? undefined : parseFloat(e.target.value)
              )
            }
            className={`mt-1 ${inputClass}`}
            placeholder="Ex: 50"
          />
        </div>
      </div>

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
