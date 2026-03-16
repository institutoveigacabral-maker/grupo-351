import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cached, CACHE_KEYS } from "@/lib/cache";

// GET — listar pagamentos/faturas da empresa — cached 600s
export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
  });

  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const cacheKey = CACHE_KEYS.billingInvoices(company.id);

  const invoices = await cached(cacheKey, async () => {
    const payments = await prisma.payment.findMany({
      where: { companyId: company.id },
      orderBy: { criadoEm: "desc" },
      take: 50,
    });

    return {
      invoices: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        tipo: p.tipo,
        descricao: p.descricao,
        criadoEm: p.criadoEm.toISOString(),
      })),
    };
  }, 600);

  return NextResponse.json(invoices);
}
