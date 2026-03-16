import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building2, MapPin, Globe, Linkedin, CheckCircle2, Lightbulb, Calendar, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug, ativa: true },
    select: { nome: true, tagline: true },
  });
  if (!company) return { title: "Empresa nao encontrada" };
  return {
    title: `${company.nome} — GRUPO +351`,
    description: company.tagline || `${company.nome} no ecossistema +351.`,
  };
}

const estagioLabel: Record<string, string> = {
  ideacao: "Ideacao", validacao: "Validacao", operando: "Em operacao",
  escala: "Escala", consolidado: "Consolidado",
};

const tipoColors: Record<string, string> = {
  franquia: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/10",
  investimento: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
  parceria: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10",
  fornecedor: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
  expansao: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10",
};

export default async function EmpresaPerfilPage({ params }: Props) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug, ativa: true },
    include: {
      opportunities: {
        where: { status: "aberta" },
        orderBy: { criadoEm: "desc" },
        take: 10,
      },
    },
  });

  if (!company) notFound();

  const initials = company.nome.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#080e1a] pt-32 pb-24 px-6 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/6 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center gap-5 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-white/[0.06]">
              <span className="text-xl font-bold text-white/70">{initials}</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{company.nome}</h1>
                {company.verificada && (
                  <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verificada
                  </div>
                )}
              </div>
              {company.tagline && (
                <p className="text-white/40 mt-1.5 text-lg">{company.tagline}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 mt-6">
            <span className="bg-white/[0.06] text-white/50 text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/[0.04]">
              {company.setor}
            </span>
            <span className="bg-white/[0.06] text-white/50 text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/[0.04]">
              {estagioLabel[company.estagio] || company.estagio}
            </span>
            {company.cidade && (
              <span className="bg-white/[0.06] text-white/50 text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/[0.04] flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> {company.cidade}, {company.pais}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* Sobre */}
        {company.descricao && (
          <div>
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Sobre</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{company.descricao}</p>
          </div>
        )}

        {/* Links */}
        {(company.website || company.linkedin) && (
          <div className="flex flex-wrap gap-3">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors bg-gray-50 px-4 py-2.5 rounded-xl hover:bg-amber-50">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
            {company.linkedin && (
              <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 px-4 py-2.5 rounded-xl hover:bg-blue-50">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}
          </div>
        )}

        {/* Interesses */}
        {company.interesses.length > 0 && (
          <div>
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Interesses</h2>
            <div className="flex flex-wrap gap-2">
              {company.interesses.map((tag) => (
                <span key={tag} className="bg-amber-50 text-amber-700 text-xs font-medium px-3.5 py-1.5 rounded-full ring-1 ring-amber-200/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Oportunidades */}
        {company.opportunities.length > 0 && (
          <div>
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-5">Oportunidades abertas</h2>
            <div className="space-y-3">
              {company.opportunities.map((opp) => (
                <div key={opp.id} className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-black/[0.04] hover:border-gray-200/80 transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">{opp.titulo}</h3>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${tipoColors[opp.tipo] || "bg-gray-50 text-gray-600 ring-1 ring-gray-600/10"}`}>
                      {opp.tipo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{opp.descricao}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                    {opp.budget && (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        <Wallet className="w-3 h-3" /> {opp.budget}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-300">
                      <Calendar className="w-3 h-3" />
                      {new Date(opp.criadoEm).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="relative bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-2xl p-10 text-center overflow-hidden border border-gray-100">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
          <p className="text-gray-500 text-sm mb-5 relative">Quer conectar com {company.nome}?</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-7 py-3 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-amber-500/20 transition-all relative"
          >
            Criar conta na plataforma
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
