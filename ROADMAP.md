# ROADMAP DE DESENVOLVIMENTO — GRUPO +351

**Baseado em:** Relatorio de Auditoria de 14/03/2026
**Nota inicial:** 7.0/10 | **Meta:** 9.0/10
**Status:** Todos os roadmaps concluidos (16/03/2026)

---

## FASE 1 — CORRECOES CRITICAS (Concluida)

| # | Item | Status |
|---|------|--------|
| C1 | Padronizar contadores (200+ unidades) entre homepage e /sobre | Feito |
| C2 | Padronizar nome "Forge and Flow 3D" em todo o site | Feito |
| C3 | Remover WhatsApp placeholder — botao so aparece se env configurado | Feito |

---

## FASE 2 — ALTA PRIORIDADE (Concluida)

| # | Item | Status |
|---|------|--------|
| A2 | Corrigir acentuacao em todas as paginas publicas | Feito |
| A3 | Atualizar bio do Henrique Lemos com dados publicos verificados | Feito |
| A4 | Corrigir range investimento Barbearia do Rao (10k-30k EUR) | Feito |
| M4 | Remover link Admin do menu publico | Feito |
| M5 | Padronizar localizacao para "Cascais, Portugal" | Feito |
| B1 | Adicionar og:image, og:url e twitter:image ao layout metadata | Feito |
| B2 | Criar favicon SVG customizado com logo +351 | Feito |

---

## FASE 3 — MEDIA PRIORIDADE (Concluida)

| # | Item | Status |
|---|------|--------|
| M1 | Ecossistema: suporte touch/mobile | Feito |
| M2 | Completar conteudo dos 4 artigos em /conhecimento | Feito |
| M3 | Unificar formulario de contato homepage + /contato | Feito |
| B3 | Revisar animacao typewriter | Feito |
| B4 | Verificar redirect /admin → /admin/login | Verificado OK |
| -- | OG image 1200x630 via opengraph-image.tsx (edge runtime) | Feito |

---

## FASE 4 — CREDIBILIDADE E CONVERSAO (Concluida)

| # | Item | Status |
|---|------|--------|
| B5 | Secao de prova social na homepage (metricas + depoimentos) | Feito |
| -- | Links de press (InfoMoney, Exame, Guelt) + selo ABF | Feito |
| -- | Pagina /imprensa com cobertura mediatica verificavel | Feito |
| -- | Fotos reais dos fundadores | Pendente (aguarda fotos) |
| -- | Acentuacao corrigida na SobrePage | Feito |

---

## FASE 5 — EVOLUCAO DO PRODUTO (Parcial)

| # | Item | Status |
|---|------|--------|
| -- | Dominio customizado grupo351.com | Pendente (config DNS/Vercel) |
| -- | Configurar NEXT_PUBLIC_WHATSAPP_NUMBER | Pendente (config Vercel) |
| -- | Analytics Umami (RGPD compliant) | Feito |
| -- | Email transacional Resend | Feito |
| -- | Internacionalizacao (i18n): PT-PT + EN | Pendente |
| -- | Blog/conteudo dinamico | Pendente |
| -- | Dashboard de metricas publicas /metricas | Feito |

---

## FASE 6 — ESCALA E AUTOMACAO (Concluida)

| # | Item | Status |
|---|------|--------|
| -- | Pipeline automatico: scoring 0-100, tiers A/B/C/D, flags inteligentes | Feito |
| -- | NDA digital: 9 clausulas juridicas, registro IP/timestamp/user-agent | Feito |
| -- | Portal do parceiro /parceiro?token=xxx | Feito |
| -- | Admin /admin/parceiros: criar parceiros, gerar tokens | Feito |
| -- | CRM HubSpot + Pipedrive: sync contatos e deals | Feito |
| -- | PWA: manifest, service worker, icones dinamicos, cache offline | Feito |

---

## ROADMAP ENTERPRISE (8 Sprints — Concluido)

### Sprint 1-5 — Core Platform (Concluido)

- Plataforma multi-role (user, admin, parceiro)
- Auth HMAC-SHA256 com cookies + Google OAuth
- Prisma/Neon com Redis cache (@upstash/redis)
- Stripe billing (3 planos: starter, pro, enterprise)
- Matches + mensagens + SSE streaming
- API publica v1 com rate limiting + API keys
- Admin dashboard completo (stats, analytics, audit, AI)

### Sprint 6 — Advanced Components (Concluido)

| Item | Arquivo |
|------|---------|
| Toast system (sonner) | `components/ui/toast.tsx` |
| Command palette (Cmd+K) | `components/ui/command-palette.tsx` |
| DataTable sortable/filterable | `components/ui/data-table.tsx` |
| File upload drag-and-drop | `components/ui/file-upload.tsx` |
| Page transitions (framer-motion) | `components/ui/page-transition.tsx` |
| Dropdown menu | `components/ui/dropdown.tsx` |
| Providers com QueryClient + Toaster + CommandPalette | `components/Providers.tsx` |

### Sprint 7 — Observability & Monitoring (Concluido)

| Item | Arquivo |
|------|---------|
| Request ID (UUID) em todas as respostas | `middleware.ts` |
| Sentry nos error.tsx (app + dashboard) | `app/error.tsx`, `app/(platform)/dashboard/error.tsx` |
| Sentry user context automatico | `lib/auth.ts` (getUserSession) |
| Health check com DB + Redis + memoria | `app/api/health/route.ts` |
| Logger estruturado em 9 catch blocks (lib/db.ts) | `lib/db.ts` |
| Logger em cache failures (lib/cache.ts) | `lib/cache.ts` |
| Logger em audit failures | `lib/audit.ts` |
| Logger em notification failures | `lib/user-notifications.ts` |

