import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const configs = await prisma.platformConfig.findMany();
  const settings: Record<string, unknown> = {};
  for (const c of configs) {
    settings[c.chave] = c.valor;
  }

  // Defaults
  const defaults: Record<string, unknown> = {
    "plataforma.nome": "Grupo +351",
    "plataforma.email_contato": "contato@grupo351.com",
    "plataforma.manutencao": false,
    "planos.growth.preco": 4900,
    "planos.enterprise.preco": 14900,
    "notificacoes.novo_user": true,
    "notificacoes.nova_candidatura": true,
    "notificacoes.deal_fechado": true,
    "notificacoes.pagamento": true,
  };

  return NextResponse.json({ ...defaults, ...settings });
}

export async function PUT(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasPermission(admin.role, "update")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();

  for (const [chave, valor] of Object.entries(body)) {
    await prisma.platformConfig.upsert({
      where: { chave },
      update: { valor: valor as never },
      create: { chave, valor: valor as never },
    });
  }

  await logAudit({
    acao: "update",
    recurso: "settings",
    adminId: admin.id,
    adminNome: admin.nome,
    detalhes: body,
  });

  return NextResponse.json({ success: true });
}
