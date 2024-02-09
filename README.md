# cardmarket2collection-extension

A cross-browser extension which scrapes a page on [Cardmarket](https://cardmarket.com) for tables containing MtG Card data to then import into one's collection on [Archidekt](https://archidekt.com). Currently supporting Firefox and Chrome.

(Based on `@samrum/create-vite-plugin-web-extension` for developing a React cross-browser web extension in Vite.)

## Usage Notes

The extension manifest is defined in `src/manifest.js` and used by `@samrum/vite-plugin-web-extension` in the vite config.

Background, content scripts, options, and popup entry points exist in the `src/entries` directory.

Content scripts are rendered by `src/entries/contentScript/renderContent.js` which renders content within a ShadowRoot
and handles style injection for HMR and build modes.

Otherwise, the project functions just like a regular Vite project.

To switch between Manifest V2 and Manifest V3 builds, either define the MANIFEST_VERSION environment variable or use the corresponding npm script.

HMR during development in Manifest V3 requires Chromium version >= 110.0.5480.0.

Refer to [@samrum/vite-plugin-web-extension](https://github.com/samrum/vite-plugin-web-extension) for more usage notes.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
pnpm install
```

## Commands

### Build

#### Development, HMR

Hot Module Reloading is used to load changes inline without requiring extension rebuilds and extension/page reloads
Currently only works in Chromium based browsers.

```sh
pnpm run dev
```

#### Development, Watch

Rebuilds extension on file changes. Requires a reload of the extension (and page reload if using content scripts)

```sh
pnpm run watch
```

#### Production

Minifies and optimizes extension build

```sh
pnpm run build
```

### Load extension in browser

Loads the contents of the dist directory into the specified browser

```sh
pnpm run serve:chrome
```

```sh
pnpm run serve:firefox
```
