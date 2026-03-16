"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Building2,
  Lightbulb,
  GitMerge,
  FolderKanban,
  Users,
  CreditCard,
  Key,
  Search,
  Globe,
  Settings,
  FileText,
  type LucideIcon,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: string;
  keywords?: string[];
}

const commands: CommandItem[] = [
  // Platform
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Plataforma" },
  { id: "empresa", label: "Empresa", href: "/dashboard/empresa", icon: Building2, group: "Plataforma", keywords: ["company", "perfil"] },
  { id: "oportunidades", label: "Oportunidades", href: "/dashboard/oportunidades", icon: Lightbulb, group: "Plataforma", keywords: ["opportunities", "criar"] },
  { id: "matches", label: "Matches", href: "/dashboard/matches", icon: GitMerge, group: "Plataforma", keywords: ["parcerias", "deals"] },
  { id: "projetos", label: "Projetos", href: "/dashboard/projetos", icon: FolderKanban, group: "Plataforma", keywords: ["projects"] },
  { id: "equipe", label: "Equipe", href: "/dashboard/equipe", icon: Users, group: "Plataforma", keywords: ["team", "membros", "convite"] },
  { id: "plano", label: "Plano & Faturacao", href: "/dashboard/plano", icon: CreditCard, group: "Plataforma", keywords: ["billing", "subscription", "upgrade"] },
  { id: "api", label: "API Keys", href: "/dashboard/api", icon: Key, group: "Plataforma", keywords: ["chaves", "integracao"] },
  // Public
  { id: "marketplace", label: "Marketplace", href: "/oportunidades", icon: Globe, group: "Explorar", keywords: ["buscar", "search"] },
  { id: "empresas", label: "Empresas", href: "/empresas", icon: Building2, group: "Explorar" },
  { id: "portfolio", label: "Portfolio", href: "/portfolio", icon: FileText, group: "Explorar", keywords: ["cases", "projetos"] },
  { id: "conhecimento", label: "Conhecimento", href: "/conhecimento", icon: FileText, group: "Explorar", keywords: ["blog", "artigos"] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="relative flex justify-center pt-[20vh]">
        <Command
          className="w-full max-w-lg bg-white rounded-2xl border border-black/[0.06] shadow-2xl shadow-black/[0.12] overflow-hidden animate-scale-in"
          label="Navegacao rapida"
        >
          <div className="flex items-center gap-3 px-4 border-b border-black/[0.04]">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <Command.Input
              placeholder="Buscar paginas, acoes..."
              className="w-full py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-400">
              Nenhum resultado encontrado.
            </Command.Empty>

            {["Plataforma", "Explorar"].map((group) => {
              const items = commands.filter((c) => c.group === group);
              return (
                <Command.Group
                  key={group}
                  heading={group}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                >
                  {items.map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <Command.Item
                        key={cmd.id}
                        value={[cmd.label, ...(cmd.keywords || [])].join(" ")}
                        onSelect={() => handleSelect(cmd.href)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 cursor-pointer data-[selected=true]:bg-gray-50 data-[selected=true]:text-gray-900 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="flex-1">{cmd.label}</span>
                        <span className="text-[10px] text-gray-300">
                          {cmd.group === "Plataforma" ? "Ir" : "Abrir"}
                        </span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              );
            })}
          </Command.List>

          <div className="px-4 py-2.5 border-t border-black/[0.04] bg-gray-50/50 flex items-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px]">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px]">↵</kbd>
              selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px]">esc</kbd>
              fechar
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
