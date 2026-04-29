import { describe, expect, it } from "vitest";
import {
  buildActivateOrganizationPath,
  buildSignInPath,
  normalizeReturnTo,
} from "@/lib/utils";
import {
  buildAppPath,
  buildProjectPath,
  buildWorkspacePath,
  buildWorkspaceProjectsPath,
} from "@/lib/routes";

describe("route helpers", () => {
  it("builds authenticated app and workspace paths", () => {
    expect(buildAppPath()).toBe("/app");
    expect(buildWorkspacePath("capital-projects")).toBe("/w/capital-projects");
    expect(buildWorkspaceProjectsPath("capital-projects")).toBe(
      "/w/capital-projects/projects",
    );
  });

  it("builds project section paths", () => {
    expect(
      buildProjectPath({
        workspaceSlug: "capital-projects",
        projectSlug: "library-renovation",
      }),
    ).toBe("/w/capital-projects/projects/library-renovation");
    expect(
      buildProjectPath({
        workspaceSlug: "capital-projects",
        projectSlug: "library-renovation",
        section: "delivery",
      }),
    ).toBe("/w/capital-projects/projects/library-renovation/delivery");
  });

  it("encodes dynamic route segments", () => {
    expect(buildWorkspacePath("capital projects")).toBe("/w/capital%20projects");
    expect(
      buildProjectPath({
        workspaceSlug: "capital projects",
        projectSlug: "phase 1/library",
        section: "intake",
      }),
    ).toBe("/w/capital%20projects/projects/phase%201%2Flibrary/intake");
  });
});

describe("return path helpers", () => {
  it("rejects unsafe returnTo values", () => {
    expect(normalizeReturnTo(null)).toBe("/app");
    expect(normalizeReturnTo("https://evil.example")).toBe("/app");
    expect(normalizeReturnTo("//evil.example/path")).toBe("/app");
  });

  it("preserves safe internal returnTo values in auth paths", () => {
    expect(buildSignInPath("/w/capital-projects/projects")).toBe(
      "/sign-in?returnTo=%2Fw%2Fcapital-projects%2Fprojects",
    );
    expect(
      buildActivateOrganizationPath({
        organizationId: "org_123",
        returnTo: "/w/capital-projects/projects/library-renovation",
      }),
    ).toBe(
      "/auth/activate-organization?organizationId=org_123&returnTo=%2Fw%2Fcapital-projects%2Fprojects%2Flibrary-renovation",
    );
  });
});
