"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Briefcase,
  BookOpen,
  Globe,
  Rocket,
  CheckCircle2,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

const ease = [0.16, 1, 0.3, 1] as const;

interface Metrics {
  projetos: {
    total: number;
    emOperacao: number;
    consolidados: number;
    emDesenvolvimento: number;
  };
  conhecimento: {
    termos: number;
    artigos: number;
  };
  ecossistema: {
    marcas: number;
    paisesAtuacao: number;
    anosExperiencia: number;
  };
}

export function MetricasPage() {
  const [data, setData] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/metricas")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <main className="pt-16">
      {/* Hero */}
      <section className="py-28 bg-gradient-to-b from-[#f8f9fb] to-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease }}
          >
            <p className="text-accent text-[13px] font-semibold tracking-[0.2em] uppercase mb-5">
              Dashboard
            </p>
            <h1 className="text-4xl md:text-[3.5rem] font-bold text-primary font-display tracking-[-0.03em] leading-[1.05] mb-6">
              Métricas do ecossistema
            </h1>
            <p className="text-muted text-xl leading-[1.7] max-w-3xl tracking-[-0.006em]">
              Dados públicos e atualizados sobre o portfólio, projetos e base de
              conhecimento do Grupo +351.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {!data ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Projetos */}
              <AnimatedSection>
                <h2 className="text-xl font-bold text-foreground font-display mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent" />
                  Portfólio
                </h2>
              </AnimatedSection>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                {[
                  {
                    icon: BarChart3,
                    value: data.projetos.total,
                    label: "Projetos totais",
                    color: "text-primary",
                    bg: "bg-primary/[0.05]",
                  },
                  {
                    icon: CheckCircle2,
                    value: data.projetos.emOperacao,
                    label: "Em operação",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    icon: Rocket,
                    value: data.projetos.consolidados,
                    label: "Consolidados",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    icon: Wrench,
                    value: data.projetos.emDesenvolvimento,
                    label: "Em desenvolvimento",
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                ].map(({ icon: Icon, value, label, color, bg }, i) => (
                  <AnimatedSection key={label} delay={i * 0.08}>
                    <div className="bg-[#f8f9fb] rounded-2xl border border-black/[0.04] p-6 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-500">
                      <div
                        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}
                      >
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <p
                        className={`text-3xl font-bold font-display tracking-tight ${color}`}
                      >
                        {value}
                      </p>
                      <p className="text-muted text-[13px] mt-1">{label}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              {/* Ecossistema */}
              <AnimatedSection>
                <h2 className="text-xl font-bold text-foreground font-display mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" />
                  Ecossistema
                </h2>
              </AnimatedSection>

              <div className="grid grid-cols-3 gap-4 mb-16">
                {[
                  { value: `${data.ecossistema.marcas}`, label: "Marcas no portfólio" },
                  { value: `${data.ecossistema.paisesAtuacao}`, label: "Países de atuação" },
                  { value: `${data.ecossistema.anosExperiencia}+`, label: "Anos de experiência" },
                ].map(({ value, label }, i) => (
                  <AnimatedSection key={label} delay={i * 0.08}>
                    <div className="bg-[#f8f9fb] rounded-2xl border border-black/[0.04] p-6 text-center hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-500">
                      <p className="text-3xl font-bold text-primary font-display tracking-tight">
                        {value}
                      </p>
                      <p className="text-muted text-[13px] mt-1">{label}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              {/* Conhecimento */}
              <AnimatedSection>
                <h2 className="text-xl font-bold text-foreground font-display mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  Base de conhecimento
                </h2>
              </AnimatedSection>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: data.conhecimento.termos, label: "Termos no glossário" },
                  { value: data.conhecimento.artigos, label: "Artigos publicados" },
                ].map(({ value, label }, i) => (
                  <AnimatedSection key={label} delay={i * 0.08}>
                    <div className="bg-[#f8f9fb] rounded-2xl border border-black/[0.04] p-6 text-center hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-500">
                      <p className="text-3xl font-bold text-primary font-display tracking-tight">
                        {value}
                      </p>
                      <p className="text-muted text-[13px] mt-1">{label}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#f8f9fb]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-primary font-display mb-4">
              Quer fazer parte destes números?
            </h2>
            <p className="text-muted mb-8">
              Candidate-se como parceiro ou explore nosso portfólio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/aplicar"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-light transition-all"
              >
                Candidatar-se
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-xl font-medium hover:bg-primary hover:text-white transition-all"
              >
                Ver portfólio
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
