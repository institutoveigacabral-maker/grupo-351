"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import type { Artigo } from "@/lib/conhecimento-types";

const categoriaLabels = {
  tese: "Tese",
  modelo: "Modelo",
  case: "Case",
  guia: "Guia",
};

export function ArtigoPage({ artigo, allArtigos }: { artigo: Artigo; allArtigos: Artigo[] }) {
  const currentIdx = allArtigos.findIndex((a) => a.slug === artigo.slug);
  const next = allArtigos[currentIdx + 1];
  const prev = allArtigos[currentIdx - 1];

  return (
    <main className="pt-16">
      <section className="py-16 md:py-24 bg-gradient-to-b from-surface to-white">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              href="/conhecimento"
              className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Base de Conhecimento
            </Link>

            <span className="text-[10px] font-medium text-accent bg-accent/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {categoriaLabels[artigo.categoria]}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold text-primary font-display mt-4 mb-4">
              {artigo.titulo}
            </h1>
            <p className="text-muted text-lg leading-relaxed">
              {artigo.resumo}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection>
            <div className="prose-custom space-y-6">
              {artigo.conteudo.map((p, i) => (
                <p
                  key={i}
                  className="text-foreground leading-[1.8] text-[17px]"
                >
                  {p}
                </p>
              ))}
            </div>
          </AnimatedSection>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
            {prev ? (
              <a
                href={`/conhecimento/${prev.slug}`}
                className="group flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {prev.titulo}
              </a>
            ) : (
              <div />
            )}
            {next ? (
              <a
                href={`/conhecimento/${next.slug}`}
                className="group flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm text-right"
              >
                {next.titulo}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            ) : (
              <div />
            )}
          </div>

          {/* CTA */}
          <AnimatedSection>
            <div className="mt-12 bg-surface rounded-2xl border border-border p-8 text-center">
              <BookOpen className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-2">
                Quer aplicar estes conceitos?
              </h3>
              <p className="text-muted text-sm mb-4">
                Conheça os modelos de parceria e candidate-se.
              </p>
              <a
                href="/aplicar"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-all"
              >
                Candidatar-se
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
