import { Card, Cards, setFuzzySearch, Sets } from "scryfall-sdk";
import { CardTableData } from "./messages.ts";
import fuzzysort from "fuzzysort";

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
    alternatives?: Card[],
    amount: number,
    language: CardmarketLanguage,
    condition: CardmarketCondition,
    isFoil: boolean,
    price: number,
    cardmarketImageUrl?: string,
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
    cardmarketImageUrl?: string,
};
export type Result = ResultFound | ResultMissing

setFuzzySearch((search, targets, key) => {
    // `search` is the user-inputted string
    // `targets` are the objects to search through (in `Scry.Sets.byName` these are `Set` objects)
    // `key` is the key in the targets to search on
    return fuzzysort.go(search, targets, { key: key.toString() })[0]?.obj;
})

const getCardFallback = async (cardTableData: CardTableData): Promise<Card> => {
    const { collectorNumber, name } = cardTableData;

    const queryResult = await (await Cards.byName(name, true)).getPrints();
    // Include expansion name and language number
    const cardResult = queryResult.find(it => it.collector_number === /\d+/.exec(collectorNumber)?.[0]);
    if (!cardResult)
        throw new Error(`Unable to find matching card data in scryfall\n\tName: ${name}, Collector #: ${collectorNumber}`);

    return cardResult;
}

export const getCardsFromProductId = async (cardTableData: CardTableData): Promise<(ResultFound | ResultMissing)[] | undefined> => {
    const { productId, amount, language, isFoil, price, condition, imageUrl } = cardTableData;
    if (!Number.isNaN(productId) && productId > 0) {
        let cards: (ResultFound | ResultMissing)[];
        try {
            const scryfallResult = await Cards.byCardmarketId(productId);
            cards = [{
                resultType: ResultTypes.CARDMARKET_ID,
                card: scryfallResult,
                amount,
                language,
                isFoil,
                price,
                condition,
                cardmarketImageUrl: imageUrl,
            }];
        } catch (error) {
            console.warn("Could not find card with productId", productId, error);
            try {
                if (cardTableData.name.toLowerCase().includes("token")) {
                    let setName = cardTableData.expansionName.replace(": Extras", "").replace("Commander: ", "").replaceAll(":", "").replace(/ ?Tokens?/i, "") + " Tokens";
                    const set = await Sets.byName(setName, true);
                    let collectorNumbers = /(\d+)\/(\d+)/g.exec(cardTableData.collectorNumber)?.slice(1);
                    if (!collectorNumbers) {
                        collectorNumbers = /\d+/.exec(cardTableData.collectorNumber)?.slice(0);
                    }
                    const results: Card[][] = [];
                    const missingCards: ResultMissing[] = [];
                    try {
                        if (!collectorNumbers || collectorNumbers.length <= 0) {
                            throw Error("No collector numbers found.");
                        }
                        for (const collectorNumber of collectorNumbers) {
                            const card = await Cards.bySet(set, collectorNumber);
                            results.push([card]);
                        }
                    } catch (e) {
                        console.error("Falling back to attribute search for tokens. Reason: ", e);
                        const names = cardTableData.name.split("//");
                        for (let i = 0; i < names.length; i++) {
                            const name = names[i];
                            let [_, tokenName, details, colours, power, toughness, keywords] = (/([^\(]+) Token( \((\w+) ([\d\*\+]+)\/([\d\*\+]+)(?: ([^\)]+))?\))?/gi.exec(name) ?? []) as (string | undefined)[];
                            if (!tokenName) {
                                throw Error(`Card includes \"Token\" but doesn't have a name. Parsed title: ${name}`);
                            }
                            const isArtifact = colours?.includes("A") ?? false;
                            colours = colours?.replace("A", "");
                            details = details?.trim();
                            keywords = keywords?.trim();

                            let searchString = `is:extra ${tokenName} set:"${set.name}"`;
                            if (colours) {
                                searchString += ` c=${colours}`;
                            }
                            if (isArtifact) {
                                searchString += ` t:artifact`;
                            }
                            if (power && !isNaN(power as unknown as number)) {
                                searchString += ` pow:${power}`
                            }
                            if (toughness && !isNaN(toughness as unknown as number)) {
                                searchString += ` tou:${toughness}`;
                            }
                            if (keywords) {
                                searchString += ` o:"${keywords}"`;
                            }
                            try {
                                const candidates = (await Cards.search(searchString).waitForAll()).slice(0, 10);
                                if (candidates.length > 0) {
                                    results.push(candidates);
                                }
                                else {
                                    console.warn(`Did not find any results for ${cardTableData.name}.`);
                                    missingCards.push({
                                        resultType: ResultTypes.MISSING,
                                        ...cardTableData,
                                        cardmarketImageUrl: imageUrl,
                                    });
                                }
                            }
                            catch (e) {
                                console.warn('Error executing fallback', e);
                                missingCards.push({
                                    resultType: ResultTypes.MISSING,
                                    ...cardTableData,
                                    cardmarketImageUrl: imageUrl,
                                });
                            }
                        }
                    }
                    return [
                        ...results.filter(it => it.length > 0).map(candidates => ({
                            resultType: ResultTypes.FALLBACK,
                            card: candidates[0],
                            alternatives: candidates.length > 1 ? candidates : undefined,
                            amount,
                            language,
                            isFoil,
                            price,
                            condition,
                            cardmarketImageUrl: imageUrl,
                        } satisfies ResultFound)),
                        ...missingCards,
                    ]
                }
                else {
                    const fallbackResult = await getCardFallback(cardTableData);
                    cards = [{
                        resultType: ResultTypes.FALLBACK,
                        card: fallbackResult,
                        amount,
                        language,
                        isFoil,
                        price,
                        condition,
                        cardmarketImageUrl: imageUrl,
                    }];
                }
            } catch (fallbackError) {
                console.warn("Unable to fetch:", fallbackError);
                cards = [{
                    resultType: ResultTypes.MISSING,
                    ...cardTableData,
                    cardmarketImageUrl: imageUrl,
                }];
            }
        }
        return cards;
    }
}