import { describe, expect, it } from "vitest";
import { can, isAdminRole, assertCan } from "./policies";
import type { SessionUser } from "@/modules/listings/policies";

const visitor = null;
const individual: SessionUser = { id: "u1", role: "INDIVIDUAL" };
const dealer: SessionUser = { id: "u2", role: "DEALER" };
const moderator: SessionUser = { id: "u3", role: "MODERATOR" };
const superAdmin: SessionUser = { id: "u4", role: "SUPER_ADMIN" };

describe("admin policies", () => {
  it("recognizes admin roles", () => {
    expect(isAdminRole("MODERATOR")).toBe(true);
    expect(isAdminRole("SUPER_ADMIN")).toBe(true);
    expect(isAdminRole("DEALER")).toBe(false);
    expect(isAdminRole("INDIVIDUAL")).toBe(false);
  });

  it("allows moderators to moderate listings and resolve reports", () => {
    expect(can(moderator, "admin.listings.moderate")).toBe(true);
    expect(can(moderator, "admin.reports.resolve")).toBe(true);
    expect(can(moderator, "admin.dashboard")).toBe(true);
    expect(can(moderator, "admin.users.view")).toBe(true);
    expect(can(moderator, "admin.dealers.view")).toBe(true);
  });

  it("blocks moderators from super-admin-only capabilities", () => {
    expect(can(moderator, "admin.users.suspend")).toBe(false);
    expect(can(moderator, "admin.dealers.verify")).toBe(false);
    expect(can(moderator, "admin.catalog.manage")).toBe(false);
    expect(can(moderator, "admin.commercial.manage")).toBe(false);
    expect(can(moderator, "admin.admins.manage")).toBe(false);
    expect(can(moderator, "admin.audit.view")).toBe(false);
  });

  it("grants super admin every capability", () => {
    expect(can(superAdmin, "admin.users.suspend")).toBe(true);
    expect(can(superAdmin, "admin.admins.manage")).toBe(true);
    expect(can(superAdmin, "admin.audit.view")).toBe(true);
  });

  it("denies visitors, individuals, and dealers", () => {
    expect(can(visitor, "admin.dashboard")).toBe(false);
    expect(can(individual, "admin.listings.moderate")).toBe(false);
    expect(can(dealer, "admin.reports.resolve")).toBe(false);
  });

  it("throws UNAUTHORIZED vs FORBIDDEN correctly", () => {
    expect(() => assertCan(null, "admin.dashboard")).toThrow("UNAUTHORIZED");
    expect(() => assertCan(dealer, "admin.dashboard")).toThrow("FORBIDDEN");
    expect(() => assertCan(moderator, "admin.admins.manage")).toThrow("FORBIDDEN");
  });
});
