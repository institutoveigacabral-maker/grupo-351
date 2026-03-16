import Link from "next/link";
import { Building2, MapPin, BadgeCheck, ArrowRight, Globe, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 600; // ISR: 10 min

export const metadata: Metadata = {
  title: "Empresas — GRUPO +351",
  description: "Conheça as empresas do ecossistema +351. Encontre parceiros, fornecedores e oportunidades.",
};

interface Company {
  slug: string;
  nome: string;
  tagline: string | null;
  setor: string;
  pais: string;
  cidade: string | null;
  estagio: string;
  interesses: string[];
  verificada: boolean;
}

async function getCompanies(): Promise<Company[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.company.findMany({
      where: { ativa: true },
      select: {
        slug: true, nome: true, tagline: true, setor: true,
        pais: true, cidade: true, estagio: true, interesses: true, verificada: true,
      },
      orderBy: { criadoEm: "desc" },
      take: 50,
    });
  } catch {
    return [];
  }
}

const estagioConfig: Record<string, { label: string; color: string }> = {
  ideacao: { label: "Ideação", color: "text-violet-600 bg-violet-50" },
  validacao: { label: "Validação", color: "text-amber-600 bg-amber-50" },
  operando: { label: "Em operação", color: "text-blue-600 bg-blue-50" },
  escala: { label: "Escala", color: "text-emerald-600 bg-emerald-50" },
  consolidado: { label: "Consolidado", color: "text-gray-600 bg-gray-100" },
};

export default async function EmpresasPage() {
  const companies = await getCompanies();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#080e1a] pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-[-20%] right-[20%] w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-1.5 mb-6">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-white/50 text-xs font-medium">{companies.length} empresas no ecossistema</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Empresas do ecossistema
          </h1>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-lg">
            Empresas, parceiros e operadores conectados na rede +351.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {companies.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Nenhuma empresa cadastrada ainda.</p>
            <Link href="/register" className="inline-flex items-center gap-1.5 text-amber-600 text-sm mt-3 font-medium hover:text-amber-500 transition-colors">
              Seja a primeira <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((c) => {
              const estagio = estagioConfig[c.estagio] || { label: c.estagio, color: "text-gray-600 bg-gray-50" };
              const initials = c.nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

              return (
                <Link
                  key={c.slug}
                  href={`/empresas/${c.slug}`}
                  className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-black/[0.04] hover:border-gray-200/80 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-100">
                      <span className="text-sm font-bold text-gray-400">{initials}</span>
                    </div>
                    {c.verificada && (
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" />
                        <span className="text-[10px] font-semibold">Verificada</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors text-[15px]">
                    {c.nome}
                  </h3>
                  {c.tagline && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{c.tagline}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-semibold bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full ring-1 ring-gray-200/50">{c.setor}</span>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${estagio.color}`}>{estagio.label}</span>
                  </div>

                  {c.cidade && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {c.cidade}, {c.pais}
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-50 text-xs text-amber-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    Ver perfil <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
