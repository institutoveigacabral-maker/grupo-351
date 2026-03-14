"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  BookOpen,
  FileText,
  AlertTriangle,
  Loader2,
  ArrowUp,
  X,
  Save,
  History,
  MessageSquare,
  Clock,
  ChevronRight,
  ArrowLeft,
  Plus,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ConversaResumo {
  id: string;
  titulo: string;
  resumo: string;
  criadoEm: string;
  updatedAt: string;
}

const PROMPTS = [
  { label: "Análise do pipeline", prompt: "Analise o pipeline de candidaturas atual. Identifique padrões, perfis mais comuns, e sugira ações prioritárias." },
  { label: "Sinergias FIGITAIS", prompt: "Mapeie as sinergias FIGITAIS entre os projetos do portfólio. Onde há conexões fortes e onde há gaps?" },
  { label: "Gerar artigo", prompt: "Sugira um novo artigo para a base de conhecimento baseado no estado atual do ecossistema. Retorne no formato JSON com titulo, resumo, categoria e conteudo." },
  { label: "Novos termos", prompt: "Sugira 3 termos que faltam no glossário. Retorne cada um no formato JSON com termo, definicao e categoria." },
  { label: "Relatório executivo", prompt: "Gere um relatório executivo sobre o estado atual do Grupo +351: projetos, pipeline, contatos e recomendações." },
  { label: "Oportunidades", prompt: "Com base no portfólio e posicionamento em Portugal/Europa, que oportunidades adjacentes devemos considerar?" },
];

