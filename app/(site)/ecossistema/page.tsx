import type { Metadata } from "next";
import { EcossistemaPage } from "./EcossistemaPage";
import { JsonLd } from "@/components/JsonLd";
import { ecossistemaSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Ecossistema FIGITAL — GRUPO +351",
  description:
    "Visualize como as marcas do Grupo +351 se conectam no ecossistema FIGITAL. Infraestrutura, neurônios e distribuição em rede.",
};

export default function Ecossistema() {
  return (
    <>
      <JsonLd data={ecossistemaSchema()} />
      <EcossistemaPage />
    </>
  );
}
