type RequiredKey =
  | "WORKOS_API_KEY"
  | "WORKOS_CLIENT_ID"
  | "WORKOS_COOKIE_PASSWORD"
  | "NEXT_PUBLIC_WORKOS_REDIRECT_URI"
  | "NEXT_PUBLIC_CONVEX_URL";

function requireEnv(name: RequiredKey) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function env() {
  return {
    WORKOS_API_KEY: requireEnv("WORKOS_API_KEY"),
    WORKOS_CLIENT_ID: requireEnv("WORKOS_CLIENT_ID"),
    WORKOS_COOKIE_PASSWORD: requireEnv("WORKOS_COOKIE_PASSWORD"),
    NEXT_PUBLIC_WORKOS_REDIRECT_URI: requireEnv("NEXT_PUBLIC_WORKOS_REDIRECT_URI"),
    NEXT_PUBLIC_CONVEX_URL: requireEnv("NEXT_PUBLIC_CONVEX_URL"),
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    CONVEX_DEPLOY_KEY: process.env.CONVEX_DEPLOY_KEY,
    WORKOS_AUTH_ISSUER: process.env.WORKOS_AUTH_ISSUER ?? "https://api.workos.com/",
    WORKOS_JWKS_URL:
      process.env.WORKOS_JWKS_URL ??
      `https://api.workos.com/sso/jwks/${requireEnv("WORKOS_CLIENT_ID")}`,
  };
}