export default function InteligenciaPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Historico state
  const [view, setView] = useState<"chat" | "historico" | "detalhe">("chat");
  const [historico, setHistorico] = useState<ConversaResumo[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [conversaAtiva, setConversaAtiva] = useState<string | null>(null);
  const [savingConversa, setSavingConversa] = useState(false);

  const scrollBottom = useCallback(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollBottom, [messages, scrollBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  async function loadHistorico() {
    setLoadingHistorico(true);
    try {
      const res = await fetch("/api/admin/ai/historico");
      if (res.ok) setHistorico(await res.json());
    } catch { /* ignore */ }
    setLoadingHistorico(false);
  }

  async function loadConversa(id: string) {
    try {
      const res = await fetch(`/api/admin/ai/historico/${id}`);
      if (res.ok) {
        const data = await res.json();
        const msgs = (data.mensagens as Array<{ role: string; content: string }>).map(
          (m, i) => ({ id: `hist-${i}`, role: m.role as "user" | "assistant", content: m.content })
        );
        setMessages(msgs);
        setConversaAtiva(id);
        setView("chat");
      }
    } catch { setError("Erro ao carregar conversa"); }
  }

  async function salvarConversa() {
    if (messages.length < 2) return;
    setSavingConversa(true);

    // Gerar titulo e resumo a partir da primeira mensagem do user e resposta
    const firstUser = messages.find((m) => m.role === "user")?.content || "";
    const titulo = firstUser.length > 80 ? firstUser.slice(0, 77) + "..." : firstUser;
    const firstAssistant = messages.find((m) => m.role === "assistant")?.content || "";
    const resumo = firstAssistant.length > 200 ? firstAssistant.slice(0, 197) + "..." : firstAssistant;

    try {
      const res = await fetch("/api/admin/ai/historico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          resumo,
          mensagens: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setConversaAtiva(data.id);
        setSaveMsg("Conversa salva no histórico!");
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        setError("Erro ao salvar conversa");
      }
    } catch { setError("Erro ao salvar conversa"); }
    setSavingConversa(false);
  }

  async function deletarConversa(id: string) {
    try {
      await fetch("/api/admin/ai/historico", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setHistorico((prev) => prev.filter((c) => c.id !== id));
      if (conversaAtiva === id) setConversaAtiva(null);
    } catch { /* ignore */ }
  }

  function novaConversa() {
    setMessages([]);
    setConversaAtiva(null);
    setView("chat");
  }

  async function send(content: string) {
    if (!content.trim() || streaming) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: content.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setError("");
    setStreaming(true);

    const asstId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: asstId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.map((m) => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro na API");
        setMessages((prev) => prev.filter((m) => m.id !== asstId));
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const p = JSON.parse(data);
            if (p.error) { setError(p.error); break; }
            if (p.text) {
              setMessages((prev) =>
                prev.map((m) => m.id === asstId ? { ...m, content: m.content + p.text } : m)
              );
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão");
      setMessages((prev) => prev.filter((m) => m.id !== asstId));
    }
    setStreaming(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function copyMsg(content: string, id: string) {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function saveContent(content: string, type: "artigo" | "termo") {
    const pattern = type === "artigo" ? /"titulo"/ : /"termo"/;
    const match = content.match(new RegExp(`\\{[\\s\\S]*?${pattern.source}[\\s\\S]*?\\}`, ""));
    if (!match) { setError(`Não encontrei JSON de ${type} na resposta.`); return; }
    try {
      const parsed = JSON.parse(match[0]);
      setSaving(true);
      const name = type === "artigo" ? parsed.titulo : parsed.termo;
      if (!name) throw new Error("Campo obrigatório ausente");
      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const endpoint = type === "artigo" ? "/api/admin/artigos" : "/api/admin/glossario";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed, slug }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || `Erro ao salvar ${type}`);
      } else {
        setSaveMsg(type === "artigo" ? "Artigo salvo!" : "Termo salvo!");
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch { setError(`JSON de ${type} inválido.`); }
    setSaving(false);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          {view === "historico" ? (
            <button
              onClick={() => setView("chat")}
              className="w-10 h-10 rounded-2xl bg-black/[0.03] flex items-center justify-center hover:bg-black/[0.06] transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/10 to-accent/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-foreground font-display tracking-tight">
              {view === "historico" ? "Aprendizado" : "Inteligência"}
            </h1>
            <p className="text-muted text-[11px]">
              {view === "historico"
                ? `${historico.length} conversas salvas`
                : conversaAtiva
                ? "Conversa do histórico"
                : "Contexto completo do ecossistema"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {view === "chat" && messages.length > 1 && !streaming && (
            <button
              onClick={salvarConversa}
              disabled={savingConversa}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-muted hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-40"
            >
              {savingConversa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Salvar
            </button>
          )}
          <button
            onClick={() => {
              if (view === "historico") {
                setView("chat");
              } else {
                loadHistorico();
                setView("historico");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
              view === "historico"
                ? "text-accent bg-accent/5"
                : "text-muted hover:text-foreground hover:bg-black/5"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Aprendizado
          </button>
          {view === "chat" && messages.length > 0 && (
            <>
              <button
                onClick={novaConversa}
                className="p-2 rounded-xl text-muted hover:text-accent hover:bg-accent/5 transition-all"
                title="Nova conversa"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setMessages([]); setConversaAtiva(null); }}
                className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-black/5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-2xl text-sm mb-3 shrink-0 border border-red-100"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-[13px]">{error}</span>
            <button onClick={() => setError("")}><X className="w-4 h-4 text-red-400" /></button>
          </motion.div>
        )}
        {saveMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-2xl text-sm mb-3 shrink-0 border border-emerald-100"
          >
            <Check className="w-4 h-4" /> {saveMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historico View */}
      {view === "historico" && (
        <div className="flex-1 overflow-auto rounded-2xl bg-white border border-black/[0.04]">
          {loadingHistorico ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-muted animate-spin" />
            </div>
          ) : historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-3xl bg-black/[0.03] flex items-center justify-center mx-auto mb-5">
                <History className="w-7 h-7 text-muted" />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight mb-1">
                Nenhuma conversa salva
              </h2>
              <p className="text-muted text-sm max-w-sm">
                Quando salvar uma conversa com a IA, ela aparece aqui como base de aprendizado do ecossistema.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.04]">
              {historico.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 px-5 py-4 hover:bg-black/[0.01] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-accent/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-accent" />
                  </div>
                  <button
                    onClick={() => loadConversa(c.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-[14px] font-medium text-foreground truncate group-hover:text-accent transition-colors">
                      {c.titulo}
                    </p>
                    <p className="text-[12px] text-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {c.resumo}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Clock className="w-3 h-3 text-muted/60" />
                      <span className="text-[11px] text-muted/60">{formatDate(c.criadoEm)}</span>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => loadConversa(c.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/5 transition-all"
                      title="Abrir conversa"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletarConversa(c.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Apagar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat View */}
      {view === "chat" && (
        <>
          <div className="flex-1 overflow-auto rounded-2xl bg-white border border-black/[0.04]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent/10 to-violet-500/10 flex items-center justify-center mx-auto mb-5">
                    <Sparkles className="w-7 h-7 text-accent" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight mb-1">
                    Assistente Estratégico
                  </h2>
                  <p className="text-muted text-sm max-w-sm mb-8">
                    Tenho acesso total ao ecossistema. Projetos, candidaturas, contatos e base de conhecimento.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-w-2xl w-full"
                >
                  {PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.prompt)}
                      className="text-left p-3.5 rounded-2xl border border-black/[0.04] hover:border-accent/20 hover:bg-accent/[0.02] transition-all duration-300 group"
                    >
                      <p className="text-[13px] font-medium text-foreground group-hover:text-accent transition-colors">
                        {p.label}
                      </p>
                    </button>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="p-5 space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-[20px] px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-accent text-white rounded-br-lg"
                            : "bg-[#f5f5f7] text-foreground rounded-bl-lg"
                        }`}
                      >
                        {msg.role === "assistant" && msg.content === "" && streaming ? (
                          <div className="flex items-center gap-2 py-1">
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 rounded-full bg-muted/40"
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-[14px] leading-[1.6] whitespace-pre-wrap">
                              {msg.content}
                            </div>
                            {msg.role === "assistant" && msg.content && !streaming && (
                              <div className="flex items-center gap-0.5 mt-2 pt-2 border-t border-black/[0.04]">
                                <button
                                  onClick={() => copyMsg(msg.content, msg.id)}
                                  className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground px-2 py-1 rounded-lg hover:bg-black/[0.04] transition-all"
                                >
                                  {copied === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  {copied === msg.id ? "Copiado" : "Copiar"}
                                </button>
                                <button
                                  onClick={() => saveContent(msg.content, "artigo")}
                                  disabled={saving}
                                  className="flex items-center gap-1 text-[11px] text-muted hover:text-accent px-2 py-1 rounded-lg hover:bg-accent/5 transition-all disabled:opacity-40"
                                >
                                  <FileText className="w-3 h-3" />
                                  Artigo
                                </button>
                                <button
                                  onClick={() => saveContent(msg.content, "termo")}
                                  disabled={saving}
                                  className="flex items-center gap-1 text-[11px] text-muted hover:text-accent px-2 py-1 rounded-lg hover:bg-accent/5 transition-all disabled:opacity-40"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  Termo
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEnd} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mt-3 shrink-0">
            {messages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PROMPTS.slice(0, 4).map((p) => (
                  <button
                    key={p.label}
                    onClick={() => send(p.prompt)}
                    disabled={streaming}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-black/[0.04] text-muted hover:text-foreground hover:border-black/[0.08] transition-all duration-200 disabled:opacity-40"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-white rounded-2xl border border-black/[0.06] px-4 py-2.5 focus-within:border-accent/30 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none text-[14px] text-foreground placeholder:text-muted/40 focus:outline-none bg-transparent min-h-[24px] max-h-[160px] py-0.5"
                placeholder={streaming ? "Aguarde..." : "Pergunte algo..."}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 hover:bg-accent-light active:scale-90 transition-all disabled:opacity-30 disabled:bg-muted disabled:cursor-not-allowed"
              >
                {streaming ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
