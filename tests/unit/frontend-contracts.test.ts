import { describe, expect, it } from "vitest";
import {
  canAccessAdminUi,
  canApproveOutputs,
  canUseWidget,
  createEmptyProjectDraft,
  documentTypes,
  filterProjects,
  getOutputStatusLabel,
  getProjectStageLabel,
  getProjectStatusLabel,
  getRoleLabel,
  isCreateProjectDraftValid,
  normalizeAppError,
  normalizeCreateProjectDraft,
  outputStatuses,
  projectStatuses,
  projectTemplateOptions,
  projectTypeOptions,
  requiredIntakeFields,
  selectionApproaches,
  validateCreateProjectDraft,
  type FilterableProject,
} from "@/lib/frontend-contracts";

describe("frontend data contracts", () => {
  it("exposes stable enums for live Convex data", () => {
    expect(projectStatuses).toEqual(["planning", "active", "archived"]);
    expect(outputStatuses).toEqual(["draft", "reviewed", "approved", "archived"]);
    expect(projectTypeOptions).toContain("Civic / municipal");
    expect(projectTemplateOptions).toContain("Public owner procurement");
    expect(documentTypes).toContain("selection_committee_packet");
    expect(selectionApproaches).toEqual(["QBS", "Best Value", "Low Bid"]);
    expect(requiredIntakeFields).toContain("marketConditions");
  });

  it("formats status and role labels", () => {
    expect(getProjectStatusLabel("planning")).toBe("Planning");
    expect(getProjectStageLabel({ status: "planning" })).toBe("Draft");
    expect(getProjectStageLabel({ status: "planning", createAsDraft: false })).toBe(
      "Intake",
    );
    expect(getOutputStatusLabel("reviewed")).toBe("Reviewed");
    expect(getRoleLabel("owner")).toBe("Owner");
  });
});

describe("project dashboard helpers", () => {
  it("validates and normalizes create-project drafts", () => {
    const empty = createEmptyProjectDraft();

    expect(isCreateProjectDraftValid(empty)).toBe(false);
    expect(validateCreateProjectDraft(empty)).toEqual({
      name: "Project name must be at least 2 characters.",
      programDepartment: "Program or department is required.",
      location: "Location is required.",
      projectType: "Project type is required.",
    });

    const valid = {
      ...empty,
      name: "  Library Renovation  ",
      programDepartment: " Capital Planning ",
      location: " Austin, TX ",
      projectType: "Education",
      templateKey: "",
    };

    expect(isCreateProjectDraftValid(valid)).toBe(true);
    expect(normalizeCreateProjectDraft(valid)).toEqual({
      name: "Library Renovation",
      programDepartment: "Capital Planning",
      location: "Austin, TX",
      projectType: "Education",
      templateKey: undefined,
      createAsDraft: true,
    });
  });

  it("filters projects by search text and status", () => {
    const projects = [
      {
        name: "Riverfront Community Center",
        slug: "riverfront-community-center",
        status: "planning",
        programDepartment: "Parks",
        location: "Portland",
        projectType: "Civic / municipal",
      },
      {
        name: "Library Renovation",
        slug: "library-renovation",
        status: "active",
        programDepartment: "Facilities",
        location: "Austin",
        projectType: "Education",
      },
    ] satisfies FilterableProject[];

    expect(
      filterProjects(projects, { search: "parks", status: "all" }).map(
        (project) => project.slug,
      ),
    ).toEqual(["riverfront-community-center"]);
    expect(
      filterProjects(projects, { search: "renovation", status: "planning" }),
    ).toEqual([]);
    expect(
      filterProjects(projects, { search: "", status: "active" }).map(
        (project) => project.slug,
      ),
    ).toEqual(["library-renovation"]);
  });
});

describe("frontend permission helpers", () => {
  it("keeps admin and approval affordances role-based", () => {
    expect(canAccessAdminUi("owner")).toBe(true);
    expect(canAccessAdminUi("admin")).toBe(true);
    expect(canAccessAdminUi("member")).toBe(false);
    expect(canApproveOutputs("admin")).toBe(true);
    expect(canApproveOutputs("member")).toBe(false);
  });

  it("maps widget affordances to WorkOS widget permissions", () => {
    expect(
      canUseWidget({
        role: "member",
        permissions: [],
        widget: "user-profile",
      }),
    ).toBe(true);
    expect(
      canUseWidget({
        role: "member",
        permissions: ["widgets:users-table:manage"],
        widget: "users-management",
      }),
    ).toBe(false);
    expect(
      canUseWidget({
        role: "admin",
        permissions: ["widgets:users-table:manage"],
        widget: "users-management",
      }),
    ).toBe(true);
    expect(
      canUseWidget({
        role: "owner",
        permissions: ["widgets:sso:manage"],
        widget: "admin-portal-sso-connection",
      }),
    ).toBe(true);
  });
});

describe("frontend error normalization", () => {
  it("normalizes auth, organization, permission, validation, and unknown errors", () => {
    expect(normalizeAppError(new Error("Not authenticated."))).toEqual({
      kind: "auth",
      message: "Sign in to continue.",
    });
    expect(normalizeAppError("An active organization is required.")).toEqual({
      kind: "organization",
      message: "Choose an active organization to continue.",
    });
    expect(normalizeAppError("Workspace access denied.")).toEqual({
      kind: "permission",
      message: "Your current role does not grant access to this action.",
    });
    expect(normalizeAppError("Missing required intake fields: budgetRange")).toEqual({
      kind: "validation",
      message: "Some required information is missing or invalid.",
    });
    expect(normalizeAppError({})).toEqual({
      kind: "unknown",
      message: "Something went wrong. Try again.",
    });
  });
});
