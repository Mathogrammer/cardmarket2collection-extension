import { FC, useCallback } from "react";
import { Copy, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { CardmarketConditionToName, ResultMissing } from "@/cardmarket";
import { copyText, downloadCsv, missingCardsToCsv } from "@/lib/csv";
import { FoilBadge, LanguageBadge, formatPrice } from "./card-table-cells";

type MissingCardsTableProps = {
    missingCards: ResultMissing[],
}

export const MissingCardsTable: FC<MissingCardsTableProps> = ({ missingCards }) => {
    const handleCopy = useCallback(() => {
        copyText(missingCardsToCsv(missingCards));
    }, [missingCards]);

    const handleExport = useCallback(() => {
        downloadCsv("missing-cards.csv", missingCardsToCsv(missingCards));
    }, [missingCards]);

    if (missingCards.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cards not found</CardTitle>
                <CardDescription>These cards couldn't be matched automatically. Export them to look up manually.</CardDescription>
                <CardAction>
                    <Badge variant="destructive">{missingCards.length}</Badge>
                </CardAction>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Set</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Foil</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {missingCards.map((it) => (
                            <TableRow key={it.productId}>
                                <TableCell className="max-w-64 min-w-40 font-medium whitespace-normal">{it.name}</TableCell>
                                <TableCell className="max-w-48 min-w-32 whitespace-normal text-muted-foreground">{it.expansionName}</TableCell>
                                <TableCell>{CardmarketConditionToName[it.condition]}</TableCell>
                                <TableCell><LanguageBadge language={it.language} /></TableCell>
                                <TableCell><FoilBadge isFoil={it.isFoil} /></TableCell>
                                <TableCell>{formatPrice(it.price)}</TableCell>
                                <TableCell className="text-right">{it.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button variant="outline" onClick={handleCopy}>
                    <Copy /> Copy as CSV
                </Button>
                <Button variant="outline" onClick={handleExport}>
                    <Download /> Export CSV
                </Button>
            </CardFooter>
        </Card>
    )
}
