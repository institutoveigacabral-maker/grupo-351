import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtigos, getArtigoBySlug } from "@/lib/conhecimento";
import { ArtigoPage } from "./ArtigoPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

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
  };
}

export default async function ArtigoRoute({ params }: Props) {
  const { slug } = await params;
  const artigo = await getArtigoBySlug(slug);
  if (!artigo) notFound();
  const allArtigos = await getArtigos();
  return <ArtigoPage artigo={artigo} allArtigos={allArtigos} />;
}
