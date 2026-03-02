import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const isDev = process.env.NODE_ENV === "development";

// https://vite.dev/config/
export default defineConfig({
  base: isDev ? "/" : "/main/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    outDir: "../../dist/main"
  },
  server: {
    host: true,
    port: 9000,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
});
