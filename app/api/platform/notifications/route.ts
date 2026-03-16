import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cached, invalidate } from "@/lib/cache";

// GET — listar notificacoes do user + unread count
export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const data = await cached(
    `user:${session.id}:notifications`,
    async () => {
      const [notifications, unreadCount] = await Promise.all([
        prisma.userNotification.findMany({
          where: { userId: session.id },
          orderBy: { criadoEm: "desc" },
          take: 20,
        }),
        prisma.userNotification.count({ where: { userId: session.id, lida: false } }),
      ]);

      return {
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
      };
    },
    60 // 1 min cache
  );

  return NextResponse.json(data);
}

// PATCH — marcar como lida (individual ou todas)
export async function PATCH(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.markAllRead) {
    await prisma.userNotification.updateMany({
      where: { userId: session.id, lida: false },
      data: { lida: true },
    });
    await invalidate(`user:${session.id}:notifications`);
    return NextResponse.json({ success: true });
  }

  if (body.id) {
    await prisma.userNotification.updateMany({
      where: { id: body.id, userId: session.id },
      data: { lida: true },
    });
    await invalidate(`user:${session.id}:notifications`);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
