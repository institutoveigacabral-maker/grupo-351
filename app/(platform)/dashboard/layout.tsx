"use client";

import { useEffect, useState, useCallback } from "react";
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
  User,
  Menu,
  X,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { AIAssistant } from "@/components/AIAssistant";

interface UserData {
  id: string;
  nome: string;
  email: string;
  role: string;
  company?: { slug: string; nome: string } | null;
}

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  criadoEm: string;
}

const navItems = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/empresa", label: "Minha empresa", icon: Building2 },
  { href: "/dashboard/oportunidades", label: "Oportunidades", icon: Lightbulb },
  { href: "/dashboard/matches", label: "Matches", icon: GitMerge },
  { href: "/dashboard/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/dashboard/equipe", label: "Equipe", icon: Users },
  { href: "/dashboard/plano", label: "Plano", icon: CreditCard },
  { href: "/dashboard/api", label: "API", icon: Key },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/platform/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setUser)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchNotifications = useCallback(() => {
    fetch("/api/platform/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications.slice(0, 10));
        if (typeof data.unreadCount === "number") setNotifCount(data.unreadCount);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  async function markAllRead() {
    await fetch("/api/platform/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  async function handleLogout() {
    await fetch("/api/platform/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Top bar */}
      <header className="bg-white border-b border-black/[0.04] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="md:hidden text-gray-500"
            >
              {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <Logo className="text-[#0B1D32]" size={22} />
              <span className="text-xs font-medium text-gray-400 hidden sm:block">Plataforma</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-gray-400 hover:text-gray-600 transition-colors p-1.5"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900">Notificações</p>
                      {notifCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-amber-600 hover:underline">
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-8">Sem notificações</p>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || "#"}
                            className={`block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.lida ? "bg-amber-50/50" : ""}`}
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

            <div className="hidden md:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">{user.nome}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className={`
          ${mobileNav ? "block" : "hidden"} md:block
          w-56 shrink-0 border-r border-black/[0.04] bg-white min-h-[calc(100vh-3.5rem)]
          fixed md:sticky top-14 z-40 md:z-0
        `}>
          <nav className="p-3 space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileNav(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          {children}
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
