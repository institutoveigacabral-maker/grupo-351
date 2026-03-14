import type { Metadata } from "next";
import { ContatoPage } from "./ContatoPage";
import { JsonLd } from "@/components/JsonLd";
import { contatoSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contato — GRUPO +351",
  description:
    "Entre em contato com o Grupo +351. Proponha uma joint venture, parceria estratégica ou conheça nossas oportunidades em Portugal.",
};

export default function Contato() {
  return (
    <>
      <JsonLd data={contatoSchema()} />
      <ContatoPage />
    </>
  );
}
