import { describe, it, expect } from "vitest";
import { hasPermission, type AdminRole } from "@/lib/rbac";

describe("hasPermission", () => {
  describe("superadmin", () => {
    it("can read", () => {
      expect(hasPermission("superadmin", "read")).toBe(true);
    });

    it("can create", () => {
      expect(hasPermission("superadmin", "create")).toBe(true);
    });

    it("can update", () => {
      expect(hasPermission("superadmin", "update")).toBe(true);
    });

    it("can delete", () => {
      expect(hasPermission("superadmin", "delete")).toBe(true);
    });

    it("can manage team", () => {
      expect(hasPermission("superadmin", "manage-team")).toBe(true);
    });

    it("can export", () => {
      expect(hasPermission("superadmin", "export")).toBe(true);
    });
  });

  describe("admin", () => {
    it("can read", () => {
      expect(hasPermission("admin", "read")).toBe(true);
    });

    it("can create", () => {
      expect(hasPermission("admin", "create")).toBe(true);
    });

    it("can update", () => {
      expect(hasPermission("admin", "update")).toBe(true);
    });

    it("cannot delete", () => {
      expect(hasPermission("admin", "delete")).toBe(false);
    });

    it("cannot manage team", () => {
      expect(hasPermission("admin", "manage-team")).toBe(false);
    });

    it("can export", () => {
      expect(hasPermission("admin", "export")).toBe(true);
    });
  });

  describe("viewer", () => {
    it("can read", () => {
      expect(hasPermission("viewer", "read")).toBe(true);
    });

    it("cannot create", () => {
      expect(hasPermission("viewer", "create")).toBe(false);
    });

    it("cannot update", () => {
      expect(hasPermission("viewer", "update")).toBe(false);
    });

    it("cannot delete", () => {
      expect(hasPermission("viewer", "delete")).toBe(false);
    });

    it("cannot manage team", () => {
      expect(hasPermission("viewer", "manage-team")).toBe(false);
    });

    it("cannot export", () => {
      expect(hasPermission("viewer", "export")).toBe(false);
    });
  });

  describe("unknown action", () => {
    it("defaults to admin permission level", () => {
      expect(hasPermission("admin", "some-unknown-action")).toBe(true);
      expect(hasPermission("viewer", "some-unknown-action")).toBe(false);
    });
  });
});
