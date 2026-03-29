# Grupo +351

[![CI](https://github.com/hlemos1/grupo-351/actions/workflows/ci.yml/badge.svg)](https://github.com/hlemos1/grupo-351/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![Production](https://img.shields.io/badge/Status-Production-brightgreen?style=flat-square)](https://grupo351.vercel.app)

> Business hub and joint ventures platform for the Portugal market. Manages the complete lifecycle of business partnerships, investments, and ventures across Brazil and Portugal with integrated Stripe billing and Sentry observability.

---

## ✨ Key Features

- **Joint Ventures** — Track and manage business partnerships and co-investment deals
- **Financial Dashboard** — Real-time P&L, revenue tracking, and financial modeling
- **Stripe Billing** — Subscription management and recurring revenue tracking
- **Multi-tenant** — Organization-level isolation with RBAC
- **Redis Cache** — High-performance data layer with Upstash Redis
- **PWA** — Progressive Web App for mobile access
- **Error Tracking** — Sentry for production observability

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript |
| **Database** | PostgreSQL serverless (Neon) + Prisma ORM |
| **Cache** | Upstash Redis |
| **Auth** | NextAuth.js |
| **Payments** | Stripe (subscriptions + webhooks) |
| **Observability** | Sentry |
| **Testing** | Playwright (E2E) + Vitest |
| **CI/CD** | GitHub Actions |
| **Deploy** | Vercel |

---

## 🏗️ Architecture

```
grupo-351/
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # UI components
│   ├── lib/             # Prisma, auth, Stripe, Redis
│   └── modules/
│       ├── ventures/    # Joint venture management
│       ├── financials/  # P&L and revenue tracking
│       └── billing/     # Stripe integration
├── prisma/              # Database schema & migrations
└── .github/workflows/   # CI/CD pipelines
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/hlemos1/grupo-351.git
cd grupo-351
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm dev
```

---

## 🌍 Context

Grupo +351 is a node in the [CORTEX3](https://github.com/hlemos1/hlemos1) ecosystem — a network of interconnected businesses operating as a neural network. The +351 hub coordinates Portuguese market operations and Brazil-Portugal business corridors.

---

## 📄 License

MIT © [Henrique Lemos](https://github.com/hlemos1)
