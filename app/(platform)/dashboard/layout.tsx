import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";
import { DashboardShell } from "@/components/DashboardShell";
import { Providers } from "@/components/Providers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await cached(
    `user:${session.id}:profile`,
    async () => {
      const u = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          company: {
            select: { id: true, slug: true, nome: true },
          },
        },
      });
      if (!u) return null;
      return {
        id: u.id,
        nome: u.nome,
        email: u.email,
        role: u.role,
        company: u.company,
      };
    },
    300 // 5 min cache
  );

  if (!user) redirect("/login");

  return (
    <Providers>
      <DashboardShell user={user}>{children}</DashboardShell>
    </Providers>
  );
}
