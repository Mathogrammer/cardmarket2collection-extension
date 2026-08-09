import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { CardmarketLanguage, CardmarketLanguageToLanguageCode } from "@/cardmarket";

export const formatPrice = (price: number): string => `€${price.toFixed(2)}`;

export const LanguageBadge: FC<{ language: CardmarketLanguage }> = ({ language }) => (
    <Badge variant="outline">{CardmarketLanguageToLanguageCode[language]}</Badge>
)

export const FoilBadge: FC<{ isFoil: boolean }> = ({ isFoil }) => (
    isFoil
        ? <Badge variant="secondary">Foil</Badge>
        : <span className="text-muted-foreground">—</span>
)
