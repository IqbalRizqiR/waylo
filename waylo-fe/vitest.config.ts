import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [".ts", ".tsx", ".mjs", ".js", ".json"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@waylo/shared": path.resolve(__dirname, "../packages/shared/src/index.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    environmentOptions: {
      jsdom: {url: "http://localhost:3000/"},
    },
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
});