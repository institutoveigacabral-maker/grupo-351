import type { Metadata } from "next";
import { getGlossario, getArtigos } from "@/lib/conhecimento";
import { ConhecimentoPage } from "./ConhecimentoPage";
import { JsonLd } from "@/components/JsonLd";
import { conhecimentoListSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Base de Conhecimento — GRUPO +351",
  description:
    "Glossário FIGITAL, artigos sobre o modelo de negócio e guias sobre joint ventures do Grupo +351.",
};

export const dynamic = "force-dynamic";

export default async function Conhecimento() {
  const [glossario, artigos] = await Promise.all([
    getGlossario(),
    getArtigos(),
  ]);
  return (
    <>
      <JsonLd
        data={[
          conhecimentoListSchema(artigos, glossario),
          breadcrumbSchema([
            { name: "Home", url: "https://grupo351.com" },
            { name: "Conhecimento", url: "https://grupo351.com/conhecimento" },
          ]),
        ]}
      />
      <ConhecimentoPage glossario={glossario} artigos={artigos} />
    </>
  );
}
