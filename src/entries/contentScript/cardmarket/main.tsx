import React from "react";
import ReactDOM from "react-dom/client";
import browser from "webextension-polyfill";
import { GetCardsResponse, CardTableData, MESSAGE_GET_CARDS } from "@/messages";
import "../../enableDevHmr";
import renderContent from "../renderContent";
import App from './App';
import { CardmarketLanguage } from "@/cardmarket";

browser.runtime.onMessage.addListener((data: unknown) => {
    console.log("Receiving message", data);

    if (typeof data === "object" && data && "type" in data && data.type === MESSAGE_GET_CARDS) {
        console.log("Getting cards");

        return getCardTableData().then((result) => {
            console.log("sending result", result);
            return result;
        });
    }
});

console.log("Content script loaded");

// Cardmarket's image host is behind Cloudflare bot management, which blocks script-initiated
// fetch() requests (different Sec-Fetch-Dest/fingerprint than a real image load) even with the
// right cookies attached. So instead of fetch(), we load the image the same way the page itself
// does — via a real <img> element — and read the pixels back out through a canvas.
const loadImageViaCanvas = (url: string): Promise<string | undefined> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const context = canvas.getContext("2d");
                if (!context) {
                    throw new Error("Could not get 2d canvas context");
                }
                context.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg"));
            } catch (error) {
                console.warn("Failed to extract Cardmarket image via canvas", url, error);
                resolve(undefined);
            }
        };

        img.onerror = () => {
            console.warn("Failed to load Cardmarket image", url);
            resolve(undefined);
        };

        img.src = url;
    });
}

// Cap concurrency and stagger requests so we don't fetch every card image in
// an order at once — keeps our traffic pattern close to a human hovering
// row by row instead of a burst of simultaneous requests.
const IMAGE_LOAD_CONCURRENCY = 4;
const IMAGE_LOAD_STAGGER_MS = 75;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const loadCardImages = async (cards: CardTableData[]): Promise<void> => {
    let nextIndex = 0;

    const worker = async () => {
        while (nextIndex < cards.length) {
            const card = cards[nextIndex++];
            if (card.imageUrl) {
                card.imageUrl = await loadImageViaCanvas(card.imageUrl);
            }
            if (nextIndex < cards.length) {
                await delay(IMAGE_LOAD_STAGGER_MS);
            }
        }
    };

    const workerCount = Math.min(IMAGE_LOAD_CONCURRENCY, cards.length);
    await Promise.all(Array.from({ length: workerCount }, worker));
}

const getCardTableData = async (): Promise<GetCardsResponse> => {
    const tables = document.getElementsByTagName("table");
    const result: GetCardsResponse = {
        response: [],
    };

    for (const table of tables) {
        const cards = getCardDataFromTable(table);
        result.response.push(...cards);
    }

    await loadCardImages(result.response);

    console.log("Returning result");

    return result;
}

const getCardDataFromTable = (table: HTMLTableElement): CardTableData[] => {
    const rows = table.querySelectorAll<HTMLTableRowElement>("tr[data-product-id]");
    const cards: CardTableData[] = [];
    for (const row of rows) {
        const name = row.dataset.name!;
        const languageNumber = Number(row.dataset.language);
        const language: CardmarketLanguage = languageNumber;
        const expansionName = row.dataset.expansionName!;
        const amount = Number(row.dataset.amount);
        const productId = Number(row.dataset.productId);
        const isFoil = row.querySelector<HTMLSpanElement>('span[aria-label="Foil"]') != null;
        const price = Number(row.dataset.price);
        const condition = Number(row.dataset.condition);
        const collectorNumber = row.dataset.number!;
        const thumbnailTitle = row.querySelector<HTMLSpanElement>("td.preview span.thumbnail-icon")?.dataset.bsTitle;
        const imageUrl = thumbnailTitle?.match(/src="([^"]+)"/)?.[1];

        // TODO Incorporate amount into return value
        console.log("Querying productId", productId, ". Name: ", row.dataset.name, "amount: ", amount);

        if (!Number.isNaN(productId) && productId > 0) {
            cards.push({
                name,
                productId,
                amount,
                language,
                expansionName,
                isFoil,
                price,
                condition,
                collectorNumber,
                imageUrl,
            });
        }
    }

    return cards;
}

renderContent(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS, (appRoot) => {
    ReactDOM.createRoot(appRoot).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
});
