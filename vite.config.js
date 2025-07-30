// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Optionnel : proxy vers ton API si besoin
const API_BASE = "https://utc-ai-signal-api.onrender.com";

export default defineConfig({
  plugins: [react()],
  base: "/", // nécessaire pour React Router
  server: {
    proxy: {
      "/api": {
        target: API_BASE,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
  },
});