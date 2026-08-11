import { CardmarketConditionToArchidektCondition, CardmarketLanguageToLanguageCode, ResultFound, ResultMissing, getMissingCardFaceName } from "@/cardmarket";

export const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export const copyText = (content: string): Promise<void> => {
    return navigator.clipboard.writeText(content);
}

export const cardsToArchidektCsv = (cards: ResultFound[]): string => {
    const rows = cards.map(it => (
        `${it.amount},"${it.card.id}","${it.isFoil ? "Foil" : "Normal"}","${CardmarketLanguageToLanguageCode[it.language]}",${it.price},"${CardmarketConditionToArchidektCondition[it.condition]}"`
    )).join("\n");
    return `Amount,ScryfallId,Foil,Language,Price,Condition\n${rows}\n`;
}

export const cardsToTextList = (cards: ResultFound[]): string => {
    return cards.map(it => `${it.amount} ${it.card.name} (${it.card.set})`).join("\n");
}

export const missingCardsToCsv = (cards: ResultMissing[]): string => {
    const rows = cards.map(it => (
        `${it.productId},${it.amount},"${getMissingCardFaceName(it)}","${it.isFoil ? "Foil" : "Normal"}","${it.expansionName}","${CardmarketLanguageToLanguageCode[it.language]}",${it.price},"${CardmarketConditionToArchidektCondition[it.condition]}"`
    )).join("\n");
    return `ProductId,Amount,Name,Foil,Expansion,Language,Price,Condition\n${rows}\n`;
}
