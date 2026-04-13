import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;
console.log(process.env.npm_package_version);

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
    "__BUILD_DATE__": JSON.stringify(new Date().toLocaleDateString("en-SE", { year: "numeric", month: "2-digit", day: "2-digit" })),
    "__VERSION__": JSON.stringify(process.env.npm_package_version),
  },
}));
