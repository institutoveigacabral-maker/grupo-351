import { Hero } from "@/components/Hero";
import { Numeros } from "@/components/Numeros";
import { QuemSomos } from "@/components/QuemSomos";
import { Figital } from "@/components/Figital";
import { Modelo } from "@/components/Modelo";
import { MarqueeBand } from "@/components/MarqueeBand";
import { Negocios } from "@/components/Negocios";
import { ParaQuem } from "@/components/ParaQuem";
import { Visao } from "@/components/Visao";
import { CTA } from "@/components/CTA";
import { Localizacao } from "@/components/Localizacao";
import { FAQ } from "@/components/FAQ";
import { Contato } from "@/components/Contato";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema } from "@/lib/schema";

const faqs = [
  { q: "O que e FIGITAL?", a: "FIGITAL e a arquitetura central do Grupo +351 — a integracao estrutural entre operacoes fisicas, plataformas digitais e software proprietario. Nao e tendencia, e infraestrutura." },
  { q: "O que e uma Joint Venture no +351?", a: "E uma parceria societaria real. A holding entra com marca, metodo, capital e governanca. O operador entra com execucao e know-how. Estruturas variam de 50/50 a 70/30 com vesting." },
  { q: "Preciso ter capital para ser parceiro?", a: "Depende do modelo. Forge and Flow 3D comeca com 5.000 EUR. Purple Party pode chegar a 100.000 EUR. Para operadores sem capital, existem modelos com vesting progressivo." },
  { q: "Como me candidato?", a: "Atraves do formulario estruturado em /aplicar. Sao 5 etapas: perfil pessoal, experiencia, modelo de interesse, proposta e aceite de NDA preliminar. Candidaturas sao analisadas em ate 5 dias uteis." },
  { q: "Voces atuam apenas em Portugal?", a: "Estamos sediados no Estoril, Cascais, mas o ecossistema e global. Sourcing da China, marcas validadas no Brasil, distribuicao europeia." },
  { q: "Como as 7 marcas se conectam?", a: "Cada marca e um no no ecossistema FIGITAL. Sensores captam dados, neuronios processam, distribuicao retroalimenta. Tudo conectado numa arquitetura de rede." },
  { q: "Qual a diferenca entre operador e investidor?", a: "Operador executa o dia-a-dia do negocio e conquista participacao via vesting. Investidor entra com capital e tem retorno passivo. O modelo ambos combina os dois." },
  { q: "O Grupo +351 participa da operacao diaria?", a: "Nao. A operacao e do parceiro. A holding fornece marca, metodo, governanca, conexao com o ecossistema e reuniao de conselho mensal." },
];

export default function Home() {
  return (
    <main>
      <JsonLd data={faqSchema(faqs)} />
      <Hero />
      <Numeros />
      <QuemSomos />
      <Figital />
      <Modelo />
      <MarqueeBand />
      <Negocios />
      <ParaQuem />
      <Visao />
      <CTA />
      <Localizacao />
      <FAQ />
      <Contato />
    </main>
  );
}
