import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import packageJSON from "./package.json" with { type: "json" };

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`

  clearScreen: false,  // 1. prevent Vite from obscuring rust errors
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host ?? false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**", "scripts/**"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  define: {
    "__BUILD_DATE__": JSON.stringify(Date.now()),
    "__VERSION__": JSON.stringify(process.env.npm_package_version),
    "__AUTHOR__": packageJSON.contributors[0] ? JSON.stringify(packageJSON.contributors[0]) : undefined,
    "__REPOSITORY_URL__": packageJSON.repository ? JSON.stringify(packageJSON.repository) : undefined,
  },
}));
