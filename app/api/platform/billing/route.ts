import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, createBillingPortalSession, PLANS, getCompanyPlan } from "@/lib/stripe";

// GET — plano atual + planos disponíveis
export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
    include: { subscription: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Crie uma empresa primeiro" }, { status: 403 });
  }

  const currentPlan = await getCompanyPlan(company.id);

  return NextResponse.json({
    currentPlan: currentPlan.id,
    subscription: company.subscription
      ? {
          status: company.subscription.status,
          currentPeriodEnd: company.subscription.currentPeriodEnd,
          cancelAtPeriodEnd: company.subscription.cancelAtPeriodEnd,
        }
      : null,
    plans: Object.values(PLANS),
  });
}

// POST — criar checkout session ou abrir billing portal
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
    include: { subscription: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Crie uma empresa primeiro" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { action, planId } = body;

  try {
    if (action === "manage" && company.subscription?.stripeCustomerId) {
      // Abrir portal de billing do Stripe
      const url = await createBillingPortalSession(
        company.subscription.stripeCustomerId,
        `${process.env.NEXT_PUBLIC_APP_URL || "https://grupo-351.vercel.app"}/dashboard/plano`
      );
      return NextResponse.json({ url });
    }

    if (action === "checkout" && planId) {
      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://grupo-351.vercel.app").replace(/\/+$/, "");
      const successUrl = `${baseUrl}/dashboard/plano?success=true`;
      const cancelUrl = `${baseUrl}/dashboard/plano?canceled=true`;
      const url = await createCheckoutSession(
        company.id,
        planId,
        successUrl,
        cancelUrl
      );
      return NextResponse.json({ url });
    }

    return NextResponse.json({ error: "action (checkout|manage) obrigatória" }, { status: 400 });
  } catch (err) {
    console.error("[billing]", err);
    const msg = err instanceof Error ? err.message : "Erro no pagamento";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "(not set)";
    return NextResponse.json({
      error: msg,
      debug_baseUrl: baseUrl,
      detail: err instanceof Error ? err.stack?.split("\n")[1]?.trim() : undefined,
    }, { status: 500 });
  }
}
