export function publicEnv() {
  const NEXT_PUBLIC_CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("Missing required public environment variable: NEXT_PUBLIC_CONVEX_URL");
  }

  return {
    NEXT_PUBLIC_CONVEX_URL,
  };
}
