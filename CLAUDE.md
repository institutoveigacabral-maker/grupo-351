# CLAUDE.md — GRUPO +351

> Regras globais em `~/.claude/CLAUDE.md`. Contexto do workspace em `../CLAUDE.md`.

---

## O QUE E

Plataforma empresarial do Grupo +351 — operacoes de Henrique em Portugal.
Portfolio de marcas, gestao de franquias, CRM, analytics.

**Status:** Producao. 308 testes.

---

## STACK

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js (latest) + TypeScript |
| Banco | Neon (PostgreSQL) + Prisma |
| IA | Claude SDK + Google Generative AI |
| Auth | NextAuth / middleware customizado |
| UI | Tailwind CSS, Radix UI, React Hook Form |
| i18n | next-intl (messages/) |
| Testes | Vitest |
| Deploy | Vercel |
| Monitor | Sentry (instrumentation.ts) |

---

## PADROES

- ORM: **Prisma** (nao Drizzle — diferente do Cortex FC)
- Build: `prisma generate && next build`
- Migrations: `prisma db push`
- Validacao: Zod + React Hook Form + @hookform/resolvers
- Estrutura: `app/`, `components/`, `lib/`, `hooks/`, `data/`, `messages/`
- Dados locais: `meetings-summary.json`
- API docs: `API.md`
- Roadmap: `ROADMAP.md`
- Contributing: `CONTRIBUTING.md`

---

## O QUE NAO MEXER SEM APROVACAO

- Schema Prisma — producao com dados reais
- Middleware de auth
- Integracao com servicos externos (Stripe, Neon)
- i18n messages (pode quebrar UI em producao)
