"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ArrowRight, Eye, EyeOff, Building2, Handshake } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "empresa" as const });
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.senha.length < 8) {
      setError("Senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/platform/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar conta");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const inputClass =
    "w-full px-4 py-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/20 focus:bg-white/[0.05] transition-all";

  return (
    <div className="min-h-screen bg-[#080e1a] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Noise + grid */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.06] mb-6 backdrop-blur-sm">
            <Logo className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Criar conta</h1>
          <p className="text-white/30 text-sm mt-2.5">Entre no ecossistema +351</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 shadow-2xl shadow-black/20">
          <a
            href="/api/platform/auth/google"
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-3.5 rounded-2xl font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm border border-gray-100 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar com Google
          </a>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-white/20 text-[11px] font-medium uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-nome" className="block text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Nome completo</label>
              <input
                id="reg-nome"
                type="text"
                className={inputClass}
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Email</label>
              <input
                id="reg-email"
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="reg-senha" className="block text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <input
                  id="reg-senha"
                  type={showSenha ? "text" : "password"}
                  className={`${inputClass} pr-11`}
                  value={form.senha}
                  onChange={(e) => set("senha", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-2.5 uppercase tracking-wider">Eu sou</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "empresa", label: "Empresa", desc: "Quero crescer", icon: Building2 },
                  { value: "parceiro", label: "Parceiro", desc: "Quero contribuir", icon: Handshake },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = form.role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("role", opt.value)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        active
                          ? "border-amber-500/30 bg-amber-500/[0.08] shadow-lg shadow-amber-500/5"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${active ? "text-amber-400" : "text-white/30"}`} />
                      <p className={`text-sm font-semibold ${active ? "text-amber-400" : "text-white/60"}`}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-white/25 mt-0.5">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3.5 rounded-2xl font-semibold text-sm hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Criar conta
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/25 text-sm mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-white/15 text-xs hover:text-white/30 transition-colors">
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
