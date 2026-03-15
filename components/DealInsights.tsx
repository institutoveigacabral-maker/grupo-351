"use client";

import { useState, useEffect } from "react";
import { Brain, Loader2, RefreshCw } from "lucide-react";

interface DealInsightsProps {
  matchId: string;
}

export function DealInsights({ matchId }: DealInsightsProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadInsights() {
    setLoading(true);
    setContent("");

    try {
      const res = await fetch(`/api/platform/matches/${matchId}/insights`);
      if (!res.ok) {
        setContent("Erro ao gerar insights. Tente novamente.");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                text += parsed.text;
                setContent(text);
              }
            } catch {}
          }
        }
      }
      setLoaded(true);
    } catch {
      setContent("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-semibold text-gray-900">Insights IA</h3>
        </div>
        <button
          onClick={loadInsights}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {loaded ? "Regenerar" : "Gerar insights"}
        </button>
      </div>

      {content ? (
        <div className="prose prose-sm prose-gray max-w-none text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : !loading ? (
        <p className="text-xs text-gray-400">Clique em "Gerar insights" para obter uma análise IA deste match.</p>
      ) : (
        <div className="flex items-center gap-2 text-xs text-violet-600">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Analisando match...
        </div>
      )}
    </div>
  );
}
