import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: "dist/types",
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: "./src/main.ts",
      name: "TackSuiteChat",
      fileName: (format) => `tacksuite-widget.${format}.js`,
      formats: ["es", "umd"],
    },
  },
});
