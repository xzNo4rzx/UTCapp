// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import history from 'connect-history-api-fallback';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Remplace cette URL par l'URL de ton API si tu veux proxy en dev
const API_BASE = "https://github.com/xzNo4rzx/ai-signal-api/tree/main";

export default defineConfig({
  plugins: [react()],
  base: "/", // ✅ nécessaire pour React Router sur Render
  server: {
    proxy: {
      "/api": {
        target: API_BASE,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    middlewareMode: 'html',
    setupMiddlewares(middlewares) {
      middlewares.unshift(history());
      return middlewares;
    },
  },
  build: {
    outDir: "dist",
  },
});