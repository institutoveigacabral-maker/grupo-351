import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/rbac";
import { cached, CACHE_KEYS } from "@/lib/cache";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const cacheKey = CACHE_KEYS.adminAnalytics();

  const result = await cached(cacheKey, async () => {
    // Serie temporal: users e companies por mes (12 meses)
    const monthlyData: { month: string; users: number; companies: number; opportunities: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const [users, companies, opportunities] = await Promise.all([
        prisma.user.count({ where: { criadoEm: { gte: start, lte: end } } }),
        prisma.company.count({ where: { criadoEm: { gte: start, lte: end } } }),
        prisma.opportunity.count({ where: { criadoEm: { gte: start, lte: end } } }),
      ]);

      monthlyData.push({
        month: start.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }),
        users,
        companies,
        opportunities,
      });
    }

    // Funil de conversao
    const [totalUsers, usersWithCompany, companiesWithOpp, oppsWithMatch, closedDeals] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.company.count({ where: { opportunities: { some: {} } } }),
      prisma.opportunity.count({ where: { matches: { some: {} } } }),
      prisma.match.count({ where: { status: "fechado" } }),
    ]);

    // Top setores
    const companies = await prisma.company.findMany({ select: { setor: true } });
    const setorCounts: Record<string, number> = {};
    for (const c of companies) {
      setorCounts[c.setor] = (setorCounts[c.setor] || 0) + 1;
    }
    const topSetores = Object.entries(setorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([setor, count]) => ({ setor, count }));

    // Empresas por pais
    const companiesByCountry = await prisma.company.findMany({ select: { pais: true } });
    const paisCounts: Record<string, number> = {};
    for (const c of companiesByCountry) {
      paisCounts[c.pais] = (paisCounts[c.pais] || 0) + 1;
    }
    const topPaises = Object.entries(paisCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pais, count]) => ({ pais, count }));

    // Match status distribution
    const matches = await prisma.match.findMany({ select: { status: true } });
    const matchStatusCounts: Record<string, number> = {};
    for (const m of matches) {
      matchStatusCounts[m.status] = (matchStatusCounts[m.status] || 0) + 1;
    }

    // Opportunity types
    const opps = await prisma.opportunity.findMany({ select: { tipo: true } });
    const oppTypeCounts: Record<string, number> = {};
    for (const o of opps) {
      oppTypeCounts[o.tipo] = (oppTypeCounts[o.tipo] || 0) + 1;
    }

    return {
      monthlyData,
      funnel: [
        { label: "Utilizadores", value: totalUsers },
        { label: "Com empresa", value: usersWithCompany },
        { label: "Com oportunidade", value: companiesWithOpp },
        { label: "Com match", value: oppsWithMatch },
        { label: "Deal fechado", value: closedDeals },
      ],
      topSetores,
      topPaises,
      matchStatus: Object.entries(matchStatusCounts).map(([status, count]) => ({ status, count })),
      oppTypes: Object.entries(oppTypeCounts).map(([tipo, count]) => ({ tipo, count })),
    };
  }, 600);

  return NextResponse.json(result);
}
