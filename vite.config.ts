import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // TMDB_API_KEY has no VITE_ prefix, so it stays here and is never built into the app
  const env = loadEnv(mode, ".", "");

  // Stands in for the api/tmdb.js Function, which only runs on Vercel
  const proxy = {
    "/api/tmdb": {
      target: "https://api.themoviedb.org",
      changeOrigin: true,
      headers: { Authorization: `Bearer ${env.TMDB_API_KEY}` },
      rewrite: (url: string) => url.replace(/^\/api\/tmdb\?path=([^&]*)&?/, "/3$1?"),
    },
  };

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      globals: true,
    },
  };
});
