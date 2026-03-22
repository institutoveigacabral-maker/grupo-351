import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const adapter = new PrismaNeon({ connectionString: url.replace(/^"(.*)"$/, "$1") });
  const prisma = new PrismaClient({ adapter } as never);

  const email = "henriquelemos10@msn.com";
  const nome = "Henrique Lemos";
  const senha = "Hd100481";
  const senhaHash = await bcrypt.hash(senha, 12);

  // Remove all existing admins
  const deleted = await prisma.adminUser.deleteMany({});
  console.log(`Removed ${deleted.count} existing admin(s)`);

  // Create the single admin
  const admin = await prisma.adminUser.create({
    data: {
      email,
      nome,
      senhaHash,
      role: "superadmin",
      ativo: true,
    },
  });

  console.log(`Admin created: ${admin.email} (${admin.role}) — id: ${admin.id}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
