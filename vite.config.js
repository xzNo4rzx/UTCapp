// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Remplace cette URL par l'URL de ton API en ligne si tu veux proxy en dev
const API_BASE = "https://api.exemple.com";

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
  },
  build: {
    outDir: "dist",
  },
});