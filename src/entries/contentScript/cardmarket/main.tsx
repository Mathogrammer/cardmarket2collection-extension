import React from "react";
import ReactDOM from "react-dom/client";
import browser from "webextension-polyfill";
import { GetCardsResponse, CardTableData, MESSAGE_GET_CARDS } from "@/messages";
import "../../enableDevHmr";
import renderContent from "../renderContent";
import App from './App';
import { CardmarketLanguage } from "@/cardmarket";

// @ts-ignore(2345): Returning true yields different semantics. Not sure why this is enforced here. 
browser.runtime.onMessage.addListener((data: unknown, _sender, sendResponse: (response: any) => void) => {
    console.log("Receiving message", data);

    if (typeof data === "object" && data && "type" in data && data.type === MESSAGE_GET_CARDS) {
        console.log("Getting cards");

        const result = getCardTableData();
        console.log("sending result", result);
        sendResponse(result);
    }
});

console.log("Content script loaded");

const getCardTableData = (): GetCardsResponse => {
    const tables = document.getElementsByTagName("table");
    const result: GetCardsResponse = {
        response: [],
    };

    for (const table of tables) {
        const cards = getCardDataFromTable(table);
        result.response.push(...cards);
    }
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
