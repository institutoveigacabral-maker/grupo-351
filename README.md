# GRUPO +351

![CI](https://github.com/institutoveigacabral-maker/grupo-351/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Tests](https://img.shields.io/badge/tests-308%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

Hub de negocios e joint ventures sediado em Cascais, Portugal. Plataforma multi-sided que conecta empresas, parceiros estrategicos e oportunidades reais de mercado, combinando IA, CRM e pagamentos num unico ecossistema digital.

**Producao:** [https://grupo351.com](https://grupo351.com)

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Next.js 16.1.6 + React 19 + TypeScript strict |
| **Database** | PostgreSQL serverless (Neon) + Prisma 7.5 |
| **Auth** | HMAC-SHA256 cookies + Google OAuth |
| **Cache** | Upstash Redis (14 cache keys, invalidacao automatica) |
| **IA** | Google Gemini + Anthropic Claude (matching, copilot, analise) |
| **Pagamentos** | Stripe (3 planos: starter, pro, enterprise) |
| **E-mail** | Resend (transacional) |
| **Monitoring** | Sentry (client + server + edge), Web Vitals, Vercel Speed Insights |
| **Analytics** | Umami (RGPD compliant, sem cookies) |
| **UI** | Tailwind CSS 4, Framer Motion, cmdk, sonner, recharts |
| **Data Fetching** | TanStack React Query 5.90 |
| **i18n** | next-intl (PT-PT, PT-BR, EN, ES) |
| **Testes** | Vitest (308 testes, 30 suites) |
| **Validacao** | Zod |
| **Bundle** | @next/bundle-analyzer, dynamic imports |
| **PWA** | Service worker + manifest + cache offline |

## Funcionalidades

### Plataforma
- **Site publico** com SEO, Open Graph, JSON-LD, sitemap, ISR e PWA
- **Plataforma multi-sided** para empresas: perfil, oportunidades, matches por IA, mensagens em tempo real (SSE), projetos colaborativos e reviews
- **Painel administrativo** completo: CRM, candidaturas, portfolio, financeiro, glossario, artigos, auditoria e notificacoes
- **Portal de parceiros** com acesso via token e metricas dedicadas
- **Sistema de reunioes** com hub, kanban, analise por pessoa e roadmaps

### Enterprise
- **Matching inteligente** com score 0-100 gerado por IA e sugestoes automaticas
- **Convites de equipe** com links tokenizados e expiracoes
- **Assinaturas e billing** via Stripe com webhooks e portal de gestao
- **API publica v1** com autenticacao por API key e scopes granulares
- **Rate limiting** distribuido (Redis) e RBAC por role
- **Privacidade:** exportacao e exclusao de dados (RGPD)

### UI Components
- Command palette (Cmd+K) com busca global
- Toast notifications (sonner)
- DataTable sortable/filterable com paginacao
- File upload drag-and-drop com validacao
- Page transitions (framer-motion)
- Streaming loading states (8+ loading.tsx)

### Performance
- ISR em 8 paginas publicas (300s a 86400s)
- Redis cache em 14 API routes com invalidacao automatica
- SWR headers para CDN caching
- Dynamic imports (recharts lazy loaded)
- Prisma slow query logging (>500ms)

### Observabilidade
- Sentry em error boundaries (app + dashboard + global)
- Sentry user context automatico via auth
- Request ID (UUID) em todas as respostas
- Structured logger com niveis (info/warn/error)
- Health check com DB + Redis + memoria (`/api/health`)
- Web Vitals reporting (`/api/vitals`)
- Security headers completos (HSTS, CSP, X-Frame, etc.)

## Getting Started

### Pre-requisitos

- Node.js 20+
- pnpm
- Conta no [Neon](https://neon.tech) (PostgreSQL)
- Chaves de API: Stripe, Resend (opcionais: Google Gemini, Anthropic, Sentry, Upstash)

### Instalacao

```bash
git clone https://github.com/institutoveigacabral-maker/grupo-351.git
cd grupo-351
pnpm install
```

### Variaveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variavel | Descricao |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL (Neon) |
| `ADMIN_SECRET` | Chave secreta HMAC para autenticacao admin |
| `GOOGLE_API_KEY` | Chave do Google Gemini |
| `ANTHROPIC_API_KEY` | Chave da Anthropic Claude |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave publica Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe |
| `RESEND_API_KEY` | Chave do Resend |
| `UPSTASH_REDIS_REST_URL` | URL do Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Token do Upstash Redis |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do Sentry |

Consulte `.env.example` para a lista completa.

### Banco de Dados

```bash
pnpm db:generate
pnpm db:push
```

### Executar

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Referencia de API

### Rotas Publicas

| Rota | Descricao |
|------|-----------|
| `GET /api/health` | Health check |
| `POST /api/contato` | Formulario de contato |
| `POST /api/nda` | Assinatura de NDA |
| `GET /api/parceiro` | Acesso do parceiro via token |
| `GET /api/metricas` | Metricas publicas |

### API v1 (autenticada por API key)

| Rota | Descricao |
|------|-----------|
| `GET /api/v1/companies` | Listar empresas |
| `GET /api/v1/opportunities` | Listar oportunidades |

### Plataforma (autenticada por sessao)

| Rota | Descricao |
|------|-----------|
| `GET /api/platform/me` | Perfil do usuario |
| `GET/POST /api/platform/opportunities` | CRUD de oportunidades |
| `GET /api/platform/opportunities/copilot` | Copilot IA para oportunidades |
| `GET/POST /api/platform/messages` | Mensagens entre matches |
| `GET /api/platform/messages/stream` | Stream de mensagens (real-time) |
| `GET/POST /api/platform/team` | Gestao de equipe |
| `POST /api/platform/team/invite` | Convite de membro |
| `GET /api/platform/notifications` | Notificacoes do usuario |
| `GET /api/platform/projects` | Projetos colaborativos |
| `GET /api/platform/reviews` | Reviews entre parceiros |
| `GET /api/platform/search` | Busca na plataforma |
| `POST /api/platform/verification` | Verificacao de empresa |
| `POST /api/platform/privacy/export` | Exportar dados pessoais |
| `DELETE /api/platform/privacy/delete` | Excluir conta e dados |

### Admin (autenticada por HMAC)

| Rota | Descricao |
|------|-----------|
| `POST /api/admin/login` | Login administrativo |
| `POST /api/admin/logout` | Logout administrativo |
| `GET /api/admin/stats` | Dashboard de estatisticas |
| `GET /api/admin/analytics` | Analytics detalhado |
| `GET/POST /api/admin/candidaturas` | Gestao de candidaturas |
| `GET/POST /api/admin/companies` | Gestao de empresas |
| `GET/POST /api/admin/contatos` | Gestao de contatos (CRM) |
| `GET/POST /api/admin/parceiros` | Gestao de parceiros |
| `GET/POST /api/admin/artigos` | Gestao de artigos |
| `GET/POST /api/admin/glossario` | Glossario de termos |
| `GET/POST /api/admin/portfolio` | Portfolio de projetos |
| `GET /api/admin/financeiro` | Painel financeiro |
| `GET /api/admin/auditoria` | Log de auditoria |
| `GET/POST /api/admin/matches` | Gestao de matches |
| `GET /api/admin/notifications` | Notificacoes admin |
| `GET/POST /api/admin/users` | Gestao de usuarios |
| `GET/POST /api/admin/settings` | Configuracoes da plataforma |
| `GET/POST /api/admin/subscriptions` | Gestao de assinaturas |
| `POST /api/admin/ai` | Assistente IA administrativo |
| `GET /api/admin/team` | Equipe admin |

### Reunioes

| Rota | Descricao |
|------|-----------|
| `GET /api/reunioes` | Lista de reunioes |
| `GET /api/reunioes/hub` | Hub de reunioes |
| `GET /api/reunioes/kanban` | Vista kanban |
| `GET /api/reunioes/analise` | Analise de reunioes |
| `GET /api/reunioes/pessoa` | Reunioes por pessoa |
| `GET /api/reunioes/roadmaps` | Roadmaps |

### Webhooks

| Rota | Descricao |
|------|-----------|
| `POST /api/webhooks/stripe` | Webhook do Stripe |

## Scripts

| Comando | Descricao |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Gera o Prisma Client e faz o build de producao |
| `pnpm start` | Inicia o servidor de producao |
| `pnpm lint` | Executa o ESLint |
| `pnpm test` | Executa todos os testes (Vitest) |
| `pnpm test:watch` | Executa testes em modo watch |
| `pnpm typecheck` | Verificacao de tipos TypeScript |
| `pnpm format` | Formata o codigo com Prettier |
| `pnpm format:check` | Verifica formatacao sem alterar |
| `pnpm db:generate` | Gera o Prisma Client |
| `pnpm db:push` | Sincroniza o schema com o banco |
| `pnpm db:studio` | Abre o Prisma Studio (GUI do banco) |
| `pnpm db:migrate` | Executa migracoes JSON para banco |
| `pnpm analyze` | Build com analise de bundle |
| `pnpm audit:deps` | Auditoria de dependencias |

## Testes

```bash
pnpm test
```

308 testes em 30 suites cobrindo: autenticacao, API v1, billing, cache, CRM, e-mail, i18n, matching, middleware, notificacoes, RBAC, rate limiting, scoring, validacoes, logger, security headers e mais.

## Arquitetura

```
grupo-351/
├── app/
│   ├── (site)/          # Site publico (landing, SEO)
│   ├── (portal)/        # Portal de parceiros
│   ├── (platform)/      # Plataforma multi-sided (empresas)
│   ├── admin/           # Painel administrativo
│   ├── api/             # Route handlers (Next.js)
│   ├── convite/         # Paginas de convite
│   ├── docs/            # Documentacao interna
│   └── reunioes/        # Sistema de reunioes
├── components/          # Componentes React reutilizaveis
├── hooks/               # Custom hooks
├── lib/                 # Logica de negocio, integraces, utils
│   ├── ai/              # Integracao com Gemini e Claude
│   └── reunioes/        # Logica de reunioes
├── i18n/                # Configuracao de internacionalizacao
├── messages/            # Traducoes (PT-PT, PT-BR, EN, ES)
├── prisma/              # Schema do banco de dados
├── scripts/             # Scripts de migracao e utilitarios
├── tests/               # Testes unitarios e de integracao
└── public/              # Assets estaticos
```

## Deploy

O projeto esta configurado para deploy na **Vercel** com banco de dados **Neon** (PostgreSQL serverless).

1. Conecte o repositorio a Vercel
2. Configure as variaveis de ambiente no painel da Vercel
3. O build executa `prisma generate && next build` automaticamente
4. Configure o webhook do Stripe apontando para `https://grupo351.com/api/webhooks/stripe`

## Contribuicao

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes de contribuicao, padroes de codigo e fluxo de pull requests.

## Licenca

Este projeto esta licenciado sob a [MIT License](LICENSE).
