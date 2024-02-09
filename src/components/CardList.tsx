import { FC } from 'react';
import './Cards.css';
import { Card } from 'scryfall-sdk';

type CardListProps = {
    cards: Card[]
    missingCards: Card[]
}

export const CardList: FC<CardListProps> = (props) => {

    return (
        <ul>

        </ul>
    )
}