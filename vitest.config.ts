import { defineConfig } from "vitest/config";

// Test runner config, kept separate from the library build (vite.config.ts) so the
// dts plugin / lib options don't run during tests. Specs import describe/it/expect
// explicitly from "vitest", so no `globals` injection is needed.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.spec.ts"],
  },
});
