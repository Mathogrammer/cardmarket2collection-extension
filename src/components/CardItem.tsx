import { FC } from 'react'
import { CardmarketLanguageToLanguageCode, ResultFound } from '@/cardmarket'

type CardItemProps = {
    result: ResultFound
}

export const CardItem: FC<CardItemProps> = ({ result: { card, amount, isFoil, language, price } }) => {
    return (
        <li>
            [{amount},"{card.name}","{isFoil ? "Foil" : "Normal"}","{card.set_name}","{CardmarketLanguageToLanguageCode[language]}",{price}]
        </li>
    )
}