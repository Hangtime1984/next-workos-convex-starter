import { describe, expect, it, vi } from "vitest";
async function loadRoute() {
  const withAuth = vi.fn();
  const ensureWidgetAccess = vi.fn();
  const getWidgetAuthToken = vi.fn();
  const normalizeRole = vi.fn();

  vi.doMock("@workos-inc/authkit-nextjs", () => ({ withAuth }));
  vi.doMock("@/lib/server/auth", () => ({ ensureWidgetAccess }));
  vi.doMock("@/lib/server/workos", () => ({
    getWidgetAuthToken,
    normalizeRole,
  }));

  const route = await import("@/app/api/workos/widget-token/[widget]/route");

  return {
    ensureWidgetAccess,
    getWidgetAuthToken,
    normalizeRole,
    route,
    withAuth,
  };
}

describe("/api/workos/widget-token/[widget]", () => {
  it("returns 401 when the request is unauthenticated", async () => {
    const subject = await loadRoute();
    subject.withAuth.mockResolvedValue({ user: null });

    const response = await subject.route.GET(new Request("http://localhost"), {
      params: Promise.resolve({ widget: "user-profile" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "You must be signed in to load this widget.",
    });
  });

  it("returns 400 when the user has no active organization", async () => {
    const subject = await loadRoute();
    subject.withAuth.mockResolvedValue({
      organizationId: null,
      user: { id: "user_123" },
    });

    const response = await subject.route.GET(new Request("http://localhost"), {
      params: Promise.resolve({ widget: "user-profile" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "An active organization is required to render this widget.",
    });
  });

  it("returns 403 when the current role cannot access the widget", async () => {
    const subject = await loadRoute();
    subject.withAuth.mockResolvedValue({
      organizationId: "org_123",
      permissions: [],
      role: "member",
      roles: ["member"],
      user: { id: "user_123" },
    });
    subject.normalizeRole.mockReturnValue("member");
    subject.ensureWidgetAccess.mockReturnValue(false);

    const response = await subject.route.GET(new Request("http://localhost"), {
      params: Promise.resolve({ widget: "users-management" }),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Your current role does not grant access to this widget.",
    });
  });

  it("returns an auth token when the request is allowed", async () => {
    const subject = await loadRoute();
    subject.withAuth.mockResolvedValue({
      organizationId: "org_123",
      permissions: ["widgets:users-table:manage"],
      role: "admin",
      roles: ["admin"],
      user: { id: "user_123" },
    });
    subject.normalizeRole.mockReturnValue("admin");
    subject.ensureWidgetAccess.mockReturnValue(true);
    subject.getWidgetAuthToken.mockResolvedValue("widget_token_123");

    const response = await subject.route.GET(new Request("http://localhost"), {
      params: Promise.resolve({ widget: "users-management" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      authToken: "widget_token_123",
    });
  });
});
