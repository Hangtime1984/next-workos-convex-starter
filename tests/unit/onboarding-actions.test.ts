import { describe, expect, it, vi } from "vitest";
import { createRedirectMock } from "@/tests/unit/helpers/redirect";

async function loadAction() {
  const redirect = createRedirectMock();
  const refreshSession = vi.fn();
  const withAuth = vi.fn();
  const fetchMutation = vi.fn();
  const getWorkOS = vi.fn();

  vi.doMock("next/navigation", () => ({ redirect }));
  vi.doMock("@workos-inc/authkit-nextjs", () => ({
    refreshSession,
    withAuth,
  }));
  vi.doMock("convex/nextjs", () => ({ fetchMutation }));
  vi.doMock("@/lib/server/workos", () => ({ getWorkOS }));

  const subject = await import("@/app/onboarding/workspace/actions");

  return {
    ...subject,
    fetchMutation,
    getWorkOS,
    redirect,
    refreshSession,
    withAuth,
  };
}

describe("createWorkspaceAction", () => {
  it("returns a session-expired message when the server action is invoked without an active session", async () => {
    const subject = await loadAction();
    subject.withAuth.mockResolvedValue({ user: null });

    await expect(
      subject.createWorkspaceAction({}, new FormData()),
    ).resolves.toEqual({
      error: "Session expired. Sign in again.",
    });
    expect(subject.fetchMutation).not.toHaveBeenCalled();
    expect(subject.getWorkOS).not.toHaveBeenCalled();
    expect(subject.refreshSession).not.toHaveBeenCalled();
  });
});
