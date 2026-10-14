import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const core = fileURLToPath(new URL("./src/core.ts", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: "./",
  plugins: [react()],
  resolve: {
    // The shared editor imports the model barrel, which also pulls in Connect-only hooks.
    // The app maps it to a slim entry with just the reducer, actions, types and engine.
    alias: [{ find: /^document-models\/quit-journey(\/v1)?$/, replacement: core }],
    dedupe: ["react", "react-dom"],
  },
  server: { fs: { allow: [".."] } },
  build: { outDir: "dist", emptyOutDir: true, target: "es2022" },
});
