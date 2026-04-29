import { describe, expect, it, vi } from "vitest";
import { createRedirectMock } from "@/tests/unit/helpers/redirect";

class NotFoundSignal extends Error {
  constructor() {
    super("Not found");
    this.name = "NotFoundSignal";
  }
}

function createNotFoundMock() {
  return vi.fn(() => {
    throw new NotFoundSignal();
  });
}

function createWorkspaceSummary(overrides: Record<string, unknown> = {}) {
  return {
    id: "workspace_1",
    organizationId: "org_alpha",
    name: "Acme Workspace",
    slug: "acme-workspace",
    roleSlug: "owner",
    ...overrides,
  } as const;
}

function createViewer() {
  return {
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
}

async function loadSubject() {
  const redirect = createRedirectMock();
  const notFound = createNotFoundMock();
  const withAuth = vi.fn();
  const fetchMutation = vi.fn();
  const fetchQuery = vi.fn();
  const canAccessAdmin = vi.fn();
  const listAccessibleWorkspaces = vi.fn();
  const normalizeRole = vi.fn();
  const widgetPermissionFor = vi.fn();

  vi.doMock("next/navigation", () => ({ notFound, redirect }));
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
    notFound,
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
    expect(subject.listAccessibleWorkspaces).toHaveBeenCalledWith({
      activeOrganizationId: "org_other",
      accessToken: "token_123",
      userId: "user_123",
    });
  });

  it("returns the authenticated app context when the session already matches the active workspace", async () => {
    const subject = await loadSubject();
    const workspace = createWorkspaceSummary();
    const viewer = createViewer();

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

  it("redirects to onboarding when the user has no accessible workspaces", async () => {
    const subject = await loadSubject();

    subject.withAuth.mockResolvedValue({
      accessToken: "token_123",
      organizationId: null,
      permissions: [],
      role: "member",
      roles: ["member"],
      user: { id: "user_123" },
    });
    subject.fetchMutation.mockResolvedValue(undefined);
    subject.listAccessibleWorkspaces.mockResolvedValue([]);

    await expect(subject.getAppContext()).rejects.toMatchObject({
      location: "/onboarding/workspace",
    });
  });
});

describe("route context helpers", () => {
  it("returns route context for the active workspace slug", async () => {
    const subject = await loadSubject();
    const workspace = createWorkspaceSummary();
    const viewer = createViewer();

    subject.withAuth.mockResolvedValue({
      accessToken: "token_123",
      organizationId: "org_alpha",
      permissions: [],
      role: "owner",
      roles: ["owner"],
      user: { id: "user_123" },
    });
    subject.fetchMutation.mockResolvedValue(undefined);
    subject.fetchQuery.mockResolvedValue(viewer);
    subject.listAccessibleWorkspaces.mockResolvedValue([workspace]);
    subject.normalizeRole.mockReturnValue("owner");

    await expect(
      subject.requireWorkspaceRouteContext("acme-workspace"),
    ).resolves.toMatchObject({
      activeWorkspace: workspace,
      routeWorkspace: workspace,
    });
  });

  it("not-founds an unknown workspace slug", async () => {
    const subject = await loadSubject();
    const workspace = createWorkspaceSummary();

    subject.withAuth.mockResolvedValue({
      accessToken: "token_123",
      organizationId: "org_alpha",
      permissions: [],
      role: "owner",
      roles: ["owner"],
      user: { id: "user_123" },
    });
    subject.fetchMutation.mockResolvedValue(undefined);
    subject.fetchQuery.mockResolvedValue(createViewer());
    subject.listAccessibleWorkspaces.mockResolvedValue([workspace]);
    subject.normalizeRole.mockReturnValue("owner");

    await expect(
      subject.requireWorkspaceRouteContext("missing-workspace"),
    ).rejects.toThrow("Not found");
    expect(subject.notFound).toHaveBeenCalled();
  });

  it("activates a known inactive workspace before rendering it", async () => {
    const subject = await loadSubject();
    const activeWorkspace = createWorkspaceSummary();
    const inactiveWorkspace = createWorkspaceSummary({
      id: "workspace_2",
      organizationId: "org_beta",
      name: "Beta Workspace",
      slug: "beta-workspace",
    });

    subject.withAuth.mockResolvedValue({
      accessToken: "token_123",
      organizationId: "org_alpha",
      permissions: [],
      role: "owner",
      roles: ["owner"],
      user: { id: "user_123" },
    });
    subject.fetchMutation.mockResolvedValue(undefined);
    subject.fetchQuery.mockResolvedValue(createViewer());
    subject.listAccessibleWorkspaces.mockResolvedValue([
      activeWorkspace,
      inactiveWorkspace,
    ]);
    subject.normalizeRole.mockReturnValue("owner");

    await expect(
      subject.requireWorkspaceRouteContext("beta-workspace"),
    ).rejects.toMatchObject({
      location:
        "/auth/activate-organization?organizationId=org_beta&returnTo=%2Fw%2Fbeta-workspace%2Fprojects",
    });
  });

  it("loads a project by route slug within the active workspace", async () => {
    const subject = await loadSubject();
    const workspace = createWorkspaceSummary();
    const viewer = createViewer();
    const project = {
      _id: "project_1",
      name: "Library Renovation",
      slug: "library-renovation",
      workspaceId: "workspace_1",
    };

    subject.withAuth.mockResolvedValue({
      accessToken: "token_123",
      organizationId: "org_alpha",
      permissions: [],
      role: "owner",
      roles: ["owner"],
      user: { id: "user_123" },
    });
    subject.fetchMutation.mockResolvedValue(undefined);
    subject.fetchQuery
      .mockResolvedValueOnce(viewer)
      .mockResolvedValueOnce(project);
    subject.listAccessibleWorkspaces.mockResolvedValue([workspace]);
    subject.normalizeRole.mockReturnValue("owner");

    await expect(
      subject.requireProjectRouteContext({
        workspaceSlug: "acme-workspace",
        projectSlug: "library-renovation",
      }),
    ).resolves.toMatchObject({
      activeWorkspace: workspace,
      project,
      routeWorkspace: workspace,
    });
    expect(subject.fetchQuery).toHaveBeenLastCalledWith(
      expect.anything(),
      {
        workspaceId: "workspace_1",
        slug: "library-renovation",
      },
      { token: "token_123" },
    );
  });
});

describe("requireAdminContext", () => {
  it("redirects members away from admin-only server contexts", async () => {
    const subject = await loadSubject();
    const workspace = createWorkspaceSummary();

    subject.withAuth.mockResolvedValue({
      accessToken: "token_123",
      organizationId: "org_alpha",
      permissions: [],
      role: "member",
      roles: ["member"],
      user: { id: "user_123" },
    });
    subject.fetchMutation.mockResolvedValue(undefined);
    subject.fetchQuery.mockResolvedValue(createViewer());
    subject.listAccessibleWorkspaces.mockResolvedValue([workspace]);
    subject.normalizeRole.mockReturnValue("member");
    subject.canAccessAdmin.mockReturnValue(false);

    await expect(subject.requireAdminContext()).rejects.toMatchObject({
      location: "/app",
    });
  });
});
