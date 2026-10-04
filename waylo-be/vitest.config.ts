import {defineConfig} from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    extensions: [".ts", ".tsx", ".mjs", ".js", ".mts", ".json"],
    alias: {
      "@waylo/shared": path.resolve(__dirname, "../packages/shared/src/index.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  esbuild: {
    target: "node22",
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    server: {
      deps: {
        inline: [/@waylo\/shared/],
      },
    },
  },
});