# Grupo +351

Plataforma multi-sided do Grupo +351 para operações em Portugal. Inclui site público, portal de clientes, plataforma administrativa, sistema de reuniões, integração com IA (Gemini/Anthropic), CRM e pagamentos via Stripe.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Prisma ORM + Neon (PostgreSQL serverless)
- NextAuth.js (autenticação)
- Google Gemini / Anthropic Claude (IA)
- Stripe (pagamentos)
- Sentry (observabilidade)
- Tailwind CSS + Framer Motion
- Resend (e-mail transacional)

## Como rodar

```bash
git clone https://github.com/institutoveigacabral-maker/grupo-351.git
cd grupo-351
npm install
npx prisma generate
npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL (Neon) |
| `ADMIN_SECRET` | Chave secreta HMAC para admin |
| `GOOGLE_API_KEY` | Chave do Google Gemini (opcional) |
| `ANTHROPIC_API_KEY` | Chave da Anthropic (opcional) |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe |
| `RESEND_API_KEY` | Chave do Resend (e-mail) |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do Sentry (opcional) |

Veja `.env.example` para a lista completa.

## Estrutura

```
app/
├── (site)/       # Site público
├── (portal)/     # Portal de clientes
├── (platform)/   # Plataforma interna
├── admin/        # Painel administrativo
├── api/          # API routes
└── reunioes/     # Sistema de reuniões
prisma/           # Schema do banco de dados
```
