import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import browser from "webextension-polyfill";
import { ArchidektCredentials } from '~/archidekt';
import { CardmarketConditionToArchidektCondition, CardmarketLanguageToLanguageCode, ResultFound, ResultMissing, ResultTypes, getCardFromProductId } from '~/cardmarket';
import { CardTableData, IMPORT_CARDS_TO_ARCHIDEKT, IMPORT_SUCCESS, ImportCardToArchidektMessage, Message } from '~/messages';
import { CardItem } from './CardItem';
import './Cards.css';

export type CardListProps = {
    cardTableData: CardTableData[],
    archidektCredentials: Partial<ArchidektCredentials>
}

const sendImportMessage = (cards: ResultFound[], archidektCredentials: ArchidektCredentials) => {
    const message: ImportCardToArchidektMessage = { type: IMPORT_CARDS_TO_ARCHIDEKT, cards, archidektCredentials };
    console.log("Sending import message", message);
    browser.runtime.sendMessage(message);
}

export const CardList: FC<CardListProps> = ({ cardTableData, archidektCredentials }) => {
    const [cards, setCards] = useState<ResultFound[]>();
    const [fallbackCards, setFallbackCards] = useState<ResultFound[]>();
    const [missingCards, setMissingCards] = useState<ResultMissing[]>();
    const [isImporting, setIsImporting] = useState(false);

    const allCards = useMemo(() => cards && fallbackCards && [...cards, ...fallbackCards], [cards, fallbackCards]);

    const getCards = useCallback(async (cardTableData: CardTableData[]) => {
        const cards: ResultFound[] = [];
        const fallbackCards: ResultFound[] = [];
        const missingCards: ResultMissing[] = [];

        for (const cardData of cardTableData) {
            const data = await getCardFromProductId(cardData);
            if (data === undefined) {
                continue;
            }
            switch (data.resultType) {
                case ResultTypes.CARDMARKET_ID:
                    cards.push(data);
                    break;
                case ResultTypes.FALLBACK:
                    fallbackCards.push(data);
                    break;
                case ResultTypes.MISSING:
                    missingCards.push(data);
                    break;
                default:
                    continue;
            }
        }

        setCards(cards);
        setFallbackCards(fallbackCards);
        setMissingCards(missingCards);
    }, []);

    useEffect(() => {
        getCards(cardTableData);
    }, [cardTableData]);

    const handleImport = useCallback((cards: ResultFound[], archidektCredentials: ArchidektCredentials) => {
        sendImportMessage(cards, archidektCredentials);
        setIsImporting(true);
    }, []);

    useEffect(() => {
        if (isImporting) {
            const listener = (message: Message) => {
                if (message.type === IMPORT_SUCCESS) {
                    setIsImporting(false);
                }
            }
            browser.runtime.onMessage.addListener(listener);

            return () => {
                browser.runtime.onMessage.removeListener(listener);
            }
        }
    }, [isImporting]);

    const importButton = useMemo(() => {
        const { username, password } = archidektCredentials;

        if (allCards === undefined) {
            return (
                <button disabled={true}>
                    Loading...
                </button>
            );
        } else if (username === undefined || password === undefined) {
            return (
                <button disabled={true}>
                    To import, please fill in Archidekt credentials
                </button>
            );
        }

        return (
            <button disabled={isImporting} onClick={() => handleImport(allCards, { username, password })}>
                {!isImporting ? "Import to Archidekt" : "Importing..."}
            </button>
        )
    }, [isImporting, allCards, archidektCredentials, handleImport]);

    const handleCsvExport = useCallback((cards: ResultFound[]) => {
        return () => {
            const csvContent = cards.map(it => (
                `${it.amount},"${it.card.id}","${it.isFoil ? "Foil" : "Normal"}","${CardmarketLanguageToLanguageCode[it.language]}",${it.price},"${CardmarketConditionToArchidektCondition[it.condition]}"`
            )).join("\n");
            const csv = `Amount,ScryfallId,Foil,Language,Price,Condition\n${csvContent}\n`
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cards.csv';
            a.click();
            URL.revokeObjectURL(url);
        }
    }, []);


    if (cards === undefined || fallbackCards === undefined || missingCards === undefined || allCards === undefined) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div>
            <h4>Cards found: </h4>
            <ul>
                {cards.map(it => (<CardItem result={it} />))}
            </ul>
            <h4>Cards found using fallback method (please check for correctness!): </h4>
            <ul>
                {fallbackCards.map(it => (<CardItem result={it} />))}
            </ul>
            <h4>Cards that couldn't be found: </h4>
            {/* <ul> */}
            <div className='missing-cards'>
                {missingCards.map(it => (
                    `[${it.productId},${it.amount},"${it.name}","${it.isFoil ? "Foil" : "Normal"}","${it.expansionName}","${CardmarketLanguageToLanguageCode[it.language]}",${it.price},"${CardmarketConditionToArchidektCondition[it.condition]}"]\n`
                ))}
            </div>
            {importButton}
            <button onClick={handleCsvExport(allCards)}>
                Als CSV exportieren
            </button>
        </div>
    )
}