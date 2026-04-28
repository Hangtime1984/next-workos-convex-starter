import { defineConfig } from "@playwright/test";

const host = "localhost";
const port = 3100;

export default defineConfig({
  testDir: "./tests/smoke",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://${host}:${port}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `corepack pnpm exec next dev --port ${port}`,
    env: {
      ...process.env,
      CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT ?? "anonymous:anonymous-agent",
      NEXT_PUBLIC_CONVEX_URL:
        process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:3210",
      NEXT_PUBLIC_WORKOS_REDIRECT_URI: `http://${host}:${port}/auth/callback`,
    },
    gracefulShutdown: {
      signal: "SIGTERM",
      timeout: 5_000,
    },
    reuseExistingServer: !process.env.CI,
    stderr: "pipe",
    stdout: "ignore",
    timeout: 120_000,
    url: `http://${host}:${port}`,
  },
});
