import { defineConfig } from "vite";
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  server: {
    // split sprites are ~80k+ files; watching them freezes / starves the
    // dev server. They only change when build-sprites.js is re-run.
    watch: {
      ignored: ["**/public/sprites/split/**"],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "predict-offspring": resolve(__dirname, "predict-offspring.html"),
        "family-tree": resolve(__dirname, "family-tree.html"),
        "scene": resolve(__dirname, "scene.html"),
        "mods": resolve(__dirname, "mods.html"),
      }
    },
    sourcemap: true,
  },
});
