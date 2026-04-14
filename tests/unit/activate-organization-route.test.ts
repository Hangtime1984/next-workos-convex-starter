import { describe, expect, it, vi } from "vitest";
import { createRedirectMock } from "@/tests/unit/helpers/redirect";

async function loadRoute() {
  const redirect = createRedirectMock();
  const refreshSession = vi.fn();
  const withAuth = vi.fn();

  vi.doMock("next/navigation", () => ({ redirect }));
  vi.doMock("@workos-inc/authkit-nextjs", () => ({
    refreshSession,
    withAuth,
  }));

  const route = await import("@/app/auth/activate-organization/route");

  return {
    redirect,
    refreshSession,
    route,
    withAuth,
  };
}

describe("/auth/activate-organization", () => {
  it("redirects signed-out requests back to the internal sign-in route", async () => {
    const subject = await loadRoute();
    subject.withAuth.mockResolvedValue({ user: null });

    await expect(
      subject.route.GET(
        new Request(
          "http://localhost:3000/auth/activate-organization?organizationId=org_123&returnTo=/w/acme",
        ),
      ),
    ).rejects.toMatchObject({
      location: "/sign-in?returnTo=%2Fw%2Facme",
    });
    expect(subject.refreshSession).not.toHaveBeenCalled();
  });

  it("falls back to the returnTo path when organizationId is missing", async () => {
    const subject = await loadRoute();
    subject.withAuth.mockResolvedValue({ user: { id: "user_123" } });

    await expect(
      subject.route.GET(
        new Request(
          "http://localhost:3000/auth/activate-organization?returnTo=/app",
        ),
      ),
    ).rejects.toMatchObject({
      location: "/app",
    });
    expect(subject.refreshSession).not.toHaveBeenCalled();
  });

  it("redirects back to sign-in when the session refresh fails", async () => {
    const subject = await loadRoute();
    subject.withAuth.mockResolvedValue({ user: { id: "user_123" } });
    subject.refreshSession.mockRejectedValue(new Error("refresh failed"));

    await expect(
      subject.route.GET(
        new Request(
          "http://localhost:3000/auth/activate-organization?organizationId=org_123&returnTo=/w/acme",
        ),
      ),
    ).rejects.toMatchObject({
      location: "/sign-in?returnTo=%2Fw%2Facme",
    });
  });

  it("refreshes the session and redirects to the target path", async () => {
    const subject = await loadRoute();
    subject.withAuth.mockResolvedValue({ user: { id: "user_123" } });
    subject.refreshSession.mockResolvedValue(undefined);

    await expect(
      subject.route.GET(
        new Request(
          "http://localhost:3000/auth/activate-organization?organizationId=org_123&returnTo=/w/acme",
        ),
      ),
    ).rejects.toMatchObject({
      location: "/w/acme",
    });
    expect(subject.refreshSession).toHaveBeenCalledWith({
      ensureSignedIn: true,
      organizationId: "org_123",
    });
  });
});
