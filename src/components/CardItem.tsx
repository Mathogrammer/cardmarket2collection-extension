import { FC } from 'react'
import { Card } from 'scryfall-sdk'

type CardItemProps = {
    card: Card
}

export const CardItem: FC<CardItemProps> = ({ card }) => {
    return (
        <li>
            {card.name} ({card.set_name} #{card.collector_number})
        </li>
    )
}