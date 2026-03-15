import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/rbac";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [subscriptions, payments] = await Promise.all([
    prisma.subscription.findMany({
      include: {
        company: { select: { id: true, nome: true, slug: true } },
      },
    }),
    prisma.payment.findMany({
      orderBy: { criadoEm: "desc" },
      take: 50,
    }),
  ]);

  // Calcular metricas
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const planCounts: Record<string, number> = {};
  const planRevenue: Record<string, number> = {};

  // Precos mensais em centavos (EUR)
  const planPrices: Record<string, number> = {
    free: 0,
    growth: 4900,       // 49 EUR
    enterprise: 14900,   // 149 EUR
  };

  for (const sub of activeSubs) {
    planCounts[sub.plano] = (planCounts[sub.plano] || 0) + 1;
    planRevenue[sub.plano] = (planRevenue[sub.plano] || 0) + (planPrices[sub.plano] || 0);
  }

  const mrr = Object.values(planRevenue).reduce((a, b) => a + b, 0);
  const arr = mrr * 12;

  // Churn: cancelados no ultimo mes
  const umMesAtras = new Date();
  umMesAtras.setMonth(umMesAtras.getMonth() - 1);
  const canceledLastMonth = subscriptions.filter(
    (s) => s.status === "canceled" && s.updatedAt >= umMesAtras
  ).length;
  const totalLastMonth = subscriptions.filter(
    (s) => s.criadoEm < umMesAtras
  ).length;
  const churnRate = totalLastMonth > 0 ? (canceledLastMonth / totalLastMonth) * 100 : 0;

  // Pagamentos recentes
  const recentPayments = payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    tipo: p.tipo,
    descricao: p.descricao,
    criadoEm: p.criadoEm.toISOString(),
    companyId: p.companyId,
  }));

  // Receita mensal dos ultimos 6 meses
  const monthlyRevenue: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const monthPayments = payments.filter(
      (p) => p.status === "succeeded" && p.criadoEm >= monthStart && p.criadoEm <= monthEnd
    );
    const total = monthPayments.reduce((acc, p) => acc + p.amount, 0);

    monthlyRevenue.push({
      month: monthStart.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }),
      amount: total,
    });
  }

  // Subscriptions com detalhes
  const subsData = subscriptions.map((s) => ({
    id: s.id,
    plano: s.plano,
    status: s.status,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() || null,
    criadoEm: s.criadoEm.toISOString(),
    company: s.company,
  }));

  return NextResponse.json({
    metricas: {
      mrr,
      arr,
      churnRate: Math.round(churnRate * 10) / 10,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubs.length,
      planCounts,
      planRevenue,
    },
    monthlyRevenue,
    subscriptions: subsData,
    recentPayments,
  });
}
