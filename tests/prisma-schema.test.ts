import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Test the Prisma schema file for correctness
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
const schema = fs.readFileSync(schemaPath, "utf-8");

describe("Prisma Schema Validation", () => {
  it("defines all core models", () => {
    const expectedModels = [
      "AdminUser",
      "User",
      "Company",
      "CompanyMember",
      "Opportunity",
      "Match",
      "PlatformProject",
      "ProjectMember",
      "ProjectTask",
      "Message",
      "Candidatura",
      "Contato",
      "Projeto",
      "Termo",
      "Artigo",
      "AiConversa",
      "Parceiro",
      "ReuniaoDataset",
      "Subscription",
      "Payment",
      "ApiKey",
      "AuditLog",
      "AdminNotification",
      "PlatformConfig",
    ];

    for (const model of expectedModels) {
      expect(schema).toContain(`model ${model} {`);
    }
  });

  it("AdminUser has required fields", () => {
    expect(schema).toMatch(/model AdminUser \{[\s\S]*?email\s+String\s+@unique/);
    expect(schema).toMatch(/model AdminUser \{[\s\S]*?senhaHash\s+String/);
    expect(schema).toMatch(/model AdminUser \{[\s\S]*?role\s+String/);
  });

  it("User has email unique constraint", () => {
    expect(schema).toMatch(/model User \{[\s\S]*?email\s+String\s+@unique/);
  });

  it("Company has slug unique constraint", () => {
    expect(schema).toMatch(/model Company \{[\s\S]*?slug\s+String\s+@unique/);
  });

  it("Match has unique constraint on opportunity+from+to", () => {
    expect(schema).toContain("@@unique([opportunityId, fromUserId, toUserId])");
  });

  it("Subscription has stripeCustomerId unique", () => {
    expect(schema).toMatch(/stripeCustomerId.*@unique/);
  });

  it("Subscription has stripeSubscriptionId unique", () => {
    expect(schema).toMatch(/stripeSubscriptionId.*@unique/);
  });

  it("ApiKey has key unique constraint", () => {
    expect(schema).toMatch(/model ApiKey \{[\s\S]*?key\s+String\s+@unique/);
  });

  it("Parceiro has email and token unique", () => {
    expect(schema).toMatch(/model Parceiro \{[\s\S]*?email\s+String\s+@unique/);
    expect(schema).toMatch(/model Parceiro \{[\s\S]*?token\s+String\s+@unique/);
  });

  it("uses PostgreSQL provider", () => {
    expect(schema).toContain('provider = "postgresql"');
  });

  it("maps tables to snake_case names", () => {
    const mappings = [
      '@@map("admin_users")',
      '@@map("users")',
      '@@map("companies")',
      '@@map("opportunities")',
      '@@map("matches")',
      '@@map("candidaturas")',
      '@@map("contatos")',
      '@@map("subscriptions")',
      '@@map("payments")',
      '@@map("api_keys")',
      '@@map("audit_logs")',
    ];

    for (const mapping of mappings) {
      expect(schema).toContain(mapping);
    }
  });

  it("AuditLog has indexes for efficient querying", () => {
    expect(schema).toContain("@@index([recurso, criadoEm])");
    expect(schema).toContain("@@index([adminId, criadoEm])");
  });

  it("AdminNotification has index on lida+criadoEm", () => {
    expect(schema).toContain("@@index([lida, criadoEm])");
  });

  it("Payment amount is Int (centavos)", () => {
    expect(schema).toMatch(/model Payment \{[\s\S]*?amount\s+Int/);
  });

  it("Opportunity has status field with default", () => {
    expect(schema).toContain('@default("aberta")');
  });

  it("User role defaults to empresa", () => {
    expect(schema).toMatch(/model User \{[\s\S]*?role\s+String\s+@default\("empresa"\)/);
  });

  it("Company has one-to-one relation with owner", () => {
    expect(schema).toContain("ownerId     String    @unique");
  });
});
