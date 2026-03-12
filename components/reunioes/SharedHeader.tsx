"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Brain, Map, Columns3, LayoutDashboard, Copy, Check } from "lucide-react";

const tabs = [
  { id: "hub", href: "/reunioes", label: "Hub", icon: LayoutDashboard, color: "text-accent" },
  { id: "timeline", href: "/reunioes/timeline", label: "Reunioes", icon: CalendarDays, color: "text-blue-600" },
  { id: "kanban", href: "/reunioes/kanban", label: "Kanban", icon: Columns3, color: "text-emerald-600" },
  { id: "roadmaps", href: "/reunioes/roadmaps", label: "Roadmaps", icon: Map, color: "text-amber-600" },
  { id: "inteligencia", href: "/reunioes/inteligencia", label: "Inteligencia", icon: Brain, color: "text-violet-600" },
];

export function SharedHeader({ active, subtitle }: { active: string; subtitle?: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-black/[0.04] shrink-0">
      <div className="h-[56px] flex items-center px-6 gap-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#111d2e] to-[#152d4a] flex items-center justify-center">
          <span className="text-white font-bold text-sm font-display">+</span>
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-foreground font-display">Grupo +351</h2>
          {subtitle && <p className="text-[10px] text-muted font-medium tracking-wide uppercase -mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex-1" />
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted hover:text-foreground hover:bg-black/5 transition-all">
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copiado" : "Link"}
        </button>
      </div>
      {/* Nav tabs */}
      <div className="px-6 flex gap-0.5 -mb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <a
              key={tab.id}
              href={`${tab.href}?token=${token}`}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium border-b-2 transition-all ${
                isActive
                  ? `${tab.color} border-current`
                  : "text-muted hover:text-foreground border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </a>
          );
        })}
      </div>
    </header>
  );
}
