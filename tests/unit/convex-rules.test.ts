import { describe, expect, it } from "vitest";
import {
  assertOutputEditable,
  missingRequiredIntakeFields,
  nextAvailableSlug,
} from "@/convex/lib/projectRules";
import {
  normalizeRole,
  requireProjectAccess,
  requireWorkspaceAccess,
  roleCanApprove,
} from "@/convex/lib/auth";

function createCtx(identity: Record<string, unknown>, record: unknown) {
  return {
    auth: {
      getUserIdentity: async () => identity,
    },
    db: {
      get: async () => record,
    },
  };
}

describe("Convex authorization helpers", () => {
  it("rejects workspace access across organizations", async () => {
    const ctx = createCtx(
      { org_id: "org_allowed", subject: "user_1" },
      { _id: "workspace_1", organizationId: "org_other" },
    );

    await expect(
      requireWorkspaceAccess(ctx as never, "workspace_1" as never),
    ).rejects.toThrow("Workspace access denied.");
  });

  it("rejects project access across organizations", async () => {
    const ctx = createCtx(
      { org_id: "org_allowed", subject: "user_1" },
      { _id: "project_1", organizationId: "org_other" },
    );

    await expect(
      requireProjectAccess(ctx as never, "project_1" as never),
    ).rejects.toThrow("Project access denied.");
  });

  it("normalizes WorkOS roles for approval checks", () => {
    expect(normalizeRole("owner")).toBe("owner");
    expect(normalizeRole(null, ["admin"])).toBe("admin");
    expect(normalizeRole("custom")).toBe("member");
    expect(roleCanApprove("admin")).toBe(true);
    expect(roleCanApprove("member")).toBe(false);
  });
});

describe("MVP persistence rules", () => {
  it("reports missing required intake fields", () => {
    expect(
      missingRequiredIntakeFields({
        projectType: "Library",
        facilityType: "Civic",
      }),
    ).toContain("budgetRange");
  });

  it("allocates collision-resistant slugs", () => {
    expect(nextAvailableSlug("capital-project", [])).toBe("capital-project");
    expect(
      nextAvailableSlug("capital-project", [
        "capital-project",
        "capital-project-2",
      ]),
    ).toBe("capital-project-3");
  });

  it("blocks direct edits to approved generated outputs", () => {
    expect(() => assertOutputEditable("draft")).not.toThrow();
    expect(() => assertOutputEditable("approved")).toThrow(
      "Approved outputs are immutable",
    );
  });
});
