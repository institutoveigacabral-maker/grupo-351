import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjetos, getProjetoBySlug } from "@/lib/projetos";
import { ProjetoPage } from "./ProjetoPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const projetos = await getProjetos();
  return projetos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const projeto = await getProjetoBySlug(slug);
  if (!projeto) return {};
  return {
    title: `${projeto.name} — GRUPO +351`,
    description: projeto.description,
  };
}

export default async function ProjetoPageRoute({ params }: Props) {
  const { slug } = await params;
  const projeto = await getProjetoBySlug(slug);
  if (!projeto) notFound();

  return <ProjetoPage projeto={projeto} />;
}
