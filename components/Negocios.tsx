"use client";

import {
  Printer,
  ShoppingBag,
  GraduationCap,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const iconMap = {
  printer: Printer,
  "shopping-bag": ShoppingBag,
  "graduation-cap": GraduationCap,
  package: Package,
};

const projetos = [
  {
    name: "Forge and Flow 3D",
    desc: "Manufatura distribuida via impressão 3D. Produção, franquia leve e infoproduto.",
    icon: "printer" as const,
    tag: "Manufatura Digital",
    status: "Em operação",
    statusColor: "bg-success",
    href: "/portfolio/forge-and-flow-3d",
  },
  {
    name: "Veeenha!!!",
    desc: "Super app e marketplace regional. Infraestrutura digital de economia local.",
    icon: "shopping-bag" as const,
    tag: "Marketplace",
    status: "Em desenvolvimento",
    statusColor: "bg-warning",
    href: "/portfolio/veeenha",
  },
  {
    name: "Ruptfy",
    desc: "Plataforma EdTech propria. A fabrica de cursos do grupo.",
    icon: "graduation-cap" as const,
    tag: "EdTech",
    status: "Em desenvolvimento",
    statusColor: "bg-warning",
    href: "/portfolio/ruptfy",
  },
  {
    name: "Purple Party",
    desc: "Franqueadora + atacado China-Europa. Alibaba Express com franquia fisica.",
    icon: "package" as const,
    tag: "Franquia / Atacado",
    status: "Em desenvolvimento",
    statusColor: "bg-warning",
    href: "/portfolio/purple-party",
  },
];

export function Negocios() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="negocios" className="py-28 bg-[#f8f9fb]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <p className="text-accent text-[13px] font-semibold tracking-[0.2em] uppercase mb-5">
              Ecossistema
            </p>
            <h2 className="text-3xl md:text-[2.75rem] font-bold text-primary font-display tracking-[-0.025em] leading-[1.1]">
              Marcas e operacoes
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-accent text-[14px] font-medium hover:underline underline-offset-4 group shrink-0"
          >
            Ver todas as 7 marcas
            <span className="group-hover:translate-x-0.5 transition-transform duration-300">&rarr;</span>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {projetos.map(({ name, desc, icon, tag, status, statusColor, href }, i) => {
            const Icon = iconMap[icon];
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.7, ease }}
              >
                <a href={href} className="group block h-full">
                  <div className="bg-white rounded-2xl p-8 h-full border border-black/[0.04] hover:shadow-xl hover:shadow-black/[0.04] hover:border-black/[0.06] transition-all duration-500">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary/[0.04] flex items-center justify-center group-hover:bg-primary/[0.08] group-hover:shadow-lg group-hover:shadow-primary/[0.06] transition-all duration-500">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-black/[0.08] group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                    </div>

                    <span className="text-[12px] font-semibold text-accent bg-accent/[0.06] px-3 py-1.5 rounded-full tracking-wide">
                      {tag}
                    </span>

                    <h3 className="text-2xl font-bold text-foreground mt-4 mb-3 tracking-[-0.02em] group-hover:text-primary transition-colors duration-300">
                      {name}
                    </h3>
                    <p className="text-muted text-[14px] leading-[1.7] mb-6">{desc}</p>

                    <div className="flex items-center gap-2 pt-4 border-t border-black/[0.04]">
                      <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                      <span className="text-[12px] text-muted font-medium">{status}</span>
                    </div>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap gap-2.5"
        >
          {["Córtex FC", "Long View", "Barbearia do Rão"].map((name) => (
            <Link
              key={name}
              href="/portfolio"
              className="text-[12px] font-medium text-muted bg-white border border-black/[0.04] px-4 py-2 rounded-full hover:border-black/[0.08] hover:text-primary hover:shadow-sm transition-all duration-300"
            >
              + {name}
            </Link>
          ))}
          <span className="text-[12px] text-muted/60 self-center ml-1 font-medium">
            e mais no portfolio completo
          </span>
        </motion.div>
      </div>
    </section>
  );
}
