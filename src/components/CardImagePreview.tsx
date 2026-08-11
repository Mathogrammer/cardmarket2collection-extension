import { FC, useState } from "react";
import { Card } from "scryfall-sdk";
import { RefreshCcw } from "lucide-react";
import { getSpecialFoilName } from "@/lib/foil";
import { cn } from "@/lib/utils";

type CardImagePreviewProps = {
    card: Card,
    isFoil: boolean,
    cardmarketImageUrl?: string,
}

const FoilOverlay: FC<{ foilName?: string }> = ({ foilName }) => (
    <>
        <div
            className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge"
            style={{
                backgroundImage: "linear-gradient(115deg, transparent 20%, #ff8a8a 30%, #ffe58a 40%, #8aff9e 50%, #8ad4ff 60%, #c58aff 70%, transparent 80%)",
            }}
        />
        {foilName && (
            <div className="absolute inset-x-0 bottom-0 bg-red-600 py-1 text-center text-xs font-medium text-white">
                {foilName}
            </div>
        )}
    </>
)

const ImageFrame: FC<{ label: string, src?: string, isFoil?: boolean, foilName?: string }> = ({ label, src, isFoil, foilName }) => (
    <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="relative w-40 overflow-hidden rounded-lg border bg-muted">
            {src
                ? <img src={src} alt={label} className="block w-full" />
                : <div className="flex aspect-5/7 w-full items-center justify-center p-2 text-center text-xs text-muted-foreground">No image found</div>
            }
            {isFoil && src && <FoilOverlay foilName={foilName} />}
        </div>
    </div>
)

const ScryfallImageFrame: FC<{ card: Card, isFoil?: boolean, foilName?: string }> = ({ card, isFoil, foilName }) => {
    const [showBack, setShowBack] = useState(false);

    const frontSrc = card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal;
    const backSrc = card.card_faces?.[1]?.image_uris?.normal;

    if (!backSrc) {
        return <ImageFrame label="Scryfall" src={frontSrc} isFoil={isFoil} foilName={foilName} />;
    }

    return (
        <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Scryfall</span>
            <div className="relative w-40" style={{ perspective: "1000px" }}>
                <div
                    className="relative aspect-5/7 w-full rounded-lg border bg-muted transition-transform duration-500 transform-3d"
                    style={{ transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                    <div className="absolute inset-0 overflow-hidden rounded-lg backface-hidden">
                        <img src={frontSrc} alt="Card front" className="block h-full w-full object-cover" />
                        {isFoil && <FoilOverlay foilName={foilName} />}
                    </div>
                    <div
                        className="absolute inset-0 overflow-hidden rounded-lg backface-hidden"
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        <img src={backSrc} alt="Card back" className="block h-full w-full object-cover" />
                        {isFoil && <FoilOverlay foilName={foilName} />}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowBack((previous) => !previous)}
                    aria-label="Flip card"
                    className="absolute top-[39%] right-2.5 z-10 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground opacity-50 shadow-sm transition-all duration-150 hover:scale-110 hover:opacity-100 hover:shadow-md"
                >
                    <RefreshCcw className="size-3.5" />
                </button>
            </div>
        </div>
    )
}

export const CardImagePreview: FC<CardImagePreviewProps> = ({ card, isFoil, cardmarketImageUrl }) => {
    const foilName = isFoil ? getSpecialFoilName(card) : undefined;

    return (
        <div className={cn("flex gap-3", !cardmarketImageUrl && "justify-center")}>
            <ScryfallImageFrame card={card} isFoil={isFoil} foilName={foilName} />
            {cardmarketImageUrl && (
                <ImageFrame label="Cardmarket" src={cardmarketImageUrl} isFoil={isFoil} foilName={foilName} />
            )}
        </div>
    )
}
