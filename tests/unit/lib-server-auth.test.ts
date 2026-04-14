import { describe, expect, it, vi } from "vitest";
import { createRedirectMock } from "@/tests/unit/helpers/redirect";

function createWorkspaceSummary() {
  return {
    id: "workspace_1",
    organizationId: "org_alpha",
    name: "Acme Workspace",
    slug: "acme-workspace",
    roleSlug: "owner",
  } as const;
}

async function loadSubject() {
  const redirect = createRedirectMock();
  const withAuth = vi.fn();
  const fetchMutation = vi.fn();
  const fetchQuery = vi.fn();
  const canAccessAdmin = vi.fn();
  const listAccessibleWorkspaces = vi.fn();
  const normalizeRole = vi.fn();
  const widgetPermissionFor = vi.fn();

  vi.doMock("next/navigation", () => ({ redirect }));
  vi.doMock("@workos-inc/authkit-nextjs", () => ({ withAuth }));
  vi.doMock("convex/nextjs", () => ({ fetchMutation, fetchQuery }));
  vi.doMock("@/lib/server/workos", () => ({
    canAccessAdmin,
    listAccessibleWorkspaces,
    normalizeRole,
    widgetPermissionFor,
  }));

  const subject = await import("@/lib/server/auth");

  return {
    ...subject,
    canAccessAdmin,
    fetchMutation,
    fetchQuery,
    listAccessibleWorkspaces,
    normalizeRole,
    redirect,
    withAuth,
    widgetPermissionFor,
  };
}

describe("getAppContext", () => {
  it("redirects signed-out requests to the internal sign-in route", async () => {
    const subject = await loadSubject();
    subject.withAuth.mockResolvedValue({ user: null });

    await expect(subject.getAppContext()).rejects.toMatchObject({
      location: "/sign-in?returnTo=%2Fapp",
    });
    expect(subject.fetchMutation).not.toHaveBeenCalled();
  });

  it("redirects to activate the first accessible organization when the session org differs", async () => {
    const subject = await loadSubject();
    const workspace = createWorkspaceSummary();

    subject.withAuth.mockResolvedValue({
      accessToken: "token_123",
      organizationId: "org_other",
      permissions: [],
      role: "owner",
      roles: ["owner"],
      user: { id: "user_123" },
    });
    subject.fetchMutation.mockResolvedValue(undefined);
    subject.listAccessibleWorkspaces.mockResolvedValue([workspace]);

    await expect(subject.getAppContext()).rejects.toMatchObject({
      location:
        "/auth/activate-organization?organizationId=org_alpha&returnTo=%2Fw%2Facme-workspace",
    });
  });

  it("returns the authenticated app context when the session already matches the active workspace", async () => {
    const subject = await loadSubject();
    const workspace = createWorkspaceSummary();
    const viewer = {
      activeOrganizationId: "org_alpha",
      email: "owner@example.com",
      firstName: "Starter",
      lastName: "Owner",
      name: "Starter Owner",
      permissions: ["widgets:users-table:manage"],
      pictureUrl: null,
      role: "owner",
      userId: "user_123",
    };

    subject.withAuth.mockResolvedValue({
      accessToken: "token_123",
      organizationId: "org_alpha",
      permissions: ["widgets:users-table:manage"],
      role: "owner",
      roles: ["owner"],
      user: { id: "user_123" },
    });
    subject.fetchMutation.mockResolvedValue(undefined);
    subject.fetchQuery.mockResolvedValue(viewer);
    subject.listAccessibleWorkspaces.mockResolvedValue([workspace]);
    subject.normalizeRole.mockReturnValue("owner");

    await expect(subject.getAppContext()).resolves.toMatchObject({
      activeWorkspace: workspace,
      permissions: ["widgets:users-table:manage"],
      role: "owner",
      viewer,
      workspaces: [workspace],
    });
  });
});
