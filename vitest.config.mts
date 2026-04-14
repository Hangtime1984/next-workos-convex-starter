import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    clearMocks: true,
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["./tests/unit/setup.ts"],
  },
});
