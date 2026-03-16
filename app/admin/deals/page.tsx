"use client";

import { useEffect, useState } from "react";
import { MessageSquare, ArrowRight, Zap } from "lucide-react";
import Image from "next/image";

interface AdminMatch {
  id: string;
  status: string;
  score: number | null;
  motivo: string | null;
  criadoEm: string;
  updatedAt: string;
  opportunity: { id: string; titulo: string; tipo: string; setor: string };
  fromUser: { id: string; nome: string; email: string; avatar: string | null };
  toUser: { id: string; nome: string; email: string; avatar: string | null };
  _count: { messages: number };
}

const columns = [
  { key: "sugerido", label: "Sugerido", color: "border-gray-300 bg-gray-50" },
  { key: "aceito", label: "Aceito", color: "border-blue-300 bg-blue-50" },
  { key: "em-conversa", label: "Em Conversa", color: "border-amber-300 bg-amber-50" },
  { key: "fechado", label: "Fechado", color: "border-emerald-300 bg-emerald-50" },
];

const statusColors: Record<string, string> = {
  sugerido: "bg-gray-100 text-gray-700",
  aceito: "bg-blue-100 text-blue-700",
  recusado: "bg-red-100 text-red-700",
  "em-conversa": "bg-amber-100 text-amber-700",
  fechado: "bg-emerald-100 text-emerald-700",
};

export default function DealsPage() {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "tabela">("kanban");
  const [selectedMatch, setSelectedMatch] = useState<AdminMatch | null>(null);

  useEffect(() => {
    fetch("/api/admin/matches")
      .then((r) => r.json())
      .then((data) => { setMatches(data); setLoading(false); });
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/matches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMatches((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const recusados = matches.filter((m) => m.status === "recusado");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Pipeline de Deals</h1>
          <p className="text-muted text-sm mt-1">
            {matches.length} deal(s) — {matches.filter((m) => m.status === "fechado").length} fechados
          </p>
        </div>
        <div className="flex bg-white border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setView("kanban")}
            className={`px-4 py-2 text-xs font-medium transition-colors ${view === "kanban" ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView("tabela")}
            className={`px-4 py-2 text-xs font-medium transition-colors ${view === "tabela" ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}
          >
            Tabela
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Sugeridos", value: matches.filter((m) => m.status === "sugerido").length, color: "text-gray-600" },
          { label: "Aceitos", value: matches.filter((m) => m.status === "aceito").length, color: "text-blue-600" },
          { label: "Em conversa", value: matches.filter((m) => m.status === "em-conversa").length, color: "text-amber-600" },
          { label: "Fechados", value: matches.filter((m) => m.status === "fechado").length, color: "text-emerald-600" },
          { label: "Recusados", value: recusados.length, color: "text-red-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {view === "kanban" ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colMatches = matches.filter((m) => m.status === col.key);
            return (
              <div key={col.key} className={`rounded-xl border-2 ${col.color} p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{col.label}</h3>
                  <span className="text-xs font-bold text-muted bg-white px-2 py-0.5 rounded-full">{colMatches.length}</span>
                </div>
                <div className="space-y-2">
                  {colMatches.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white rounded-lg p-3 shadow-sm border border-white hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedMatch(m)}
                    >
                      <p className="text-xs font-medium text-foreground truncate">{m.opportunity.titulo}</p>
                      <p className="text-[10px] text-muted mt-1">{m.opportunity.tipo} · {m.opportunity.setor}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex -space-x-1.5">
                          {[m.fromUser, m.toUser].map((u) => (
                            <div key={u.id} className="w-5 h-5 rounded-full bg-gradient-to-br from-accent/60 to-accent-light/60 border border-white flex items-center justify-center">
                              {u.avatar ? (
                                <Image src={u.avatar} alt={`Avatar de ${u.nome}`} width={32} height={32} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-white text-[8px] font-bold">{u.nome.charAt(0)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {m.score && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600">
                              <Zap className="w-2.5 h-2.5" />
                              {m.score}
                            </span>
                          )}
                          {m._count.messages > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] text-muted">
                              <MessageSquare className="w-2.5 h-2.5" />
                              {m._count.messages}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colMatches.length === 0 && (
                    <p className="text-[10px] text-muted text-center py-4">Vazio</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Oportunidade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">De</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Para</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Msgs</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground text-xs">{m.opportunity.titulo}</p>
                      <p className="text-[10px] text-muted">{m.opportunity.tipo} · {m.opportunity.setor}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-xs text-foreground">{m.fromUser.nome}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-xs text-foreground">{m.toUser.nome}</p>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {m.score ? (
                        <span className="text-xs font-bold text-amber-600">{m.score}</span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="text-xs text-muted">{m._count.messages}</span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={m.status}
                        onChange={(e) => updateStatus(m.id, e.target.value)}
                        className={`text-[10px] font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[m.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        <option value="sugerido">Sugerido</option>
                        <option value="aceito">Aceito</option>
                        <option value="em-conversa">Em conversa</option>
                        <option value="fechado">Fechado</option>
                        <option value="recusado">Recusado</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted hidden md:table-cell">
                      {new Date(m.updatedAt).toLocaleDateString("pt-PT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Match detail modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMatch(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground">{selectedMatch.opportunity.titulo}</h3>
            <p className="text-xs text-muted mt-1">{selectedMatch.opportunity.tipo} · {selectedMatch.opportunity.setor}</p>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="bg-surface rounded-lg p-3">
                <p className="text-[10px] text-muted uppercase tracking-wider mb-1">De</p>
                <p className="text-sm font-medium text-foreground">{selectedMatch.fromUser.nome}</p>
                <p className="text-xs text-muted">{selectedMatch.fromUser.email}</p>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Para</p>
                <p className="text-sm font-medium text-foreground">{selectedMatch.toUser.nome}</p>
                <p className="text-xs text-muted">{selectedMatch.toUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              {selectedMatch.score && (
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-amber-600">Score: {selectedMatch.score}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-muted" />
                <span className="text-sm text-muted">{selectedMatch._count.messages} mensagens</span>
              </div>
            </div>

            {selectedMatch.motivo && (
              <div className="mt-4 bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-[10px] text-amber-700 uppercase tracking-wider mb-1 font-medium">Razão do match (IA)</p>
                <p className="text-xs text-amber-800">{selectedMatch.motivo}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <select
                value={selectedMatch.status}
                onChange={(e) => {
                  updateStatus(selectedMatch.id, e.target.value);
                  setSelectedMatch({ ...selectedMatch, status: e.target.value });
                }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${statusColors[selectedMatch.status] || "bg-gray-100"}`}
              >
                <option value="sugerido">Sugerido</option>
                <option value="aceito">Aceito</option>
                <option value="em-conversa">Em conversa</option>
                <option value="fechado">Fechado</option>
                <option value="recusado">Recusado</option>
              </select>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
