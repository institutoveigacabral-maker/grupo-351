import type { Metadata } from "next";
import { SobrePage } from "./SobrePage";
import { JsonLd } from "@/components/JsonLd";
import { sobreSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Sobre — GRUPO +351",
  description:
    "Conheça os fundadores do Grupo +351: Henrique Lemos, Fernando Vieira e Herson Rosa. Empreendedores brasileiros construindo negócios em Portugal.",
};

export default function Sobre() {
  return (
    <>
      <JsonLd data={sobreSchema()} />
      <SobrePage />
    </>
  );
}
