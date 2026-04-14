import { describe, expect, it, vi } from "vitest";
import { createRedirectMock } from "@/tests/unit/helpers/redirect";

async function loadRoutes() {
  const redirect = createRedirectMock();
  const getSignInUrl = vi.fn();
  const getSignUpUrl = vi.fn();

  vi.doMock("next/navigation", () => ({ redirect }));
  vi.doMock("@workos-inc/authkit-nextjs", () => ({
    getSignInUrl,
    getSignUpUrl,
  }));

  const signInRoute = await import("@/app/sign-in/route");
  const signUpRoute = await import("@/app/sign-up/route");

  return {
    getSignInUrl,
    getSignUpUrl,
    redirect,
    signInRoute,
    signUpRoute,
  };
}

describe("auth routes", () => {
  it("sanitizes an unsafe sign-in returnTo value", async () => {
    const subject = await loadRoutes();
    subject.getSignInUrl.mockResolvedValue("https://workos.example/sign-in");

    await expect(
      subject.signInRoute.GET(
        new Request("http://localhost:3000/sign-in?returnTo=https://evil.example"),
      ),
    ).rejects.toMatchObject({
      location: "https://workos.example/sign-in",
    });
    expect(subject.getSignInUrl).toHaveBeenCalledWith({ returnTo: "/app" });
  });

  it("preserves a safe sign-up returnTo value", async () => {
    const subject = await loadRoutes();
    subject.getSignUpUrl.mockResolvedValue("https://workos.example/sign-up");

    await expect(
      subject.signUpRoute.GET(
        new Request(
          "http://localhost:3000/sign-up?returnTo=/onboarding/workspace",
        ),
      ),
    ).rejects.toMatchObject({
      location: "https://workos.example/sign-up",
    });
    expect(subject.getSignUpUrl).toHaveBeenCalledWith({
      returnTo: "/onboarding/workspace",
    });
  });
});
