// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_BASE = "https://api.exemple.com";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // proxy toutes les requêtes /api/* vers votre API
      "/api": {
        target: API_BASE,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});