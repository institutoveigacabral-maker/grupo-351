import type { Metadata } from "next";
import { getProjetos } from "@/lib/projetos";
import { PortfolioPage } from "./PortfolioPage";
import { JsonLd } from "@/components/JsonLd";
import { portfolioListSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Portfolio — GRUPO +351",
  description:
    "Conheça os negócios e projetos em desenvolvimento pelo Grupo +351. Manufatura digital, e-commerce, sourcing internacional e mais.",
};

export const dynamic = "force-dynamic";

export default async function Portfolio() {
  const projetos = await getProjetos();
  return (
    <>
      <JsonLd
        data={[
          portfolioListSchema(projetos),
          breadcrumbSchema([
            { name: "Home", url: "https://grupo351.com" },
            { name: "Portfólio", url: "https://grupo351.com/portfolio" },
          ]),
        ]}
      />
      <PortfolioPage projetos={projetos} />
    </>
  );
}
