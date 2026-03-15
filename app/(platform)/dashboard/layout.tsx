"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: string;
  nome: string;
  email: string;
  role: string;
  company?: { slug: string; nome: string } | null;
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
    </div>
  );
}
