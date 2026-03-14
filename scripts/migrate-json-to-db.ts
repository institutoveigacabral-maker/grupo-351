/**
 * Migration script: JSON files → PostgreSQL via Prisma
 *
 * Usage:
 *   INITIAL_ADMIN_PASSWORD=<senha-forte> npx tsx scripts/migrate-json-to-db.ts
 *
 * Requires DATABASE_URL in .env or .env.local
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
// Load env first
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

const DATA_DIR = join(process.cwd(), "data");

function readJSON(filename: string): unknown {
  const path = join(DATA_DIR, filename);
  if (!existsSync(path)) {
    console.warn(`  ⚠ ${filename} not found, skipping`);
    return [];
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

async function main() {
  console.log("🔄 Starting migration...\n");

  // Required for Node.js — Neon serverless needs WebSocket
  neonConfig.webSocketConstructor = ws;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL env var required");
    process.exit(1);
  }
  console.log(`  Using database: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`);

  const adapter = new PrismaNeon({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter } as never);

  // 1. Admin user
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("❌ INITIAL_ADMIN_PASSWORD env var required");
    process.exit(1);
  }

  console.log("1/7 Creating admin user...");
  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: "henriquelemos10@msn.com" },
    update: { senhaHash: hash },
    create: {
      email: "henriquelemos10@msn.com",
      nome: "Henrique Lemos",
      senhaHash: hash,
    },
  });
  console.log("  ✓ Admin user created/updated");

  // 2. Candidaturas
  console.log("2/7 Migrating candidaturas...");
  const candidaturas = readJSON("candidaturas.json") as Record<string, unknown>[];
  let count = 0;
  for (const c of candidaturas) {
    try {
      await prisma.candidatura.upsert({
        where: { id: c.id as string },
        update: {},
        create: {
          id: c.id as string,
          criadoEm: new Date(c.criadoEm as string),
          status: (c.status as string) || "nova",
          nome: c.nome as string,
          email: c.email as string,
          telefone: c.telefone as string,
          pais: c.pais as string,
          cidade: c.cidade as string,
          perfil: c.perfil as string,
          experiencia: c.experiencia as string,
          setor: c.setor as string,
          empresaAtual: (c.empresaAtual as string) || null,
          linkedin: (c.linkedin as string) || null,
          modelo: (c.modelo as string[]) || [],
          capitalDisponivel: c.capitalDisponivel as string,
          prazo: c.prazo as string,
          dedicacao: c.dedicacao as string,
          motivacao: c.motivacao as string,
          diferenciais: c.diferenciais as string,
          disponibilidade: (c.disponibilidade as string) || null,
          aceitaNDA: (c.aceitaNDA as boolean) || false,
          notas: (c.notas as string) || null,
          atribuidoA: (c.atribuidoA as string) || null,
        },
      });
      count++;
    } catch (err) {
      console.error(`  ✗ Failed to migrate candidatura ${c.id}:`, err);
    }
  }
  console.log(`  ✓ ${count}/${candidaturas.length} candidaturas migrated`);

  // 3. Contatos
  console.log("3/7 Migrating contatos...");
  const contatos = readJSON("contatos.json") as Record<string, unknown>[];
  count = 0;
  for (const c of contatos) {
    try {
      await prisma.contato.upsert({
        where: { id: c.id as string },
        update: {},
        create: {
          id: c.id as string,
          criadoEm: new Date(c.criadoEm as string),
          lido: (c.lido as boolean) || false,
          arquivado: (c.arquivado as boolean) || false,
          nome: c.nome as string,
          email: c.email as string,
          empresa: (c.empresa as string) || null,
          tipo: c.tipo as string,
          orcamento: (c.orcamento as string) || null,
          mensagem: c.mensagem as string,
          notas: (c.notas as string) || null,
        },
      });
      count++;
    } catch (err) {
      console.error(`  ✗ Failed to migrate contato ${c.id}:`, err);
    }
  }
  console.log(`  ✓ ${count}/${contatos.length} contatos migrated`);

  // 4. Projetos
  console.log("4/7 Migrating projetos...");
  const projetos = readJSON("projetos.json") as Record<string, unknown>[];
  count = 0;
  for (const p of projetos) {
    try {
      await prisma.projeto.upsert({
        where: { slug: p.slug as string },
        update: {},
        create: {
          slug: p.slug as string,
          name: p.name as string,
          tagline: (p.tagline as string) || "",
          description: (p.description as string) || "",
          detalhes: (p.detalhes as string[]) || [],
          tag: (p.tag as string) || "",
          status: (p.status as string) || "Em estruturação",
          mercado: (p.mercado as string) || "",
          parceiro: (p.parceiro as string) || null,
          controle: (p.controle as string) || "",
          icon: (p.icon as string) || "Building",
          notasInternas: (p.notasInternas as string) || null,
          ultimaAtualizacao: p.ultimaAtualizacao
            ? new Date(p.ultimaAtualizacao as string)
            : null,
        },
      });
      count++;
    } catch (err) {
      console.error(`  ✗ Failed to migrate projeto ${p.slug}:`, err);
    }
  }
  console.log(`  ✓ ${count}/${projetos.length} projetos migrated`);

  // 5. Glossario
  console.log("5/7 Migrating glossario...");
  const glossario = readJSON("glossario.json") as Record<string, unknown>[];
  count = 0;
  for (const t of glossario) {
    try {
      await prisma.termo.upsert({
        where: { slug: t.slug as string },
        update: {},
        create: {
          slug: t.slug as string,
          termo: t.termo as string,
          definicao: t.definicao as string,
          categoria: t.categoria as string,
        },
      });
      count++;
    } catch (err) {
      console.error(`  ✗ Failed to migrate termo ${t.slug}:`, err);
    }
  }
  console.log(`  ✓ ${count}/${glossario.length} termos migrated`);

  // 6. Artigos
  console.log("6/7 Migrating artigos...");
  const artigos = readJSON("artigos.json") as Record<string, unknown>[];
  count = 0;
  for (const a of artigos) {
    try {
      await prisma.artigo.upsert({
        where: { slug: a.slug as string },
        update: {},
        create: {
          slug: a.slug as string,
          titulo: a.titulo as string,
          resumo: (a.resumo as string) || "",
          conteudo: (a.conteudo as string[]) || [],
          categoria: (a.categoria as string) || "guia",
          destaque: (a.destaque as boolean) || false,
        },
      });
      count++;
    } catch (err) {
      console.error(`  ✗ Failed to migrate artigo ${a.slug}:`, err);
    }
  }
  console.log(`  ✓ ${count}/${artigos.length} artigos migrated`);

  // 7. Reunioes datasets (as JSONB)
  console.log("7/7 Migrating reunioes datasets...");
  const datasets = [
    { file: "reunioes.json", tipo: "reunioes" },
    { file: "reunioes-kanban.json", tipo: "kanban" },
    { file: "reunioes-roadmaps.json", tipo: "roadmaps" },
    { file: "reunioes-analise.json", tipo: "analise" },
  ];
  for (const { file, tipo } of datasets) {
    try {
      const data = readJSON(file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsonData = data as any;
      await prisma.reuniaoDataset.upsert({
        where: { tipo },
        update: { data: jsonData },
        create: { tipo, data: jsonData },
      });
      console.log(`  ✓ ${tipo} dataset migrated`);
    } catch (err) {
      console.error(`  ✗ Failed to migrate ${tipo}:`, err);
    }
  }

  console.log("\n✅ Migration complete!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
