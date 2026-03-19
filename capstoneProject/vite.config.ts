import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const getManualChunk = (id: string): string | undefined => {
  if (!id.includes("node_modules")) {
    return undefined;
  }

  if (id.includes("react-dom") || id.includes("/react/")) {
    return "react-vendor";
  }

  if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("/zod/")) {
    return "form-vendor";
  }

  return "app-vendor";
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {},
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "output/**"],
  },
});
