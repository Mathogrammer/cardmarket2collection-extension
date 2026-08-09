import { Runtime } from "webextension-polyfill";
import { ArchidektCredentials } from "./archidekt";
import { CardmarketCondition, CardmarketLanguage, ResultFound, ResultMissing } from "./cardmarket";

export type Message = {
    [x: string]: any
    type: string;
}

export type CardTableData = {
    name: string,
    productId: number,
    condition: CardmarketCondition,
    collectorNumber: string,
    language: CardmarketLanguage,
    amount: number,
    expansionName: string,
    isFoil: boolean,
    price: number,
}

export type GetCardsResponse = {
    response: CardTableData[]
}

export type CardQueryResponse = {
    cards: ResultFound[],
    fallbackCards: ResultFound[],
    missingCards: ResultMissing[]
}

export type ImportCardToArchidektMessage = Message & {
    cards: ResultFound[],
    archidektCredentials: ArchidektCredentials,
}

export const MESSAGE_GET_CARDS = "GET_CARDS";
export const MESSAGE_QUERY_CARDS = "QUERY_CARDS";
export const ROUNDABOUT_MESSAGE = "ROUNDABOUT_MESSAGE";
export const RESULT_PAGE_READY = "RESULT_PAGE_READY";
export const IMPORT_CARDS_TO_ARCHIDEKT = "IMPORT_CARDS_TO_ARCHIDEKT";
export const IMPORT_SUCCESS = "IMPORT_SUCCESS";

export const makeMessageListener = (listener: (message: Message, sender: Runtime.MessageSender) => void): ((message: unknown, sender: Runtime.MessageSender) => void) => {
    return (message, sender) => {
        if (typeof message !== "object") {
            console.error("Received non-object message, aborting.", message);
            return;
        }
        if (message === null) {
            console.error("Received null message, aborting.");
            return;
        }
        if ("type" in message && typeof message.type === "string" && "data" in message) {
            listener(message as Message, sender)
        }
        else {
            console.error("Received unknown message, aborting.", message);
        }
    }
}