import { prisma } from "@/lib/prisma";
import { Lightbulb, Building2, MapPin, ArrowRight, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 300; // ISR: 5 min

export const metadata: Metadata = {
  title: "Oportunidades — GRUPO +351",
  description: "Franquias, investimentos, parcerias e oportunidades de expansão no ecossistema +351.",
};

const tipoConfig: Record<string, { color: string; bg: string; ring: string }> = {
  franquia: { color: "text-purple-700", bg: "bg-purple-50", ring: "ring-purple-500/10" },
  investimento: { color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-500/10" },
  parceria: { color: "text-blue-700", bg: "bg-blue-50", ring: "ring-blue-500/10" },
  fornecedor: { color: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-500/10" },
  expansao: { color: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-500/10" },
};

async function getOpportunities() {
  try {
    return await prisma.opportunity.findMany({
      where: { status: "aberta" },
      include: {
        company: { select: { slug: true, nome: true, verificada: true } },
      },
      orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
      take: 50,
    });
  } catch {
    return [];
  }
}

export default async function OportunidadesPage() {
  const opps = await getOpportunities();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero section */}
      <section className="relative bg-[#080e1a] pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-white/50 text-xs font-medium">{opps.length} oportunidades ativas</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Oportunidades
          </h1>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-lg">
            Franquias, investimentos, parcerias e expansão. Encontre a sua.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {opps.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
              <Lightbulb className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Nenhuma oportunidade publicada ainda.</p>
            <Link href="/register" className="inline-flex items-center gap-1.5 text-amber-600 text-sm mt-3 font-medium hover:text-amber-500 transition-colors">
              Crie uma conta e publique a primeira <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {opps.map((opp) => {
              const tipo = tipoConfig[opp.tipo] || { color: "text-gray-600", bg: "bg-gray-50", ring: "ring-gray-500/10" };

              return (
                <div
                  key={opp.id}
                  className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-black/[0.04] hover:border-gray-200/80 transition-all duration-300 relative overflow-hidden"
                >
                  {opp.destaque && (
                    <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                      <div className="absolute -right-6 -top-6 w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rotate-45 opacity-10" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-[15px] group-hover:text-gray-800 transition-colors pr-3 leading-snug">
                      {opp.titulo}
                    </h3>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 shrink-0 ${tipo.bg} ${tipo.color} ${tipo.ring}`}>
                      {opp.tipo}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-3 mb-5 leading-relaxed">{opp.descricao}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <Link href={`/empresas/${opp.company.slug}`} className="flex items-center gap-1.5 hover:text-amber-600 transition-colors font-medium">
                        <Building2 className="w-3.5 h-3.5" /> {opp.company.nome}
                      </Link>
                      {opp.localizacao && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {opp.localizacao}
                        </span>
                      )}
                    </div>
                    {opp.budget && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Wallet className="w-3 h-3" /> {opp.budget}
                      </span>
                    )}
                  </div>

                  <Link
                    href="/register"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-500 font-semibold transition-colors"
                  >
                    Demonstrar interesse <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
