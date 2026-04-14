import type { AuthConfig } from "convex/server";

const workosClientId = process.env.WORKOS_CLIENT_ID ?? "client_placeholder";

export default {
  providers: [
    {
      type: "customJwt",
      issuer: "https://api.workos.com/",
      jwks: `https://api.workos.com/sso/jwks/${workosClientId}`,
      algorithm: "RS256",
      applicationID: workosClientId,
    },
  ],
} satisfies AuthConfig;
