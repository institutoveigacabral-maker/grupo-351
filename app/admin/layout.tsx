"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Mail,
  Briefcase,
  BookOpen,
  Brain,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  CalendarDays,
  Handshake,
  UserCog,
  Building2,
  ShieldCheck,
  Target,
  GitPullRequest,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Utilizadores", icon: UserCog },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
  { href: "/admin/oportunidades", label: "Oportunidades", icon: Target },
  { href: "/admin/deals", label: "Pipeline Deals", icon: GitPullRequest },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/candidaturas", label: "Candidaturas", icon: Users },
  { href: "/admin/contatos", label: "Contatos", icon: Mail },
  { href: "/admin/portfolio", label: "Portfólio", icon: Briefcase },
  { href: "/admin/conhecimento", label: "Conhecimento", icon: BookOpen },
  { href: "/admin/parceiros", label: "Parceiros", icon: Handshake },
  { href: "/admin/reunioes", label: "Reuniões", icon: CalendarDays },
  { href: "/admin/inteligencia", label: "Inteligência", icon: Brain },
  { href: "/admin/equipe", label: "Equipe", icon: ShieldCheck },
];

const pageTitle: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/usuarios": "Utilizadores",
  "/admin/empresas": "Empresas",
  "/admin/oportunidades": "Oportunidades",
  "/admin/deals": "Pipeline de Deals",
  "/admin/financeiro": "Financeiro",
  "/admin/candidaturas": "Candidaturas",
  "/admin/contatos": "Contatos",
  "/admin/portfolio": "Portfólio",
  "/admin/conhecimento": "Conhecimento",
  "/admin/parceiros": "Parceiros",
  "/admin/reunioes": "Reuniões",
  "/admin/inteligencia": "Inteligência",
  "/admin/equipe": "Equipe Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const currentTitle = Object.entries(pageTitle).find(
    ([path]) => pathname === path || (path !== "/admin" && pathname.startsWith(path))
  )?.[1] || "Admin";

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform duration-500 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Sidebar inner with gradient */}
        <div className="flex flex-col h-full bg-gradient-to-b from-[#111d2e] via-[#152d4a] to-[#0f1923] relative overflow-hidden">
          {/* Subtle ambient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-0 w-24 h-24 bg-accent/3 rounded-full blur-3xl" />

          {/* Brand */}
          <div className="relative px-6 py-5 flex items-center gap-3">
            <Logo className="text-white" size={24} />
            <div>
              <p className="text-white/40 text-[11px] font-medium tracking-wide">
                PAINEL DE GOVERNANÇA
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    active
                      ? "text-white"
                      : "text-white/45 hover:text-white/80"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-white/[0.08] rounded-xl"
                      style={{ boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.1)" }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-[18px] h-[18px] relative z-10 transition-colors ${active ? "text-accent-light" : "group-hover:text-white/60"}`} />
                  <span className="relative z-10">{item.label}</span>
                  {item.label === "Inteligência" && (
                    <span className="relative z-10 ml-auto text-[9px] font-bold uppercase tracking-widest text-accent-light/70 bg-accent/10 px-1.5 py-0.5 rounded-md">
                      AI
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Bottom */}
          <div className="px-3 py-4 space-y-0.5">
            <a
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            >
              <ExternalLink className="w-[18px] h-[18px]" />
              Ver site
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Terminar sessão
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar (glass) */}
        <header className="h-[56px] bg-white/70 backdrop-blur-xl border-b border-black/[0.04] flex items-center px-6 gap-4 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-muted hover:text-foreground hover:bg-black/5 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-foreground font-display">
              {currentTitle}
            </h2>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="h-7 w-px bg-border" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
              <span className="text-white text-xs font-bold">HL</span>
            </div>
          </div>
        </header>

        {/* Page content with animation */}
        <main className="flex-1 p-5 lg:p-8 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
