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

// Fetched from within the content script (rather than the result page) so the request is
// same-origin to cardmarket.com and isn't rejected by the image host's CORS policy.
const fetchImageAsDataUrl = async (url: string): Promise<string | undefined> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Unexpected status ${response.status}`);
        }
        const blob = await response.blob();
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn("Failed to fetch Cardmarket image", url, error);
        return undefined;
    }
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

    await Promise.all(result.response.map(async (card) => {
        if (card.imageUrl) {
            card.imageUrl = await fetchImageAsDataUrl(card.imageUrl);
        }
    }));

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
