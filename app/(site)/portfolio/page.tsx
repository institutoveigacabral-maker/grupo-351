import type { Metadata } from "next";
import { getProjetos } from "@/lib/projetos";
import { PortfolioPage } from "./PortfolioPage";

export const metadata: Metadata = {
  title: "Portfolio — GRUPO +351",
  description:
    "Conheça os negócios e projetos em desenvolvimento pelo Grupo +351. Manufatura digital, e-commerce, sourcing internacional e mais.",
};

export const dynamic = "force-dynamic";

export default async function Portfolio() {
  const projetos = await getProjetos();
  return <PortfolioPage projetos={projetos} />;
}
