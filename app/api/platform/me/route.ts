import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await cached(
    `user:${session.id}:me`,
    async () => {
      const u = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          company: {
            select: { id: true, slug: true, nome: true, setor: true, estagio: true, verificada: true },
          },
        },
      });
      if (!u) return null;
      return {
        id: u.id,
        nome: u.nome,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        company: u.company,
      };
    },
    300 // 5 min cache
  );

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json(user);
}
