import { FC } from "react";
import { Card } from "scryfall-sdk";
import { getSpecialFoilName } from "@/lib/foil";
import { cn } from "@/lib/utils";

type CardImagePreviewProps = {
    card: Card,
    isFoil: boolean,
    cardmarketImageUrl?: string,
}

const getScryfallImageUrl = (card: Card): string | undefined =>
    card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal;

const ImageFrame: FC<{ label: string, src?: string, isFoil?: boolean, foilName?: string }> = ({ label, src, isFoil, foilName }) => (
    <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="relative w-40 overflow-hidden rounded-lg border bg-muted">
            {src
                ? <img src={src} alt={label} className="block w-full" />
                : <div className="flex aspect-[5/7] w-full items-center justify-center p-2 text-center text-xs text-muted-foreground">No image found</div>
            }
            {isFoil && src && (
                <div
                    className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge"
                    style={{
                        backgroundImage: "linear-gradient(115deg, transparent 20%, #ff8a8a 30%, #ffe58a 40%, #8aff9e 50%, #8ad4ff 60%, #c58aff 70%, transparent 80%)",
                    }}
                />
            )}
            {foilName && src && (
                <div className="absolute inset-x-0 bottom-0 bg-red-600 py-1 text-center text-xs font-medium text-white">
                    {foilName}
                </div>
            )}
        </div>
    </div>
)

export const CardImagePreview: FC<CardImagePreviewProps> = ({ card, isFoil, cardmarketImageUrl }) => {
    const scryfallImageUrl = getScryfallImageUrl(card);
    const foilName = isFoil ? getSpecialFoilName(card) : undefined;

    return (
        <div className={cn("flex gap-3", !cardmarketImageUrl && "justify-center")}>
            <ImageFrame label="Scryfall" src={scryfallImageUrl} isFoil={isFoil} foilName={foilName} />
            {cardmarketImageUrl && (
                <ImageFrame label="Cardmarket" src={cardmarketImageUrl} isFoil={isFoil} foilName={foilName} />
            )}
        </div>
    )
}
