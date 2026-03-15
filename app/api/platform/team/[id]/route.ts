import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE — remover membro ou cancelar convite
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
  });

  if (!company) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // Tentar deletar membro
  const member = await prisma.companyMember.findFirst({
    where: { id, companyId: company.id },
  });

  if (member) {
    // Não pode remover o owner
    if (member.userId === company.ownerId) {
      return NextResponse.json({ error: "Não é possível remover o dono da empresa" }, { status: 403 });
    }
    await prisma.companyMember.delete({ where: { id: member.id } });
    return NextResponse.json({ message: "Membro removido" });
  }

  // Tentar cancelar convite
  const invite = await prisma.teamInvite.findFirst({
    where: { id, empresaId: company.id, aceito: false },
  });

  if (invite) {
    await prisma.teamInvite.delete({ where: { id: invite.id } });
    return NextResponse.json({ message: "Convite cancelado" });
  }

  return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
}

// PATCH — alterar role de membro
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { ownerId: session.id },
  });

  if (!company) {
    return NextResponse.json({ error: "Apenas o dono pode alterar roles" }, { status: 403 });
  }

  const member = await prisma.companyMember.findFirst({
    where: { id, companyId: company.id },
  });

  if (!member) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
  }

  if (member.userId === company.ownerId) {
    return NextResponse.json({ error: "Não é possível alterar o role do dono" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const role = body.role;
  if (!["admin", "membro"].includes(role)) {
    return NextResponse.json({ error: "Role inválido" }, { status: 400 });
  }

  await prisma.companyMember.update({
    where: { id: member.id },
    data: { role },
  });

  return NextResponse.json({ message: "Role atualizado" });
}
