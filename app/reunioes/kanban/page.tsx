"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SharedHeader } from "@/components/reunioes/SharedHeader";
import {
  Columns3,
  GripVertical,
  ListChecks,
  Users,
  Shield,
  X,
  Edit3,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  StickyNote,
  User,
  Tag,
  AlertCircle,
  Zap,
  Clock,
  Circle,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

interface CheckItem {
  texto: string;
  feito: boolean;
}

interface Card {
  id: string;
  nome: string;
  descricao: string;
  coluna: string;
  prioridade: string;
  categoria: string;
  responsavel: string;
  participantes: string[];
  totalReunioes: number;
  totalAcoes: number;
  dataInicio: string;
  dataUltima: string;
  notas: string;
  checklist: CheckItem[];
  tagsPrincipais: string[];
  ordem: number;
}

interface KanbanData {
  geradoEm: string;
  colunas: Record<string, { nome: string; ordem: number }>;
  cards: Card[];
}

const colColors: Record<string, { bg: string; border: string; dot: string; header: string }> = {
  planejamento: { bg: "bg-violet-500/[0.03]", border: "border-violet-500/20", dot: "bg-violet-500", header: "text-violet-700" },
  em_desenvolvimento: { bg: "bg-amber-500/[0.03]", border: "border-amber-500/20", dot: "bg-amber-500", header: "text-amber-700" },
  em_andamento: { bg: "bg-blue-500/[0.03]", border: "border-blue-500/20", dot: "bg-blue-500", header: "text-blue-700" },
  pausado: { bg: "bg-red-500/[0.03]", border: "border-red-500/20", dot: "bg-red-500", header: "text-red-600" },
  concluido: { bg: "bg-emerald-500/[0.03]", border: "border-emerald-500/20", dot: "bg-emerald-500", header: "text-emerald-700" },
};

const prioColors: Record<string, { bg: string; text: string; dot: string }> = {
  critica: { bg: "bg-red-500/10", text: "text-red-700", dot: "bg-red-500" },
  alta: { bg: "bg-orange-500/10", text: "text-orange-700", dot: "bg-orange-500" },
  media: { bg: "bg-blue-500/10", text: "text-blue-700", dot: "bg-blue-500" },
  baixa: { bg: "bg-slate-500/10", text: "text-slate-600", dot: "bg-slate-400" },
};

const catColors: Record<string, string> = {
  Estrategico: "text-red-500", Operacional: "text-orange-500", Expansao: "text-blue-500",
  Tecnologia: "text-violet-500", Wellness: "text-green-500", Franquia: "text-emerald-500",
  "E-commerce": "text-purple-500", Plataforma: "text-indigo-500", Holding: "text-slate-500",
  Conteudo: "text-pink-500", Mobilidade: "text-cyan-500", "Nova Vertical": "text-amber-500",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function KanbanPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [data, setData] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Card>>({});
  const [newCheckItem, setNewCheckItem] = useState("");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) { setLoading(false); setError(true); return; }
    fetch(`/api/reunioes/kanban?token=${encodeURIComponent(token)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setLoading(false); setError(true); });
  }, [token]);

  const persist = useCallback((updated: KanbanData) => {
    if (!token) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaving(true);
    saveTimeout.current = setTimeout(() => {
      fetch(`/api/reunioes/kanban?token=${encodeURIComponent(token)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).finally(() => setSaving(false));
    }, 500);
  }, [token]);

  const updateCard = useCallback((cardId: string, updates: Partial<Card>) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        cards: prev.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const moveCard = useCallback((cardId: string, toColumn: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const card = prev.cards.find((c) => c.id === cardId);
      if (!card || card.coluna === toColumn) return prev;
      const colCards = prev.cards.filter((c) => c.coluna === toColumn);
      const next = {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === cardId ? { ...c, coluna: toColumn, ordem: colCards.length } : c
        ),
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const handleDragStart = (cardId: string) => setDragCard(cardId);
  const handleDragEnd = () => {
    if (dragCard && dragOverCol) moveCard(dragCard, dragOverCol);
    setDragCard(null);
    setDragOverCol(null);
  };
  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const openEdit = (card: Card) => {
    setEditingCard(card.id);
    setEditForm({ ...card });
    setNewCheckItem("");
  };

  const saveEdit = () => {
    if (editingCard && editForm) {
      updateCard(editingCard, editForm);
    }
    setEditingCard(null);
    setEditForm({});
  };

  const toggleCheck = (cardId: string, idx: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        cards: prev.cards.map((c) => {
          if (c.id !== cardId) return c;
          const checklist = [...c.checklist];
          checklist[idx] = { ...checklist[idx], feito: !checklist[idx].feito };
          return { ...c, checklist };
        }),
      };
      persist(next);
      return next;
    });
  };

  const addCheckItem = () => {
    if (!newCheckItem.trim() || !editForm.checklist) return;
    setEditForm({
      ...editForm,
      checklist: [...editForm.checklist, { texto: newCheckItem.trim(), feito: false }],
    });
    setNewCheckItem("");
  };

  const removeCheckItem = (idx: number) => {
    if (!editForm.checklist) return;
    setEditForm({
      ...editForm,
      checklist: editForm.checklist.filter((_, i) => i !== idx),
    });
  };

  if (error || (!loading && !token)) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-black/[0.04] shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5"><Shield className="w-7 h-7 text-red-500" /></div>
          <h1 className="text-xl font-bold text-foreground font-display tracking-tight mb-2">Acesso restrito</h1>
          <p className="text-sm text-muted">Token invalido.</p>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedCols = Object.entries(data.colunas).sort((a, b) => a[1].ordem - b[1].ordem);
  const editCard = editingCard ? data.cards.find((c) => c.id === editingCard) : null;

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <SharedHeader active="kanban" subtitle={`${data.cards.length} projetos`} />
      {saving && <div className="bg-accent/5 text-center py-1 text-[11px] text-muted animate-pulse">Salvando...</div>}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-5 lg:p-6">
        <div className="flex gap-4 min-w-max h-full">
          {sortedCols.map(([colId, col]) => {
            const cc = colColors[colId] || colColors.em_andamento;
            const colCards = data.cards
              .filter((c) => c.coluna === colId)
              .sort((a, b) => {
                const po = { critica: 0, alta: 1, media: 2, baixa: 3 };
                return (po[a.prioridade as keyof typeof po] ?? 9) - (po[b.prioridade as keyof typeof po] ?? 9) || a.ordem - b.ordem;
              });

            return (
              <div
                key={colId}
                className={`w-[320px] shrink-0 rounded-2xl border ${
                  dragOverCol === colId ? "border-accent/40 bg-accent/[0.02]" : `${cc.border} ${cc.bg}`
                } flex flex-col transition-colors duration-200`}
                onDragOver={(e) => handleDragOver(e, colId)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={handleDragEnd}
              >
                {/* Column header */}
                <div className="px-4 py-3 flex items-center gap-2.5 border-b border-black/[0.04]">
                  <div className={`w-2.5 h-2.5 rounded-full ${cc.dot}`} />
                  <h3 className={`text-[13px] font-semibold ${cc.header}`}>{col.nome}</h3>
                  <span className="text-[11px] text-muted font-medium ml-auto bg-white/80 px-2 py-0.5 rounded-md">
                    {colCards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2.5 space-y-2 overflow-y-auto max-h-[calc(100vh-160px)]">
                  {colCards.map((card) => {
                    const prio = prioColors[card.prioridade];
                    const checkDone = card.checklist.filter((c) => c.feito).length;
                    const checkTotal = card.checklist.length;

                    return (
                      <motion.div
                        key={card.id}
                        layout
                        layoutId={card.id}
                        draggable
                        onDragStart={() => handleDragStart(card.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl border border-black/[0.04] p-3.5 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow duration-200 ${
                          dragCard === card.id ? "opacity-50 scale-95" : ""
                        }`}
                        whileHover={{ y: -1 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* Card top row */}
                        <div className="flex items-start gap-2 mb-2">
                          <GripVertical className="w-3.5 h-3.5 text-muted/30 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-semibold text-foreground leading-tight">{card.nome}</h4>
                          </div>
                          <button
                            onClick={() => openEdit(card)}
                            className="p-1 rounded-md hover:bg-black/5 text-muted/40 hover:text-foreground transition-colors shrink-0"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Priority + Category */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${prio?.bg} ${prio?.text}`}>
                            {card.prioridade}
                          </span>
                          <span className={`text-[9px] font-medium ${catColors[card.categoria] || "text-muted"}`}>
                            {card.categoria}
                          </span>
                        </div>

                        {/* Description preview */}
                        <p className="text-[11px] text-muted leading-relaxed line-clamp-2 mb-2.5">{card.descricao}</p>

                        {/* Checklist progress */}
                        {checkTotal > 0 && (
                          <div className="mb-2.5">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-emerald-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(checkDone / checkTotal) * 100}%` }}
                                  transition={{ duration: 0.3, ease }}
                                />
                              </div>
                              <span className="text-[10px] text-muted font-medium">{checkDone}/{checkTotal}</span>
                            </div>
                            {/* Quick toggle for first unchecked items */}
                            <div className="space-y-0.5">
                              {card.checklist.slice(0, 3).map((item, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => toggleCheck(card.id, idx)}
                                  className="flex items-start gap-1.5 w-full text-left group"
                                >
                                  {item.feito ? (
                                    <CheckSquare className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                  ) : (
                                    <Square className="w-3 h-3 text-muted/30 group-hover:text-muted mt-0.5 shrink-0" />
                                  )}
                                  <span className={`text-[10px] leading-relaxed ${item.feito ? "text-muted/50 line-through" : "text-muted"}`}>
                                    {item.texto.length > 60 ? item.texto.slice(0, 60) + "..." : item.texto}
                                  </span>
                                </button>
                              ))}
                              {checkTotal > 3 && (
                                <span className="text-[9px] text-muted/40 pl-4.5">+{checkTotal - 3} mais</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes preview */}
                        {card.notas && (
                          <div className="flex items-start gap-1.5 mb-2 p-2 rounded-lg bg-amber-500/[0.04] border border-amber-500/10">
                            <StickyNote className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-amber-800 leading-relaxed line-clamp-2">{card.notas}</p>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center gap-2 pt-2 border-t border-black/[0.03]">
                          {card.responsavel && (
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500/10 to-violet-600/5 flex items-center justify-center text-[8px] font-bold text-violet-600">
                                {card.responsavel.charAt(0)}
                              </div>
                              <span className="text-[10px] text-muted">{card.responsavel.split(" ")[0]}</span>
                            </div>
                          )}
                          <div className="flex-1" />
                          <span className="text-[9px] text-muted">{card.totalReunioes}r · {card.totalAcoes}a</span>
                          <span className="text-[9px] text-muted/50">{formatDate(card.dataUltima)}</span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {colCards.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-[11px] text-muted/40">Arraste projetos para ca</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingCard && editCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] px-4"
            onClick={() => saveEdit()}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25, ease }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-black/[0.04] shadow-2xl w-full max-w-xl max-h-[75vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-xl px-6 py-4 border-b border-black/[0.04] flex items-center gap-3 z-10 rounded-t-2xl">
                <Edit3 className="w-4 h-4 text-accent" />
                <h2 className="text-[15px] font-semibold text-foreground flex-1">Editar Projeto</h2>
                <button
                  onClick={() => saveEdit()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent/90 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar
                </button>
                <button onClick={() => { setEditingCard(null); setEditForm({}); }} className="p-1.5 rounded-lg hover:bg-black/5 text-muted transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Nome */}
                <div>
                  <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider block mb-1.5">Nome do Projeto</label>
                  <input
                    value={editForm.nome || ""}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.06] text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
                  />
                </div>

                {/* Descricao */}
                <div>
                  <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider block mb-1.5">Descricao</label>
                  <textarea
                    value={editForm.descricao || ""}
                    onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.06] text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all resize-none"
                  />
                </div>

                {/* Status + Prioridade + Responsavel */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider block mb-1.5">Status</label>
                    <select
                      value={editForm.coluna || ""}
                      onChange={(e) => setEditForm({ ...editForm, coluna: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/[0.06] text-[12px] focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all bg-white"
                    >
                      {Object.entries(data.colunas).sort((a, b) => a[1].ordem - b[1].ordem).map(([id, col]) => (
                        <option key={id} value={id}>{col.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider block mb-1.5">Prioridade</label>
                    <select
                      value={editForm.prioridade || ""}
                      onChange={(e) => setEditForm({ ...editForm, prioridade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/[0.06] text-[12px] focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all bg-white"
                    >
                      <option value="critica">Critica</option>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider block mb-1.5">Responsavel</label>
                    <input
                      value={editForm.responsavel || ""}
                      onChange={(e) => setEditForm({ ...editForm, responsavel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/[0.06] text-[12px] focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <StickyNote className="w-3 h-3 text-amber-500" /> Notas
                  </label>
                  <textarea
                    value={editForm.notas || ""}
                    onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })}
                    rows={3}
                    placeholder="Anotacoes, decisoes pendentes, observacoes..."
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.06] text-[12px] focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none placeholder:text-muted/30"
                  />
                </div>

                {/* Checklist */}
                <div>
                  <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <ListChecks className="w-3 h-3 text-emerald-500" /> Checklist
                    <span className="text-muted font-normal normal-case">
                      ({editForm.checklist?.filter((c) => c.feito).length || 0}/{editForm.checklist?.length || 0})
                    </span>
                  </label>
                  <div className="space-y-1.5 mb-2.5">
                    {editForm.checklist?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 group">
                        <button
                          onClick={() => {
                            const checklist = [...(editForm.checklist || [])];
                            checklist[idx] = { ...checklist[idx], feito: !checklist[idx].feito };
                            setEditForm({ ...editForm, checklist });
                          }}
                          className="mt-0.5"
                        >
                          {item.feito ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-muted/30 hover:text-muted" />
                          )}
                        </button>
                        <span className={`text-[12px] flex-1 leading-relaxed ${item.feito ? "text-muted/50 line-through" : "text-foreground"}`}>
                          {item.texto}
                        </span>
                        <button
                          onClick={() => removeCheckItem(idx)}
                          className="p-0.5 rounded text-muted/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newCheckItem}
                      onChange={(e) => setNewCheckItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCheckItem()}
                      placeholder="Adicionar item..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-black/[0.06] text-[12px] focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted/30"
                    />
                    <button
                      onClick={addCheckItem}
                      disabled={!newCheckItem.trim()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 text-[12px] font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Users className="w-3 h-3 text-violet-500" /> Participantes
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {editCard.participantes.map((p) => (
                      <span key={p} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-violet-500/[0.06] text-violet-700">{p}</span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Tag className="w-3 h-3 text-amber-500" /> Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {editCard.tagsPrincipais.map((t) => (
                      <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/[0.04] text-muted">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 pt-3 border-t border-black/[0.04] text-[11px] text-muted">
                  <span>{editCard.totalReunioes} reunioes</span>
                  <span>{editCard.totalAcoes} acoes</span>
                  <span>Inicio: {formatDate(editCard.dataInicio)}</span>
                  <span>Ultima: {formatDate(editCard.dataUltima)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-black/[0.04] py-4 shrink-0">
        <p className="text-center text-[11px] text-muted/50">Grupo +351 · Kanban de Projetos · Arraste cards entre colunas para atualizar status</p>
      </footer>
    </div>
  );
}
