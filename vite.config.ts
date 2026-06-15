import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const NAME = "korean-lunar-calendar";

// Library build: unminified ESM (.mjs) + CommonJS (.js) plus bundled type
// declarations (dist/index.d.ts). The minified browser/CDN bundle is produced
// separately by vite.config.browser.ts. Output paths are kept identical to the
// previously published layout so existing imports keep resolving.
export default defineConfig({
  plugins: [
    // bundleTypes rolls all .d.ts into a single dist/index.d.ts (via api-extractor);
    // tsconfig.build.json sets rootDir: 'src' so the entry lands at dist/index.d.ts.
    dts({
      include: ["src"],
      bundleTypes: true,
      tsconfigPath: "./tsconfig.build.json",
    }),
  ],
  build: {
    target: "es2020",
    minify: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      // ESM -> korean-lunar-calendar.mjs   CommonJS -> korean-lunar-calendar.js
      fileName: (format) => (format === "es" ? `${NAME}.mjs` : `${NAME}.js`),
    },
  },
});
