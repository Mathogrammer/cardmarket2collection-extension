import "../../enableDevHmr";
import React from "react";
import ReactDOM from "react-dom/client";
import renderContent from "../renderContent";
import App from "./App";
import * as scryfall from "scryfall-sdk";
import browser from "webextension-polyfill";
import { CardQueryResponse, MESSAGE_QUERY_CARDS, Message } from "~/messages";

browser.runtime.onMessage.addListener((data: Message | undefined, sender, sendResponse: (response: any) => void) => {
    console.log("Receiving message", data);

    if (data?.type === MESSAGE_QUERY_CARDS) {
        getCards().then((result) => {
            console.log("sending result", result);
            sendResponse(result);
        })
        return true;
    }
});

console.log("Content script loaded");

const getCardFallback = async (row: HTMLTableRowElement): Promise<scryfall.Card> => {
    const collectorNumber = row.dataset.number;
    // TODO: trim Cardmarket-only stuff, e.g. in parentheses
    const name = row.dataset.name;
    if (!name)
        throw new Error("Unable to find card data in table row");

    const languageNumber = Number(row.dataset.language);
    const expansionName = row.dataset.expansionName;

    const queryResult = await (await scryfall.Cards.byName(name, true)).getPrints();
    // Include expansion name and language number
    const cardResult = queryResult.find(it => it.collector_number === collectorNumber);
    if (!cardResult)
        throw new Error("Unable to find matching card data in scryfall");

    return cardResult;
}

const getCardsFromTable = async (table: HTMLTableElement) => {
    const rows = table.querySelectorAll<HTMLTableRowElement>("tr[data-product-id]");
    const cards = [];
    for (const row of rows) {
        const productId = Number(row.dataset.productId);
        const amount = Number(row.dataset.amount);

        // TODO Incorporate amount into return value
        console.log("Retrieved productId", productId, ". Name: ", row.dataset.name, "amount: ", amount);

        if (!Number.isNaN(productId) && productId > 0) {
            const card = scryfall.Cards.byCardmarketId(productId)
                .then(it => ({ missing: false, card: it }))
                .catch((error => {
                    // TODO: Use fallback
                    console.warn("Could not find card with productId", productId, row.dataset.name, error);
                    return { missing: true, name: row.dataset.name, productId };
                }));
            cards.push(card);
        }
    }

    return Promise.all(cards);
}

export const getCards = async () => {
    const tables = document.getElementsByTagName("table");
    const result: CardQueryResponse = {
        cards: [],
        missingCards: [],
    };
    for (const table of tables) {
        const cards = await getCardsFromTable(table);
        const foundCards = cards.filter((it): it is { missing: boolean, card: scryfall.Card } => !it.missing);
        const missingCards = cards.filter((it): it is { missing: boolean, name: string, productId: number } => it.missing);
        result.cards = [
            ...result.cards,
            ...foundCards.map(it => it.card),
        ]
        result.missingCards = [
            ...result.missingCards,
            ...missingCards.map(({ name, productId }) => ({ name, productId })),
        ]
    }

    return result;
}

renderContent(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS, (appRoot) => {
    ReactDOM.createRoot(appRoot).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
});
