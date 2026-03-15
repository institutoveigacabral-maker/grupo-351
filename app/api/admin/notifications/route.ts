import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/rbac";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const notifications = await prisma.adminNotification.findMany({
    orderBy: { criadoEm: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.adminNotification.count({ where: { lida: false } });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      mensagem: n.mensagem,
      link: n.link,
      lida: n.lida,
      criadoEm: n.criadoEm.toISOString(),
    })),
    unreadCount,
  });
}

export async function PATCH(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();

  // Marcar como lida (individual ou todas)
  if (body.markAllRead) {
    await prisma.adminNotification.updateMany({
      where: { lida: false },
      data: { lida: true },
    });
    return NextResponse.json({ success: true });
  }

  if (body.id) {
    await prisma.adminNotification.update({
      where: { id: body.id },
      data: { lida: true },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
