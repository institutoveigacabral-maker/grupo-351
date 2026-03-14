import { z } from "zod";

export const candidaturaCreateSchema = z.object({
  tipo: z.literal("aplicacao-jv"),
  nome: z.string().min(2).max(200),
  email: z.string().email(),
  telefone: z.string().min(5).max(30),
  pais: z.string().min(2),
  cidade: z.string().min(2),
  perfil: z.enum(["operador", "investidor", "ambos"]),
  experiencia: z.string().min(10).max(5000),
  setor: z.string().min(2),
  empresaAtual: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  modelo: z.array(z.string()).default([]),
  capitalDisponivel: z.string(),
  prazo: z.string(),
  dedicacao: z.string(),
  motivacao: z.string().min(10).max(5000),
  diferenciais: z.string().min(10).max(5000),
  disponibilidade: z.string().optional(),
  aceitaNDA: z.boolean(),
});

export const contatoCreateSchema = z.object({
  nome: z.string().min(2).max(200),
  email: z.string().email(),
  empresa: z.string().optional(),
  tipo: z.string().min(2),
  orcamento: z.string().optional(),
  mensagem: z.string().min(5).max(10000),
});

export const candidaturaUpdateSchema = z.object({
  status: z.enum(["nova", "em-analise", "entrevista", "aprovada", "recusada", "arquivada"]).optional(),
  notas: z.string().max(10000).optional(),
  atribuidoA: z.string().max(200).optional(),
});

export const contatoUpdateSchema = z.object({
  lido: z.boolean().optional(),
  arquivado: z.boolean().optional(),
  notas: z.string().max(10000).optional(),
});

export const projetoSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(200),
  tagline: z.string().max(500),
  description: z.string().max(10000),
  detalhes: z.array(z.string()),
  tag: z.string(),
  status: z.enum(["Em operação", "Em desenvolvimento", "Em estruturação"]),
  mercado: z.string(),
  parceiro: z.string().optional(),
  controle: z.string(),
  icon: z.string(),
  notasInternas: z.string().optional(),
});

export const termoSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  termo: z.string().min(2).max(200),
  definicao: z.string().max(10000),
  categoria: z.enum(["conceito", "marca", "modelo", "metrica"]),
});

export const artigoSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  titulo: z.string().min(2).max(300),
  resumo: z.string().max(2000),
  conteudo: z.array(z.string()),
  categoria: z.enum(["tese", "modelo", "case", "guia"]),
  destaque: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export const aiMessagesSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(50000),
  })).min(1),
});
