import React from "react";
import ReactDOM from "react-dom/client";
import scryfall, { Card, Cards } from 'scryfall-sdk';
import browser from "webextension-polyfill";
import { CardQueryResponse, MESSAGE_QUERY_CARDS, Message } from "~/messages";
import { groupItemsBy } from '~/utils';
import "../../enableDevHmr";
import renderContent from "../renderContent";
import App from './App';

scryfall.setRetry(1, 500);
scryfall.setTimeout(100);

enum ResultTypes {
    MISSING = "MISSING",
    FALLBACK = "FALLBACK",
    CARDMARKET_ID = "CARDMARKET_ID"
}

type ResultFound = {
    resultType: ResultTypes.CARDMARKET_ID | ResultTypes.FALLBACK,
    card: Card,
    amount: number,
};

type ResultMissing = {
    resultType: ResultTypes.MISSING,
    name: string | undefined,
    productId: number
};
type Result = ResultFound | ResultMissing

browser.runtime.onMessage.addListener((data: Message | undefined, _sender, sendResponse: (response: any) => void) => {
    console.log("Receiving message", data);

    if (data?.type === MESSAGE_QUERY_CARDS) {
        console.log("Getting cards");

        getCards().then((result) => {
            console.log("sending result", result);
            sendResponse(result);
        })
        return true;
    }
});

console.log("Content script loaded");

const getCardFallback = async (row: HTMLTableRowElement): Promise<Card> => {
    const collectorNumber = row.dataset.number;
    // TODO: trim Cardmarket-only stuff, e.g. in parentheses
    const name = row.dataset.name;
    if (!name)
        throw new Error("Unable to find card data in table row");

    const languageNumber = Number(row.dataset.language);
    const expansionName = row.dataset.expansionName;

    const queryResult = await (await Cards.byName(name, true)).getPrints();
    // Include expansion name and language number
    const cardResult = queryResult.find(it => it.collector_number === collectorNumber);
    if (!cardResult)
        throw new Error(`Unable to find matching card data in scryfall\n\tName: ${name}, Collector #: ${collectorNumber}`);

    return cardResult;
}

const getCardsFromTable = async (table: HTMLTableElement): Promise<Result[]> => {
    const rows = table.querySelectorAll<HTMLTableRowElement>("tr[data-product-id]");
    const cards = [];
    for (const row of rows) {
        const productId = Number(row.dataset.productId);
        const amount = Number(row.dataset.amount);

        // TODO Incorporate amount into return value
        console.log("Querying productId", productId, ". Name: ", row.dataset.name, "amount: ", amount);

        if (!Number.isNaN(productId) && productId > 0) {
            const card = Cards.byCardmarketId(productId)
                .then((it): ResultFound => ({
                    resultType: ResultTypes.CARDMARKET_ID,
                    card: it,
                    amount,
                }))
                .catch((async (error) => {
                    console.warn("Could not find card with productId", productId, row.dataset.name, error);
                    return await getCardFallback(row)
                        .then((it): ResultFound => ({
                            resultType: ResultTypes.FALLBACK,
                            card: it,
                            amount,
                        }))
                        .catch((error): ResultMissing => {
                            console.warn("Unable to fetch:", error.message);
                            return {
                                resultType: ResultTypes.MISSING,
                                name: row.dataset.name, productId
                            };
                        })
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
        fallbackCards: [],
        missingCards: [],
    };
    for (const table of tables) {
        const cards = await getCardsFromTable(table);
        const {
            [ResultTypes.CARDMARKET_ID]: foundCards,
            [ResultTypes.FALLBACK]: fallbackCards,
            [ResultTypes.MISSING]: missingCards,
        } = groupItemsBy<Result, ResultTypes>(cards, 'resultType', ResultTypes);
        result.cards = [
            ...result.cards,
            ...(foundCards as ResultFound[]).map(it => it.card),
        ]
        result.fallbackCards = [
            ...result.fallbackCards,
            ...(fallbackCards as ResultFound[]).map(it => it.card)
        ]
        result.missingCards = [
            ...result.missingCards,
            ...(missingCards as ResultMissing[]).filter(
                (it): it is ResultMissing & { name: string } => it.name !== undefined
            ),
        ]
    }
    console.log("Returning result");

    return result;
}

renderContent(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS, (appRoot) => {
    ReactDOM.createRoot(appRoot).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
});
