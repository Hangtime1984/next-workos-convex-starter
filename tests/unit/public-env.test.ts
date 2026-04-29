import { describe, expect, it, vi } from "vitest";

describe("publicEnv", () => {
  it("fails clearly when the public Convex URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "");
    const { publicEnv } = await import("@/lib/public-env");

    expect(() => publicEnv()).toThrow(
      "Missing required public environment variable: NEXT_PUBLIC_CONVEX_URL",
    );
  });
});
