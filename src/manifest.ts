import { Manifest } from "webextension-polyfill";
import pkg from "../package.json";
import { cardmarketMatcher } from "./cardmarket";
import { archidektMatcher } from "./archidekt";


const sharedManifest: Partial<chrome.runtime.ManifestBase> = {
    content_scripts: [
        {
            js: ["src/entries/contentScript/cardmarket/main.tsx"],
            matches: [cardmarketMatcher, "file://*/*"],
        },
        {
            js: ["src/entries/contentScript/archidekt/main.tsx"],
            matches: [archidektMatcher, "file://*/*"],
        },
    ],
    icons: {
        16: "icons/16.png",
        19: "icons/19.png",
        32: "icons/32.png",
        38: "icons/38.png",
        48: "icons/48.png",
        64: "icons/64.png",
        96: "icons/96.png",
        128: "icons/128.png",
        256: "icons/256.png",
        512: "icons/512.png",
    },
    options_ui: {
        page: "src/entries/options/index.html",
        open_in_tab: true,
    },
    permissions: ["activeTab"] as chrome.runtime.ManifestPermissions[],
};

const action = {
    default_icon: {
        16: "icons/16.png",
        19: "icons/19.png",
        32: "icons/32.png",
        38: "icons/38.png",
    },
    default_popup: "src/entries/popup/index.html",
    default_title: "Archidekt Import"
};

const ManifestV2: Partial<chrome.runtime.ManifestV2> = {
    ...sharedManifest,
    manifest_version: 2,
    background: {
        scripts: ["src/entries/background/script.ts"],
        persistent: true,
    },
    page_action: {
        ...action,
        show_matches: [
            cardmarketMatcher, "file://*/*"
        ]
    } as Manifest.WebExtensionManifestPageActionType,
    browser_action: {
        ...action,
    },
    options_ui: {
        ...sharedManifest.options_ui,
        chrome_style: false,
    },
    permissions: [...sharedManifest.permissions, "tabs"] as chrome.runtime.ManifestPermissions[],
};

const ManifestV3: Partial<chrome.runtime.ManifestV3> = {
    ...sharedManifest,
    manifest_version: 3,
    action: action,
    background: {
        service_worker: "src/entries/background/serviceWorker.ts",
    },
    host_permissions: [],
    permissions: [...sharedManifest.permissions, "declarativeContent"] as chrome.runtime.ManifestPermissions[],
};

export function getManifest(manifestVersion: number): chrome.runtime.ManifestV2 | chrome.runtime.ManifestV3 {
    const manifest = {
        author: pkg.author,
        description: pkg.description,
        name: pkg.displayName ?? pkg.name,
        version: pkg.version,
    };

    if (manifestVersion === 2) {
        return {
            ...manifest,
            ...ManifestV2,
        } as chrome.runtime.ManifestV2;
    }

    if (manifestVersion === 3) {
        return {
            ...manifest,
            ...ManifestV3,
        } as chrome.runtime.ManifestV3;
    }

    throw new Error(
        `Missing manifest definition for manifestVersion ${manifestVersion}`
    );
}
