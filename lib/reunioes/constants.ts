export const tagColors: Record<string, string> = {
  IPO: "bg-amber-500/10 text-amber-700",
  IA: "bg-violet-500/10 text-violet-700",
  China: "bg-red-500/10 text-red-700",
  "Supply Chain": "bg-cyan-500/10 text-cyan-700",
  Franquia: "bg-emerald-500/10 text-emerald-700",
  Parceria: "bg-blue-500/10 text-blue-700",
  Importacao: "bg-orange-500/10 text-orange-700",
  "Grupo Rao": "bg-primary/10 text-primary",
  Tecnologia: "bg-indigo-500/10 text-indigo-700",
  WhatsApp: "bg-green-500/10 text-green-700",
  Estrategia: "bg-sky-500/10 text-sky-700",
  Marketing: "bg-pink-500/10 text-pink-700",
  Financeiro: "bg-lime-500/10 text-lime-700",
  Paraguai: "bg-teal-500/10 text-teal-700",
  Portugal: "bg-blue-500/10 text-blue-700",
  "E-Commerce": "bg-purple-500/10 text-purple-700",
  Brook: "bg-green-500/10 text-green-700",
};

export function getTagColor(tag: string) {
  for (const [key, value] of Object.entries(tagColors)) {
    if (tag.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return "bg-black/[0.04] text-foreground/70";
}

export const prioConfig: Record<string, { label: string; color: string; dot: string }> = {
  critica: { label: "Critica", color: "text-red-600 bg-red-500/10", dot: "bg-red-500" },
  alta: { label: "Alta", color: "text-orange-600 bg-orange-500/10", dot: "bg-orange-500" },
  media: { label: "Media", color: "text-blue-600 bg-blue-500/10", dot: "bg-blue-500" },
  baixa: { label: "Baixa", color: "text-muted bg-black/[0.04]", dot: "bg-muted" },
};

export const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  planejamento: { label: "Planejamento", color: "text-violet-600", bg: "bg-violet-500/10" },
  em_desenvolvimento: { label: "Em Desenvolvimento", color: "text-amber-600", bg: "bg-amber-500/10" },
  em_andamento: { label: "Em Andamento", color: "text-blue-600", bg: "bg-blue-500/10" },
  pausado: { label: "Pausado", color: "text-red-500", bg: "bg-red-500/10" },
  concluido: { label: "Concluido", color: "text-emerald-600", bg: "bg-emerald-500/10" },
};

export const catIconColors: Record<string, string> = {
  Estrategico: "text-red-500", Operacional: "text-orange-500", Expansao: "text-blue-500",
  Tecnologia: "text-violet-500", Wellness: "text-green-500", Franquia: "text-emerald-500",
  "E-commerce": "text-purple-500", Plataforma: "text-indigo-500", Holding: "text-slate-500",
  Conteudo: "text-pink-500", Mobilidade: "text-cyan-500", "Nova Vertical": "text-amber-500",
};
