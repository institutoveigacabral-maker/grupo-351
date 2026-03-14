import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjetos, getProjetoBySlug } from "@/lib/projetos";
import { ProjetoPage } from "./ProjetoPage";
import { JsonLd } from "@/components/JsonLd";
import { projetoSchema } from "@/lib/schema";

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
    openGraph: {
      title: `${projeto.name} — GRUPO +351`,
      description: projeto.tagline || projeto.description,
      type: "website",
    },
  };
}

export default async function ProjetoPageRoute({ params }: Props) {
  const { slug } = await params;
  const projeto = await getProjetoBySlug(slug);
  if (!projeto) notFound();

  return (
    <>
      <JsonLd data={projetoSchema(projeto)} />
      <ProjetoPage projeto={projeto} />
    </>
  );
}
