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

function getStripeKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");
  return key;
}

function getStripe(): Stripe {
  return new Stripe(getStripeKey(), {
    maxNetworkRetries: 1,
    timeout: 10000,
  });
}

// Chamada direta à API Stripe via fetch (evita problemas do SDK em serverless)
async function stripeAPI(endpoint: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const body = new URLSearchParams(params).toString();

  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getStripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await res.json() as Record<string, unknown>;
  if (data.error) {
    const err = data.error as Record<string, string>;
    throw new Error(err.message || "Stripe API error");
  }
  return data;
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
  const plan = PLANS[planId];
  if (!plan || plan.preco === 0) throw new Error("Plano inválido para checkout");

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { owner: { select: { email: true } }, subscription: true },
  });
  if (!company) throw new Error("Empresa não encontrada");

  const customerId = company.subscription?.stripeCustomerId;

  // Usar fetch direto para evitar problemas do SDK v20 em serverless
  const params: Record<string, string> = {
    "mode": "subscription",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][product_data][name]": `Grupo +351 — Plano ${plan.nome}`,
    "line_items[0][price_data][recurring][interval]": plan.intervalo,
    "line_items[0][price_data][unit_amount]": String(plan.preco),
    "line_items[0][quantity]": "1",
    "success_url": successUrl,
    "cancel_url": cancelUrl,
    "metadata[companyId]": companyId,
    "metadata[planId]": planId,
  };

  if (customerId) {
    params["customer"] = customerId;
  } else {
    params["customer_email"] = company.owner.email;
  }

  const session = await stripeAPI("checkout/sessions", params);
  if (!session.url) throw new Error("Stripe não retornou URL de checkout");
  return session.url as string;
}

// ─── Portal de Billing ───

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripeAPI("billing_portal/sessions", {
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return session.url as string;
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

  // Idempotency check — prevent duplicate processing
  const existing = await prisma.stripeEvent.findUnique({
    where: { eventId: event.id },
  });
  if (existing) return; // Already processed

  // Record event before processing (prevents re-entry on crash)
  await prisma.stripeEvent.create({
    data: { eventId: event.id, type: event.type },
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const companyId = session.metadata?.companyId;
      const planId = session.metadata?.planId;

      if (!companyId || !planId) {
        console.warn("[stripe] checkout.session.completed missing metadata", { eventId: event.id });
        break;
      }

      const customerId = session.customer as string | null;
      const subscriptionId = session.subscription as string | null;

      if (!customerId || !subscriptionId) {
        console.warn("[stripe] checkout.session.completed missing customer/subscription", { eventId: event.id });
        break;
      }

      await prisma.subscription.upsert({
        where: { companyId },
        create: {
          companyId,
          plano: planId,
          status: "active",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        },
        update: {
          plano: planId,
          status: "active",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        },
      });

      const paymentIntentId = session.payment_intent as string | null;
      await prisma.payment.create({
        data: {
          amount: session.amount_total ?? 0,
          currency: session.currency || "eur",
          status: "succeeded",
          tipo: "subscription",
          descricao: `Plano ${planId}`,
          stripePaymentId: paymentIntentId,
          companyId,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const record = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (record) {
        const periodEnd = sub.cancel_at
          ? new Date(sub.cancel_at * 1000)
          : null;

        await prisma.subscription.update({
          where: { id: record.id },
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
      const record = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (record) {
        await prisma.subscription.update({
          where: { id: record.id },
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