### Sprint 8 — Polish & Security Hardening (Concluido)

| Item | Arquivo |
|------|---------|
| Structured logger (info/warn/error) | `lib/logger.ts` |
| Content-Security-Policy completa | `next.config.ts` |
| Deprecation de token legado 4-part | `lib/auth.ts` |
| Remocao de `as unknown as` casts | `lib/conhecimento.ts`, `lib/db.ts` |
| Scripts: typecheck, test, audit:deps | `package.json` |
| 308 testes passando (30 suites) | `tests/` |

---

## ROADMAP PERFORMANCE (5 Sprints — Concluido)

### Sprint 1 — Streaming & Loading States (Concluido)

| Item | Detalhe |
|------|---------|
| loading.tsx para rotas criticas | 8+ loading.tsx com Skeleton (dashboard, portfolio, empresas, oportunidades, conhecimento, aplicar, verificacao) |
| ISR nas paginas publicas | 8 paginas com `revalidate` (300s a 86400s) |
| Preconnect hints | fonts.googleapis.com, fonts.gstatic.com, Neon, Stripe |
| prefers-reduced-motion | CSS media query em globals.css |

### Sprint 2 — Server-Side Dashboard Layout (Ja Existia)

| Item | Detalhe |
|------|---------|
| Dashboard layout server-side | Layout server + DashboardShell client |
| Cache /api/platform/me | Redis TTL 300s |
| Cache /api/platform/notifications | Redis TTL 60s + invalidacao |
| Notification polling inteligente | 60s + visibilitychange pause |

### Sprint 3 — Bundle Optimization (Concluido)

| Item | Detalhe |
|------|---------|
| Dynamic import recharts | `app/admin/analytics/AnalyticsCharts.tsx` (lazy) |
| next/image em todo admin | Ja usava next/image |
| Image config | AVIF/WebP, deviceSizes, remotePatterns |
| Bundle analyzer | @next/bundle-analyzer + script `analyze` |

### Sprint 4 — Database & API Performance (Concluido)

| Item | Detalhe |
|------|---------|
| Prisma query logging (>500ms) | `lib/prisma.ts` com event logging em dev |
| `cached()` em 7 GET routes | opportunities (120s), companies (120s), companies/[slug] (300s), reviews (120s), analytics (600s), api-keys (300s), billing/invoices (600s) |
| `invalidate()` em 8 mutations | opportunities POST/PUT/DELETE, companies POST/PATCH, reviews POST, api-keys POST/DELETE, team/[id] DELETE/PATCH |
| CACHE_KEYS tipados | 14 keys em `lib/cache.ts` |

### Sprint 5 — Headers, Compression & Monitoring (Concluido)

| Item | Detalhe |
|------|---------|
| Cache-Control static assets | `_next/static` + `fonts` (immutable 1y) + `_next/image` (SWR 7d) |
| SWR headers para ISR | portfolio, empresas, oportunidades, conhecimento, aplicar |
| Web Vitals reporting | `components/WebVitals.tsx` + `/api/vitals` endpoint |
| Vercel Speed Insights | @vercel/speed-insights no layout |

---

## STACK TECNICO

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.1.6, React 19, TypeScript strict |
| Styling | Tailwind CSS 4 |
| Database | Prisma 7.5 + PostgreSQL (Neon) |
| Cache | @upstash/redis (distributed) |
| Auth | HMAC-SHA256 cookies + Google OAuth |
| Billing | Stripe (3 planos) |
| Monitoring | Sentry (server + client + edge), Web Vitals, Vercel Speed Insights |
| Analytics | Umami (RGPD compliant) |
| Email | Resend |
| UI | cmdk, sonner, framer-motion, recharts (lazy) |
| Data Fetching | TanStack React Query 5.90 |
| i18n | next-intl |
| Testing | Vitest (308 testes, 30 suites) |
| Bundle | @next/bundle-analyzer |
| PWA | Service worker + manifest + cache offline |

---

## METRICAS

| Metrica | Antes | Depois |
|---------|-------|--------|
| Build | OK | OK (0 erros) |
| Testes | 0 | 308 passando |
| ISR pages | 0 | 8 paginas |
| loading.tsx | 0 | 8+ streaming |
| Cached API routes | 7 | 14 |
| Cache invalidation | 5 | 13 mutations |
| Silent catch blocks | 28+ | 0 |
| Security headers | 2 | 7 (HSTS, CSP, X-Frame, etc.) |
| Sentry coverage | global-error only | global + app + dashboard + user context |

---

## CONFIGURACAO PENDENTE (Vercel/DNS)

| Item | Variavel de ambiente |
|------|---------------------|
| Dominio | Config DNS grupo351.com → Vercel |
| WhatsApp | `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Analytics | `NEXT_PUBLIC_UMAMI_WEBSITE_ID` |
| Email | `RESEND_API_KEY` + `RESEND_FROM_EMAIL` + `ADMIN_NOTIFICATION_EMAIL` |
| CRM | `CRM_PROVIDER` + `HUBSPOT_API_KEY` ou `PIPEDRIVE_API_TOKEN` |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` |
| Redis | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` |

---

*Ultima atualizacao: 16 de marco de 2026*
