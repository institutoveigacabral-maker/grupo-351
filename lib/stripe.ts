/**
 * Integração Stripe — assinaturas e pagamentos.
 *
 * Configuração via .env:
 *   STRIPE_SECRET_KEY=sk_xxx
 *   STRIPE_WEBHOOK_SECRET=whsec_xxx
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
 *
 * Planos:
 *   free      — 0 EUR/mês (1 oportunidade, sem matches IA)
 *   growth    — 49 EUR/mês (10 oportunidades, matches IA, analytics)
 *   enterprise — 199 EUR/mês (ilimitado, API, suporte prioritário)
 */

import Stripe from "stripe";
import { prisma } from "./prisma";

function getStripe(): Stripe {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada");
  return new Stripe(stripeKey, {
    maxNetworkRetries: 1,
    timeout: 10000,
  });
}

// ─── Planos ───

export interface PlanConfig {
  id: string;
  nome: string;
  preco: number; // centavos EUR
  intervalo: "month";
  features: string[];
  limites: {
    oportunidades: number;
    matchesIA: boolean;
    apiAccess: boolean;
    membros: number;
  };
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: "free",
    nome: "Básico",
    preco: 0,
    intervalo: "month",
    features: [
      "1 oportunidade ativa",
      "Perfil na plataforma",
      "Matches por heurística",
      "Chat com matches",
    ],
    limites: { oportunidades: 1, matchesIA: false, apiAccess: false, membros: 1 },
  },
  growth: {
    id: "growth",
    nome: "Growth",
    preco: 4900, // 49 EUR
    intervalo: "month",
    features: [
      "10 oportunidades ativas",
      "Matches com IA",
      "Analytics avançado",
      "Destaque no marketplace",
      "Até 5 membros",
    ],
    limites: { oportunidades: 10, matchesIA: true, apiAccess: false, membros: 5 },
  },
  enterprise: {
    id: "enterprise",
    nome: "Enterprise",
    preco: 19900, // 199 EUR
    intervalo: "month",
    features: [
      "Oportunidades ilimitadas",
      "Matches com IA prioritário",
      "Analytics completo",
      "Acesso à API",
      "Membros ilimitados",
      "Suporte prioritário",
    ],
    limites: { oportunidades: -1, matchesIA: true, apiAccess: true, membros: -1 },
  },
};

// ─── Checkout ───

export async function createCheckoutSession(
  companyId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const stripe = getStripe();
  const plan = PLANS[planId];
  if (!plan || plan.preco === 0) throw new Error("Plano inválido para checkout");

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { owner: { select: { email: true } }, subscription: true },
  });
  if (!company) throw new Error("Empresa não encontrada");

  // Reutilizar customer se existir
  let customerId = company.subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: company.owner.email,
      metadata: { companyId, companyName: company.nome },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: `Grupo +351 — Plano ${plan.nome}` },
          recurring: { interval: plan.intervalo },
          unit_amount: plan.preco,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { companyId, planId },
  });

  if (!session.url) throw new Error("Stripe não retornou URL de checkout");
  return session.url;
}

// ─── Portal de Billing ───

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return session.url;
}

// ─── Webhook handler ───

export async function handleWebhookEvent(
  body: string,
  signature: string
): Promise<void> {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET não configurada");

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { companyId, planId } = session.metadata || {};
      if (!companyId || !planId) break;

      await prisma.subscription.upsert({
        where: { companyId },
        create: {
          companyId,
          plano: planId,
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
        update: {
          plano: planId,
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });

      await prisma.payment.create({
        data: {
          amount: session.amount_total || 0,
          currency: session.currency || "eur",
          status: "succeeded",
          tipo: "subscription",
          descricao: `Plano ${planId}`,
          stripePaymentId: session.payment_intent as string,
          companyId,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (existing) {
        // Stripe v20 removed current_period_end from types; use cancel_at or billing_cycle_anchor
        const periodEnd = sub.cancel_at
          ? new Date(sub.cancel_at * 1000)
          : null;

        await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: ["active", "trialing"].includes(sub.status) ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
            ...(periodEnd && { currentPeriodEnd: periodEnd }),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: { status: "canceled", plano: "free" },
        });
      }
      break;
    }
  }
}

// ─── Helpers ───

export async function getCompanyPlan(companyId: string): Promise<PlanConfig> {
  const sub = await prisma.subscription.findUnique({ where: { companyId } });
  if (!sub || sub.status !== "active") return PLANS.free;
  return PLANS[sub.plano] || PLANS.free;
}

export function canUseFeature(plan: PlanConfig, feature: "matchesIA" | "apiAccess"): boolean {
  return plan.limites[feature];
}

export function getOpportunityLimit(plan: PlanConfig): number {
  return plan.limites.oportunidades;
}
