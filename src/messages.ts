import { Card } from "scryfall-sdk";

export type Message = {
    [x: string]: any
    type: string;
}

export type CardQueryResponse = {
    cards: Card[],
    missingCards: {
        name: string,
        productId: number,
    }[]
}

export const MESSAGE_QUERY_CARDS = "QUERY_CARDS";