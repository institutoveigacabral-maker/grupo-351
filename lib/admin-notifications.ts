import { prisma } from "./prisma";

export async function createAdminNotification(data: {
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string;
}): Promise<void> {
  try {
    await prisma.adminNotification.create({
      data: {
        tipo: data.tipo,
        titulo: data.titulo,
        mensagem: data.mensagem,
        link: data.link || null,
      },
    });
  } catch {
    console.error("[notifications] Failed to create:", data);
  }
}
