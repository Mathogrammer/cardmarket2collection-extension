import { FC } from 'react'
import { AlertTriangle } from 'lucide-react'
import { CardmarketConditionToName, ResultFound } from '@/cardmarket'
import { TableRow, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { FoilBadge, LanguageBadge, formatPrice } from './card-table-cells'

type CardItemProps = {
    result: ResultFound,
    isFallback: boolean,
    selected: boolean,
    onSelectedChange: (selected: boolean) => void,
}

export const CardItem: FC<CardItemProps> = ({ result: { card, amount, isFoil, language, condition, price }, isFallback, selected, onSelectedChange }) => {
    return (
        <TableRow className={cn(selected && "bg-primary/10 hover:bg-primary/15")}>
            <TableCell>
                <Checkbox checked={selected} onCheckedChange={(checked) => onSelectedChange(checked)} />
            </TableCell>
            <TableCell className="max-w-64 min-w-40 font-medium whitespace-normal">
                <div className="flex items-center gap-1.5">
                    {isFallback && (
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Found via fallback search — please check for correctness
                            </TooltipContent>
                        </Tooltip>
                    )}
                    <span>{card.name}</span>
                </div>
            </TableCell>
            <TableCell className="max-w-48 min-w-32 whitespace-normal text-muted-foreground">{card.set_name}</TableCell>
            <TableCell>{CardmarketConditionToName[condition]}</TableCell>
            <TableCell><LanguageBadge language={language} /></TableCell>
            <TableCell><FoilBadge isFoil={isFoil} /></TableCell>
            <TableCell>{formatPrice(price)}</TableCell>
            <TableCell className="text-right">{amount}</TableCell>
        </TableRow>
    )
}
