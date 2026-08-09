import { FC } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { CardmarketConditionToName } from "@/cardmarket";
import { CardTableData } from "@/messages";
import { FoilBadge, LanguageBadge, formatPrice } from "./card-table-cells";

type ScannedCardsTableProps = {
    cardTableData: CardTableData[],
}

export const ScannedCardsTable: FC<ScannedCardsTableProps> = ({ cardTableData }) => {
    return (
        <details className="group overflow-hidden rounded-xl bg-card text-sm text-card-foreground shadow-xs ring-1 ring-foreground/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-6 marker:hidden hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
                <span className="font-heading text-base font-medium">Scanned cards</span>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{cardTableData.length}</Badge>
                    <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </div>
            </summary>
            <div className="px-6 pb-6">
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
                        {cardTableData.map((card) => (
                            <TableRow key={card.productId}>
                                <TableCell className="max-w-64 min-w-40 font-medium whitespace-normal">{card.name}</TableCell>
                                <TableCell className="max-w-48 min-w-32 whitespace-normal text-muted-foreground">{card.expansionName}</TableCell>
                                <TableCell>{CardmarketConditionToName[card.condition]}</TableCell>
                                <TableCell><LanguageBadge language={card.language} /></TableCell>
                                <TableCell><FoilBadge isFoil={card.isFoil} /></TableCell>
                                <TableCell>{formatPrice(card.price)}</TableCell>
                                <TableCell className="text-right">{card.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </details>
    )
}
