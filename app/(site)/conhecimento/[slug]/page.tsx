import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtigos, getArtigoBySlug } from "@/lib/conhecimento";
import { ArtigoPage } from "./ArtigoPage";
import { JsonLd } from "@/components/JsonLd";
import { artigoSchema } from "@/lib/schema";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400; // ISR: 24 horas

export async function generateStaticParams() {
  const artigos = await getArtigos();
  return artigos.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artigo = await getArtigoBySlug(slug);
  if (!artigo) return {};
  return {
    title: `${artigo.titulo} — GRUPO +351`,
    description: artigo.resumo,
    openGraph: {
      title: `${artigo.titulo} — GRUPO +351`,
      description: artigo.resumo,
      type: "article",
    },
  };
}

export default async function ArtigoRoute({ params }: Props) {
  const { slug } = await params;
  const artigo = await getArtigoBySlug(slug);
  if (!artigo) notFound();
  const allArtigos = await getArtigos();
  return (
    <>
      <JsonLd data={artigoSchema(artigo)} />
      <ArtigoPage artigo={artigo} allArtigos={allArtigos} />
    </>
  );
}
