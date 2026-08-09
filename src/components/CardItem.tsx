import { FC } from 'react'
import { CardmarketLanguageToLanguageCode, ResultFound } from '@/cardmarket'

type CardItemProps = {
    result: ResultFound,
    selected: boolean,
    onSelectedChange: (selected: boolean) => void,
}

export const CardItem: FC<CardItemProps> = ({ result: { card, amount, isFoil, language, price }, selected, onSelectedChange }) => {
    return (
        <li>
            <label>
                <input type="checkbox" checked={selected} onChange={(e) => onSelectedChange(e.target.checked)} />
                [{amount},"{card.name}","{isFoil ? "Foil" : "Normal"}","{card.set_name}","{CardmarketLanguageToLanguageCode[language]}",{price}]
            </label>
        </li>
    )
}