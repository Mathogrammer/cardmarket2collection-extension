import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import browser from "webextension-polyfill";
import { Copy, Download, Loader2 } from 'lucide-react';
import { Card as ScryfallCard } from 'scryfall-sdk';
import { ArchidektCredentials } from '@/archidekt';
import { ResultFound, ResultMissing, ResultTypes, getCardsFromProductId } from '@/cardmarket';
import { CardTableData, IMPORT_CARDS_TO_ARCHIDEKT, IMPORT_SUCCESS, ImportCardToArchidektMessage, makeMessageListener, Message } from '@/messages';
import { CardItem } from './CardItem';
import { MissingCardsTable } from './MissingCardsTable';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cardsToArchidektCsv, cardsToTextList, copyText, downloadCsv } from '@/lib/csv';

export type CardListProps = {
    cardTableData: CardTableData[],
    archidektCredentials: Partial<ArchidektCredentials>
}

const sendImportMessage = (cards: ResultFound[], archidektCredentials: ArchidektCredentials) => {
    const message: ImportCardToArchidektMessage = { type: IMPORT_CARDS_TO_ARCHIDEKT, cards, archidektCredentials };
    browser.runtime.sendMessage(message);
}

export const CardList: FC<CardListProps> = ({ cardTableData, archidektCredentials }) => {
    const [cards, setCards] = useState<ResultFound[]>();
    const [fallbackCards, setFallbackCards] = useState<ResultFound[]>();
    const [missingCards, setMissingCards] = useState<ResultMissing[]>();
    const [isImporting, setIsImporting] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [showCopied, setShowCopied] = useState(false);

    const allCards = useMemo(() => cards && fallbackCards && [...cards, ...fallbackCards], [cards, fallbackCards]);

    const [prevCards, setPrevCards] = useState(allCards);

    if (prevCards !== allCards) {
        if (allCards !== undefined) {
            setSelectedIndices(new Set(allCards.map((_, index) => index)));
        }
        else {
            setSelectedIndices(new Set());
        }
        setPrevCards(allCards);
    }

    const selectedCards = useMemo(() => allCards?.filter((_, index) => selectedIndices.has(index)) ?? [], [allCards, selectedIndices]);

    const handleSelectedChange = useCallback((index: number, selected: boolean) => {
        setSelectedIndices(previous => {
            const next = new Set(previous);
            if (selected) {
                next.add(index);
            } else {
                next.delete(index);
            }
            return next;
        });
    }, []);

    const handleCardChange = useCallback((fallbackIndex: number, newCard: ScryfallCard) => {
        setFallbackCards(previous =>
            previous?.map((it, i) => (i === fallbackIndex ? { ...it, card: newCard } : it))
        );
    }, []);

    const getCards = useCallback(async (cardTableData: CardTableData[]) => {
        const cards: ResultFound[] = [];
        const fallbackCards: ResultFound[] = [];
        const missingCards: ResultMissing[] = [];

        for (const cardData of cardTableData) {
            const data = await getCardsFromProductId(cardData);
            if (data === undefined) {
                continue;
            }
            for (const card of data) {
                switch (card.resultType) {
                    case ResultTypes.CARDMARKET_ID:
                        cards.push(card);
                        break;
                    case ResultTypes.FALLBACK:
                        fallbackCards.push(card);
                        break;
                    case ResultTypes.MISSING:
                        missingCards.push(card);
                        break;
                    default:
                        continue;
                }
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
            const listener = makeMessageListener((message: Message) => {
                if (message.type === IMPORT_SUCCESS) {
                    setIsImporting(false);
                }
            });
            browser.runtime.onMessage.addListener(listener);

            return () => {
                browser.runtime.onMessage.removeListener(listener);
            }
        }
    }, [isImporting]);

    const importButtonLabel = useMemo(() => {
        const { username, password } = archidektCredentials;

        if (allCards === undefined) {
            return "Loading...";
        } else if (username === undefined || password === undefined) {
            return "Fill in Archidekt credentials to import";
        }
        return isImporting ? "Importing..." : "Import to Archidekt";
    }, [isImporting, allCards, archidektCredentials]);

    const importDisabled = allCards === undefined
        || archidektCredentials.username === undefined
        || archidektCredentials.password === undefined
        || isImporting
        || selectedCards.length === 0;

    const handleExportSelected = useCallback(() => {
        downloadCsv("cards.csv", cardsToArchidektCsv(selectedCards));
    }, [selectedCards]);

    const handleCopySelected = useCallback(() => {
        copyText(cardsToTextList(selectedCards)).then(() => {
            setShowCopied(true);
        });
    }, [selectedCards]);

    useEffect(() => {
        if (showCopied) {
            const timeout = setTimeout(() => setShowCopied(false), 1500);
            return () => clearTimeout(timeout);
        }
    }, [showCopied]);

    if (cards === undefined || fallbackCards === undefined || missingCards === undefined || allCards === undefined) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-primary">
                <Loader2 className="size-10 animate-spin" />
                <span className="text-lg font-medium">Matching cards against Scryfall...</span>
            </div>
        )
    }

    const allSelected = allCards.length > 0 && selectedCards.length === allCards.length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Cards found</CardTitle>
                    <CardDescription>Cards matched with rows flagged as fallback matches worth double-checking.</CardDescription>
                    <CardAction>
                        <Badge variant="secondary">{allCards.length}</Badge>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={(checked) => setSelectedIndices(checked ? new Set(allCards.map((_, index) => index)) : new Set())}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Set</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Language</TableHead>
                                <TableHead className='text-center'>Foil</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allCards.map((it, index) => (
                                <CardItem
                                    key={index}
                                    result={it}
                                    isFallback={index >= cards.length}
                                    selected={selectedIndices.has(index)}
                                    onSelectedChange={(selected) => handleSelectedChange(index, selected)}
                                    onCardChange={index >= cards.length ? (newCard) => handleCardChange(index - cards.length, newCard) : undefined}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Tooltip open={showCopied}>
                        <TooltipTrigger
                            render={
                                <Button variant="outline" onClick={handleCopySelected} disabled={selectedCards.length === 0}>
                                    <Copy /> Copy selected as list
                                </Button>
                            }
                        />
                        <TooltipContent>Copied!</TooltipContent>
                    </Tooltip>
                    <Button variant="outline" onClick={handleExportSelected} disabled={selectedCards.length === 0}>
                        <Download /> Export selected as CSV
                    </Button>
                    <Button onClick={() => handleImport(selectedCards, archidektCredentials as ArchidektCredentials)} disabled={importDisabled}>
                        {isImporting && <Loader2 className="animate-spin" />}
                        {importButtonLabel}
                    </Button>
                </CardFooter>
            </Card>

            <MissingCardsTable missingCards={missingCards} />
        </div>
    )
}
