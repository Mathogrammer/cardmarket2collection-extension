import { Manifest } from "webextension-polyfill";
import pkg from "../package.json" with { type: 'json' };
import { cardmarketMatcher } from "./cardmarket.ts";
import { archidektMatcher } from "./archidekt.ts";

function buildSharedManifest(includeFileMatcher: boolean): Partial<Manifest.WebExtensionManifest> {
    return {
        content_scripts: [
            {
                js: ["src/entries/contentScript/cardmarket/main.tsx"],
                matches: includeFileMatcher ? [cardmarketMatcher, "file://*/*"] : [cardmarketMatcher],
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
        permissions: ["activeTab", "cookies", archidektMatcher],
    };
}

const action = {
    default_icon: {
        16: "icons/16.png",
        19: "icons/19.png",
        32: "icons/32.png",
        38: "icons/38.png",
    },
    default_title: "Archidekt Import"
};

function buildManifestV2(includeFileMatcher: boolean): Partial<Manifest.WebExtensionManifest> {
    const sharedManifest = buildSharedManifest(includeFileMatcher);

    return {
        ...(sharedManifest as Manifest.WebExtensionManifest),
        manifest_version: 2,
        background: {
            scripts: ["src/entries/background/script.ts"],
            persistent: true,
        },
        page_action: {
            ...action,
            show_matches: includeFileMatcher ? [cardmarketMatcher, "file://*/*"] : [cardmarketMatcher]
        } as Manifest.WebExtensionManifestPageActionType,
        browser_action: {
            ...action,
        },
        browser_specific_settings: {
            gecko: {
                id: "088a93a35b412daaf91f9c44d5bb3a50ae92ce39@non-signed-addon"
            }
        },
        permissions: [...sharedManifest.permissions ?? [], "tabs"] as chrome.runtime.ManifestPermission[],
    };
}

function buildManifestV3(includeFileMatcher: boolean): Partial<chrome.runtime.ManifestV3> {
    const sharedManifest = buildSharedManifest(includeFileMatcher);

    return {
        ...(sharedManifest as chrome.runtime.ManifestV3),
        manifest_version: 3,
        action: action,
        background: {
            service_worker: "src/entries/background/serviceWorker.ts",
            type: "module",
        },
        host_permissions: [archidektMatcher],
        permissions: [...sharedManifest.permissions ?? [], "declarativeContent"] as chrome.runtime.ManifestPermission[],
    };
}

export function getManifest(manifestVersion: number, mode: string): Manifest.WebExtensionManifest | chrome.runtime.ManifestV3 {
    const manifest = {
        author: pkg.author,
        description: pkg.description,
        name: pkg.displayName ?? pkg.name,
        version: pkg.version,
    };

    const includeFileMatcher = mode !== "production";

    if (manifestVersion === 2) {
        return {
            ...manifest,
            ...buildManifestV2(includeFileMatcher),
        } as Manifest.WebExtensionManifest;
    }

    if (manifestVersion === 3) {
        return {
            ...manifest,
            ...buildManifestV3(includeFileMatcher),
        } as chrome.runtime.ManifestV3;
    }

    throw new Error(
        `Missing manifest definition for manifestVersion ${manifestVersion}`
    );
}
