import type { Metadata } from "next";
import { getProjetos } from "@/lib/projetos";
import { AplicarPage } from "./AplicarPage";
import { JsonLd } from "@/components/JsonLd";
import { aplicarSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Aplicar — GRUPO +351",
  description:
    "Candidate-se a uma Joint Venture com o Grupo +351. Formulário estruturado para operadores, investidores e parceiros estratégicos.",
};

export const revalidate = 3600; // ISR: 1 hora

export default async function Aplicar() {
  const projetos = await getProjetos();
  const modelos = projetos.map((p) => ({
    value: p.slug,
    label: p.name,
    tag: p.tag,
  }));
  return (
    <>
      <JsonLd data={aplicarSchema()} />
      <AplicarPage modelos={modelos} />
    </>
  );
}
