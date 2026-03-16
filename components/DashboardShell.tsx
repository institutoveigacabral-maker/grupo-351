"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import {
  LayoutDashboard,
  Building2,
  Lightbulb,
  GitMerge,
  FolderKanban,
  CreditCard,
  Key,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useTranslations } from "next-intl";
import { useNotifications, useMarkAllRead } from "@/hooks/queries";
import { api } from "@/lib/api-client";
import { Search } from "lucide-react";

const AIAssistant = dynamic(() => import("@/components/AIAssistant").then((m) => m.AIAssistant), {
  ssr: false,
});

interface UserData {
  id: string;
  nome: string;
  email: string;
  role: string;
  company?: { slug: string; nome: string } | null;
}

const navKeys = [
  { href: "/dashboard", key: "nav.overview", icon: LayoutDashboard },
  { href: "/dashboard/empresa", key: "nav.company", icon: Building2 },
  { href: "/dashboard/oportunidades", key: "nav.opportunities", icon: Lightbulb },
  { href: "/dashboard/matches", key: "nav.matches", icon: GitMerge },
  { href: "/dashboard/projetos", key: "nav.projects", icon: FolderKanban },
  { href: "/dashboard/equipe", key: "nav.team", icon: Users },
  { href: "/dashboard/plano", key: "nav.plan", icon: CreditCard },
  { href: "/dashboard/api", key: "nav.api", icon: Key },
];

export function DashboardShell({ user, children }: { user: UserData; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [mobileNav, setMobileNav] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // TanStack Query — auto polling 60s, pauses when tab hidden
  const { data: notifData } = useNotifications();
  const markAllReadMutation = useMarkAllRead();

  const notifications = notifData?.notifications?.slice(0, 10) ?? [];
  const notifCount = notifData?.unreadCount ?? 0;

  function markAllRead() {
    markAllReadMutation.mutate();
  }

  async function handleLogout() {
    await api.logout();
    router.push("/login");
  }

  const initials = user.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/[0.04] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="md:hidden text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Menu de navegacao"
              aria-expanded={mobileNav}
            >
              {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <Logo className="text-[#0B1D32]" size={22} />
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-px h-4 bg-gray-200" />
                <span className="text-xs font-medium text-gray-400">{t("nav.platform")}</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Cmd+K trigger */}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/[0.06] text-xs text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors bg-gray-50/50"
              aria-label="Busca rapida (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar...</span>
              <kbd className="px-1 py-0.5 text-[9px] font-medium bg-white border border-gray-200 rounded">⌘K</kbd>
            </button>

            <LocaleSwitcher />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-50"
                aria-label={notifCount > 0 ? `Notificacoes (${notifCount} nao lidas)` : "Notificacoes"}
                aria-expanded={notifOpen}
              >
                <Bell className="w-[18px] h-[18px]" />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-black/[0.08] z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900">{t("header.notifications")}</p>
                      {notifCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-amber-600 hover:underline font-medium">
                          {t("header.markAllRead")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-10">{t("header.noNotifications")}</p>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || "#"}
                            className={`block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.lida ? "bg-amber-50/30" : ""}`}
                            onClick={() => setNotifOpen(false)}
                          >
                            <p className="text-xs font-medium text-gray-900">{n.titulo}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{n.mensagem}</p>
                            <p className="text-[9px] text-gray-400 mt-1">
                              {new Date(n.criadoEm).toLocaleString("pt-PT")}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-6 bg-gray-200/60 mx-1 hidden md:block" />

            <div className="hidden md:flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{user.nome}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-50"
              title={t("common.logout")}
              aria-label={t("common.logout")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className={`
          ${mobileNav ? "block" : "hidden"} md:block
          w-56 shrink-0 bg-white border-r border-black/[0.04] min-h-[calc(100vh-3.5rem)]
          fixed md:sticky top-14 z-40 md:z-0
        `}>
          <nav className="p-3 space-y-0.5" aria-label="Menu do dashboard">
            {navKeys.map(({ href, key, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileNav(false)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all ${
                    active
                      ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-semibold shadow-sm shadow-amber-500/[0.06]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${active ? "text-amber-600" : "text-gray-400 group-hover:text-gray-500"}`} />
                  <span className="flex-1">{t(key)}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Company indicator */}
          {user.company && (
            <div className="mx-3 mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Empresa</p>
              <p className="text-xs font-semibold text-gray-900 truncate">{user.company.nome}</p>
            </div>
          )}
        </aside>

        {/* Content */}
        <main id="main-content" className="flex-1 p-4 md:p-8 min-w-0">
          {children}
        </main>
      </div>

      {/* AI Assistant — lazy loaded */}
      <AIAssistant />
    </div>
  );
}
