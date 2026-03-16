import { prisma } from "./prisma";
import { logger } from "./logger";

export async function createUserNotification(data: {
  userId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string;
}): Promise<void> {
  try {
    await prisma.userNotification.create({
      data: {
        userId: data.userId,
        tipo: data.tipo,
        titulo: data.titulo,
        mensagem: data.mensagem,
        link: data.link || null,
      },
    });
  } catch (err) {
    logger.error(`Failed to create notification for ${data.userId}`, "notifications", { error: String(err), tipo: data.tipo });
  }
}

export async function createUserNotificationBulk(
  userIds: string[],
  data: { tipo: string; titulo: string; mensagem: string; link?: string }
): Promise<void> {
  try {
    await prisma.userNotification.createMany({
      data: userIds.map((userId) => ({
        userId,
        tipo: data.tipo,
        titulo: data.titulo,
        mensagem: data.mensagem,
        link: data.link || null,
      })),
    });
  } catch (err) {
    logger.error(`Bulk notification create failed (${userIds.length} users)`, "notifications", { error: String(err), tipo: data.tipo });
  }
}
