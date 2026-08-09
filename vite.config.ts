import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import { getManifest } from "./src/manifest.ts";
import tailwindcss from '@tailwindcss/vite';
import { emitResultPageHtml } from "./src/emitResultPageHtml.ts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      minify: false,
    },
    plugins: [
      react(),
      webExtension({
        manifest: getManifest(Number(env.MANIFEST_VERSION)),
        additionalInputs: {
          scripts: [
            {
              fileName: "src/result-page/main.tsx",
              webAccessible: false,
            },
          ],
        }
      }) as Plugin,
      tailwindcss(),
      emitResultPageHtml(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
