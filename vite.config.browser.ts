import { resolve } from "node:path";
import { defineConfig } from "vite";

const NAME = "korean-lunar-calendar";

// Minified UMD bundle for the browser / CDN, exposing the global `KoreanLunarCalendar`.
// Emitted as dist/korean-lunar-calendar.min.js so existing <script>/jsDelivr links keep working.
// `emptyOutDir: false` preserves the ESM/CJS/types output produced by vite.config.ts.
export default defineConfig({
  build: {
    target: "es2019",
    // Vite 8 bundles with Rolldown and no longer ships esbuild; "oxc" is the
    // built-in minifier (esbuild would require installing it separately).
    minify: "oxc",
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "KoreanLunarCalendar",
      formats: ["umd"],
      fileName: () => `${NAME}.min.js`,
    },
  },
});
