import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/tkn/dist/',   // ← penting: sesuaikan dengan subdirektori Laragon + dist
  build: {
    outDir: 'dist',       // output ke folder /dist
    assetsDir: 'assets',
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      host: 'localhost',
      clientPort: 8080,
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
