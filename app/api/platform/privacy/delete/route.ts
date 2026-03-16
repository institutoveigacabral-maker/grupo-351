import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { logPlatformAudit } from "@/lib/audit";

// POST — Delete user account and all associated data (RGPD Art. 17 — Direito ao apagamento)
export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Require explicit confirmation
  if (body.confirm !== "DELETE_MY_ACCOUNT") {
    return NextResponse.json(
      { error: "Confirmação obrigatória. Envie { confirm: 'DELETE_MY_ACCOUNT' }" },
      { status: 400 }
    );
  }

  try {
    // Delete in order of dependencies
    await prisma.$transaction(async (tx) => {
      // Delete notifications
      await tx.userNotification.deleteMany({ where: { userId: session.id } });

      // Delete reviews (given and received)
      await tx.review.deleteMany({ where: { autorId: session.id } });
      await tx.review.deleteMany({ where: { avaliadoId: session.id } });

      // Delete messages
      await tx.message.deleteMany({ where: { userId: session.id } });

      // Delete matches where user is involved
      await tx.match.deleteMany({
        where: { OR: [{ fromUserId: session.id }, { toUserId: session.id }] },
      });

      // If user owns a company, clean up company data
      const company = await tx.company.findUnique({ where: { ownerId: session.id } });
      if (company) {
        await tx.document.deleteMany({ where: { empresaId: company.id } });
        await tx.teamInvite.deleteMany({ where: { empresaId: company.id } });
        await tx.companyMember.deleteMany({ where: { companyId: company.id } });
        await tx.opportunity.deleteMany({ where: { companyId: company.id } });
        await tx.company.delete({ where: { id: company.id } });
      }

      // Delete API keys
      await tx.apiKey.deleteMany({ where: { userId: session.id } });

      // Delete the user
      await tx.user.delete({ where: { id: session.id } });
    });

    // Audit log before clearing session
    await logPlatformAudit({
      acao: "DELETE_ACCOUNT",
      recurso: "user",
      resourceId: session.id,
      userId: session.id,
      userNome: session.nome || "unknown",
      detalhes: { reason: "RGPD Art. 17" },
    });

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.delete("user_session");

    return NextResponse.json({ ok: true, message: "Conta e dados eliminados com sucesso." });
  } catch (err) {
    console.error("[privacy/delete]", err);
    return NextResponse.json({ error: "Erro ao eliminar conta" }, { status: 500 });
  }
}
