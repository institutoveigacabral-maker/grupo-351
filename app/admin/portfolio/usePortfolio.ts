"use client";

import { useEffect, useState, useCallback } from "react";
import { type Projeto, emptyProjeto, slugify } from "./shared";

export function usePortfolio() {
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
      setError("Nome e obrigatorio");
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

  return {
    projetos,
    loading,
    expanded,
    setExpanded,
    saving,
    saved,
    deleting,
    confirmDelete,
    setConfirmDelete,
    showNew,
    setShowNew,
    newProjeto,
    setNewProjeto,
    editState,
    dirty,
    error,
    updateField,
    updateDetalhe,
    addDetalhe,
    removeDetalhe,
    handleSave,
    handleDelete,
    handleCreate,
  };
}
