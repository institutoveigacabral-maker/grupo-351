"use client";

import { useEffect, useState } from "react";
import { GitMerge, Check, X, MessageCircle, Sparkles, Send } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPage } from "@/components/ui/skeleton";

interface Match {
  id: string;
  status: string;
  score: number | null;
  motivo: string | null;
  criadoEm: string;
  opportunity: { id: string; titulo: string; tipo: string };
  fromUser: { id: string; nome: string };
  toUser: { id: string; nome: string };
}

interface Message {
  id: string;
  conteudo: string;
  criadoEm: string;
  user: { id: string; nome: string };
}

interface Suggestion {
  opportunityId: string;
  titulo: string;
  tipo: string;
  score: number;
  motivo: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  sugerido: { label: "Pendente", color: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10" },
  aceito: { label: "Aceito", color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10" },
  recusado: { label: "Recusado", color: "bg-red-50 text-red-700 ring-1 ring-red-600/10" },
  "em-conversa": { label: "Em conversa", color: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10" },
  fechado: { label: "Projeto criado", color: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/10" },
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [myUserId, setMyUserId] = useState("");
  const [tab, setTab] = useState<"matches" | "sugestoes">("matches");

  useEffect(() => {
    Promise.all([
      fetch("/api/platform/matches").then((r) => r.json()),
      fetch("/api/platform/matches/suggest").then((r) => r.json()),
      fetch("/api/platform/me").then((r) => r.json()),
    ])
      .then(([m, s, me]) => {
        setMatches(Array.isArray(m) ? m : []);
        setSuggestions(Array.isArray(s) ? s : []);
        setMyUserId(me.id);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(matchId: string, action: "aceitar" | "recusar") {
    await fetch("/api/platform/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, action }),
    });
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, status: action === "aceitar" ? "aceito" : "recusado" } : m
      )
    );
  }

  async function openChat(matchId: string) {
    setActiveChat(matchId);
    const msgs = await fetch(`/api/platform/messages?matchId=${matchId}`).then((r) => r.json());
    setMessages(Array.isArray(msgs) ? msgs : []);
  }

  async function sendMessage() {
    if (!activeChat || !newMsg.trim()) return;
    const res = await fetch("/api/platform/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: activeChat, conteudo: newMsg }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setNewMsg("");
    }
  }

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-6">
      <PageHeader icon={GitMerge} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Matches" description="Conexoes e sugestoes do ecossistema" />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
        {[
          { key: "matches" as const, label: `Meus matches (${matches.length})` },
          { key: "sugestoes" as const, label: `Sugestoes IA (${suggestions.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {key === "sugestoes" && <Sparkles className="w-3 h-3 inline mr-1.5 text-amber-500" />}
            {label}
          </button>
        ))}
      </div>

      {/* Chat overlay */}
      {activeChat && (
        <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-lg shadow-black/[0.06]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Conversa</span>
            </div>
            <button onClick={() => setActiveChat(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Nenhuma mensagem ainda.</p>
                <p className="text-xs text-gray-300 mt-1">Inicie a conversa.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.user.id === myUserId ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                    msg.user.id === myUserId
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl rounded-br-lg shadow-sm"
                      : "bg-gray-50 text-gray-800 rounded-2xl rounded-bl-lg border border-gray-100"
                  }`}>
                    <p className="text-[10px] opacity-60 mb-0.5 font-medium">{msg.user.nome}</p>
                    <p className="whitespace-pre-wrap">{msg.conteudo}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 p-3 bg-gray-50/50 flex gap-2">
            <input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Escreva uma mensagem..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300"
            />
            <button onClick={sendMessage} className="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Matches tab */}
      {tab === "matches" && (
        matches.length === 0 ? (
          <EmptyState
            icon={GitMerge}
            title="Nenhum match ainda"
            description="Publique oportunidades ou aguarde sugestoes."
            action={{ label: "Publicar oportunidade", href: "/dashboard/oportunidades" }}
          />
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const isReceived = match.toUser.id === myUserId;
              const otherName = isReceived ? match.fromUser.nome : match.toUser.nome;
              const st = statusLabels[match.status] || statusLabels.sugerido;

              return (
                <div key={match.id} className="group bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-xl hover:shadow-black/[0.03] hover:border-black/[0.06] transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{match.opportunity.titulo}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isReceived ? "Sugerido por" : "Enviado para"}: <span className="text-gray-500">{otherName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                      {match.score != null && (
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: `${match.score}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 tabular-nums">{match.score}%</span>
                        </div>
                      )}
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {match.motivo && (
                    <div className="flex items-start gap-2 text-xs text-gray-500 mb-3 bg-gradient-to-r from-amber-50/50 to-transparent px-3 py-2.5 rounded-xl border border-amber-100/50">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <span>{match.motivo}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {match.status === "sugerido" && isReceived && (
                      <>
                        <button
                          onClick={() => handleAction(match.id, "aceitar")}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                        >
                          <Check className="w-3 h-3" /> Aceitar
                        </button>
                        <button
                          onClick={() => handleAction(match.id, "recusar")}
                          className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-medium hover:bg-gray-100 transition-all ring-1 ring-gray-200/60"
                        >
                          <X className="w-3 h-3" /> Recusar
                        </button>
                      </>
                    )}
                    {["aceito", "em-conversa"].includes(match.status) && (
                      <button
                        onClick={() => openChat(match.id)}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                      >
                        <MessageCircle className="w-3 h-3" /> Conversar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Sugestoes tab */}
      {tab === "sugestoes" && (
        suggestions.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Sem sugestoes no momento"
            description="Complete o perfil da empresa para receber sugestoes de matches."
            action={{ label: "Completar perfil", href: "/dashboard/empresa" }}
          />
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.opportunityId} className="group bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-xl hover:shadow-black/[0.03] transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">{s.titulo}</h3>
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-amber-600 tabular-nums">{s.score}%</span>
                    </div>
                    <span className="text-[11px] font-medium bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full ring-1 ring-gray-600/10">{s.tipo}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                  <span>{s.motivo}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
