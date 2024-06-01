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
export const FIREFOX_ROUNDABOUT_MESSAGE = "FIREFOX_ROUNDABOUT_MESSAGE";
export const RESULT_PAGE_READY = "RESULT_PAGE_READY";
export const IMPORT_CARDS_TO_ARCHIDEKT = "IMPORT_CARDS_TO_ARCHIDEKT";
export const IMPORT_SUCCESS = "IMPORT_SUCCESS";