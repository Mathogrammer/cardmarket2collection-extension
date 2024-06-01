import { Card, Cards } from "scryfall-sdk";
import { CardTableData } from "./messages";

export const cardmarketBase = "cardmarket.com";
export const cardmarketMatcher = `*://*.${cardmarketBase}/*`;

export enum CardmarketLanguage {
    ENGLISH = 1,
    FRENCH,
    GERMAN,
    SPANISH,
    ITALIAN,
}

export enum CardmarketCondition {
    MINT = 1,
    NEAR_MINT,
    EXCELLENT,
    GOOD,
    LIGHT_PLAYED,
    PLAYED,
    POOR,
}

export const CardmarketConditionToName = {
    [CardmarketCondition.MINT]: "Mint",
    [CardmarketCondition.NEAR_MINT]: "Near Mint",
    [CardmarketCondition.EXCELLENT]: "Excellent",
    [CardmarketCondition.GOOD]: "Good",
    [CardmarketCondition.LIGHT_PLAYED]: "Light Played",
    [CardmarketCondition.PLAYED]: "Played",
    [CardmarketCondition.POOR]: "Poor",
} as const;

export const CardmarketConditionToArchidektCondition = {
    [CardmarketCondition.MINT]: "Near Mint",
    [CardmarketCondition.NEAR_MINT]: "Near Mint",
    [CardmarketCondition.EXCELLENT]: "Lightly Played",
    [CardmarketCondition.GOOD]: "Light Played",
    [CardmarketCondition.LIGHT_PLAYED]: "Moderately Played",
    [CardmarketCondition.PLAYED]: "Heavily Played",
    [CardmarketCondition.POOR]: "Damaged",
} as const;

export const CardmarketLanguageToLanguageCode = {
    [CardmarketLanguage.ENGLISH]: "EN",
    [CardmarketLanguage.FRENCH]: "FR",
    [CardmarketLanguage.GERMAN]: "DE",
    [CardmarketLanguage.SPANISH]: "ES",
    [CardmarketLanguage.ITALIAN]: "IT",
} as const;

export enum ResultTypes {
    MISSING = "MISSING",
    FALLBACK = "FALLBACK",
    CARDMARKET_ID = "CARDMARKET_ID"
}

export type ResultFound = {
    resultType: ResultTypes.CARDMARKET_ID | ResultTypes.FALLBACK,
    card: Card,
    amount: number,
    language: CardmarketLanguage,
    condition: CardmarketCondition,
    isFoil: boolean,
    price: number,
};

export type ResultMissing = {
    resultType: ResultTypes.MISSING,
    name: string | undefined,
    productId: number,
    language: CardmarketLanguage,
    condition: CardmarketCondition,
    amount: number,
    expansionName: string | undefined,
    isFoil: boolean,
    price: number,
};
export type Result = ResultFound | ResultMissing

const getCardFallback = async (cardTableData: CardTableData): Promise<Card> => {
    const { collectorNumber, name } = cardTableData;

    const queryResult = await (await Cards.byName(name, true)).getPrints();
    // Include expansion name and language number
    const cardResult = queryResult.find(it => it.collector_number === collectorNumber);
    if (!cardResult)
        throw new Error(`Unable to find matching card data in scryfall\n\tName: ${name}, Collector #: ${collectorNumber}`);

    return cardResult;
}

export const getCardFromProductId = async (cardTableData: CardTableData) => {
    const { productId, amount, language, isFoil, price, condition } = cardTableData;
    if (!Number.isNaN(productId) && productId > 0) {
        let card: ResultFound | ResultMissing;
        try {
            const scryfallResult = await Cards.byCardmarketId(productId);
            card = {
                resultType: ResultTypes.CARDMARKET_ID,
                card: scryfallResult,
                amount,
                language,
                isFoil,
                price,
                condition,
            };
        } catch (error) {
            console.warn("Could not find card with productId", productId, error);
            try {
                const fallbackResult = await getCardFallback(cardTableData);
                card = {
                    resultType: ResultTypes.FALLBACK,
                    card: fallbackResult,
                    amount,
                    language,
                    isFoil,
                    price,
                    condition,
                };
            } catch (fallbackError) {
                console.warn("Unable to fetch:", fallbackError);
                card = {
                    resultType: ResultTypes.MISSING,
                    ...cardTableData
                };
            }
        }
        return card;
    }
}