import type { AuthConfig } from "convex/server";

const workosClientId = process.env.WORKOS_CLIENT_ID;

if (!workosClientId) {
  throw new Error("WORKOS_CLIENT_ID is required for Convex auth config.");
}

export default {
  providers: [
    {
      type: "customJwt",
      issuer: `https://api.workos.com/user_management/${workosClientId}`,
      jwks: `https://api.workos.com/sso/jwks/${workosClientId}`,
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
