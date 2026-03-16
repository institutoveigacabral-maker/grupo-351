"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Printer,
  ShoppingBag,
  GraduationCap,
  Package,
  Brain,
  Telescope,
  Scissors,
  Globe,
  Users,
} from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import type { Projeto } from "@/lib/projetos";

const iconMap: Record<string, typeof Printer> = {
  printer: Printer,
  "shopping-bag": ShoppingBag,
  "graduation-cap": GraduationCap,
  package: Package,
  brain: Brain,
  telescope: Telescope,
  scissors: Scissors,
};

export function ProjetoPage({ projeto }: { projeto: Projeto }) {
  const Icon = iconMap[projeto.icon] || Printer;

  return (
    <main className="pt-16">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-b from-surface to-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao portfólio
            </Link>

            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold text-primary font-display">
                    {projeto.name}
                  </h1>
                  <span className="text-xs font-medium text-accent bg-accent/5 px-3 py-1 rounded-full">
                    {projeto.tag}
                  </span>
                </div>
                <p className="text-muted text-xl">{projeto.tagline}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Info cards */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface rounded-xl border border-border p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      projeto.status === "Em operação"
                        ? "bg-success"
                        : projeto.status === "Consolidado"
                        ? "bg-blue-500"
                        : projeto.status === "Em desenvolvimento"
                        ? "bg-warning"
                        : projeto.status === "Ideação"
                        ? "bg-purple-400"
                        : "bg-muted"
                    }`}
                  />
                  <span className="text-foreground font-medium text-sm">
                    {projeto.status}
                  </span>
                </div>
              </div>
              <div className="bg-surface rounded-xl border border-border p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Mercado</p>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium text-sm">
                    {projeto.mercado}
                  </span>
                </div>
              </div>
              <div className="bg-surface rounded-xl border border-border p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Setor</p>
                <span className="text-foreground font-medium text-sm">{projeto.tag}</span>
              </div>
              {projeto.parceiro && (
                <div className="bg-surface rounded-xl border border-border p-5">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">
                    Parceiro
                  </p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium text-sm">
                      {projeto.parceiro}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Descrição + Detalhes */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Sobre o projeto
              </h2>
              <p className="text-muted leading-relaxed text-lg">
                {projeto.description}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                O que fazemos
              </h2>
              <ul className="space-y-3">
                {projeto.detalhes.map((d) => (
                  <li key={d} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-muted leading-relaxed">{d}</span>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white font-display mb-4">
              Interesse neste projeto?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Entre em contato para saber mais sobre oportunidades de parceria.
            </p>
            <a
              href="/contato"
              className="group inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg"
            >
              Fale conosco
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
