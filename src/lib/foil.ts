import { Card } from "scryfall-sdk";

// Display names for Scryfall promo_types that indicate a special foil treatment.
// Not exhaustive — unmapped promo types are simply ignored (no overlay text).
const specialFoilPromoTypeNames: Partial<Record<string, string>> = {
    confettifoil: "Confetti Foil",
    doublerainbow: "Double Rainbow Foil",
    fracturefoil: "Fracture Foil",
    galaxyfoil: "Galaxy Foil",
    gilded: "Gilded Foil",
    halofoil: "Halo Foil",
    manafoil: "Manafoil",
    neonink: "Neon Ink",
    oilslick: "Oil Slick Foil",
    rainbowfoil: "Rainbow Foil",
    raisedfoil: "Raised Foil",
    ripplefoil: "Ripple Foil",
    silverfoil: "Silver Foil",
    stepandcompleat: "Step-and-Compleat Foil",
    surgefoil: "Surge Foil",
    textured: "Textured Foil",
};

/**
 * Returns the display name of the card's special foil treatment (e.g. "Surge Foil"),
 * or undefined if the card only has a plain/standard foil finish (or none at all).
 */
export const getSpecialFoilName = (card: Card): string | undefined => {
    for (const promoType of card.promo_types ?? []) {
        const name = specialFoilPromoTypeNames[promoType];
        if (name) {
            return name;
        }
    }

    if (card.frame_effects?.includes("etched")) {
        return "Etched Foil";
    }

    return undefined;
}
