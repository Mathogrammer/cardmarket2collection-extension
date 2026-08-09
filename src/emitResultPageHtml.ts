// src/emitResultPageHtml.ts
import type { Plugin, Rollup } from "vite";

const RESULT_PAGE_ENTRY = "src/result-page/main.tsx";
const RESULT_PAGE_HTML_OUT = "src/result-page/index.html";

/**
 * @samrum/vite-plugin-web-extension no longer emits index.html for
 * additionalInputs entries correctly on modern Vite (it relies on
 * Vite's internal build manifest, whose shape has changed since the
 * plugin was last updated). The JS chunk for src/result-page/main.tsx
 * still builds fine though (that's plain Rollup output), so we just
 * locate that chunk here and hand-write the HTML shell that points to it.
 */
export function emitResultPageHtml(): Plugin {
    return {
        name: "emit-result-page-html",
        apply: "build",
        enforce: "post",
        generateBundle(_options, bundle) {
            const chunk = Object.values(bundle).find(
                (file): file is Rollup.OutputChunk =>
                    file.type === "chunk" &&
                    file.isEntry &&
                    !!file.facadeModuleId &&
                    file.facadeModuleId.replace(/\\/g, "/").endsWith(RESULT_PAGE_ENTRY)
            );

            if (!chunk) {
                this.warn(
                    `emit-result-page-html: could not find built chunk for ${RESULT_PAGE_ENTRY}. ` +
                    `Is it still listed under additionalInputs.scripts in vite.config.ts?`
                );
                return;
            }

            const cssFiles = Array.from(chunk.viteMetadata?.importedCss ?? []);
            const cssLinks = cssFiles
                .map((href) => `    <link rel="stylesheet" href="/${href}" />`)
                .join("\n");

            const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Archidekt Import Results</title>
${cssLinks}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/${chunk.fileName}"></script>
  </body>
</html>
`;

            this.emitFile({
                type: "asset",
                fileName: RESULT_PAGE_HTML_OUT,
                source: html,
            });
        },
    };
}