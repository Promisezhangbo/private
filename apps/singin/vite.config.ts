import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import qiankun from "vite-plugin-qiankun";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    qiankun("singin", {
      useDevMode: true
    })
  ],
  build: {
    outDir: "../../dist/singin"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  base: "/",
  server: {
    port: 9003,
    hmr: false,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    cors: true
  }
});
