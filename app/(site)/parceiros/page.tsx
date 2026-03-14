import type { Metadata } from "next";
import { ParceirosPage } from "./ParceirosPage";
import { JsonLd } from "@/components/JsonLd";
import { parceirosSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Portal do Parceiro — GRUPO +351",
  description:
    "Conheça os modelos de Joint Venture do Grupo +351. Estruturas societárias, investimento necessário e oportunidades para operadores e investidores.",
};

export default function Parceiros() {
  return (
    <>
      <JsonLd data={parceirosSchema()} />
      <ParceirosPage />
    </>
  );
}
