import { FC, useCallback, useState } from 'react';
import { Card } from 'scryfall-sdk';
// import browser from "webextension-polyfill";
import { CardItem } from './CardItem';
import './Cards.css';
import browser from 'webextension-polyfill';

type MissingCard = {
    name: string,
    productId: number
}

type CardListProps = {
    cards: Card[],
    fallbackCards: Card[],
    missingCards: MissingCard[],
    archidektCollectionId: string
}

const importToArchidekt = (cards: Card[], archidektCollectionId: string) => {
    browser.tabs.create({ url: `https://www.archidekt.com/collections/${archidektCollectionId}`, active: true }).then((tab) => {
        console.log(tab);
    })
};

export const CardList: FC<CardListProps> = ({ cards, fallbackCards, missingCards, archidektCollectionId }) => {
    const [allCards, setAllCards] = useState([
        ...cards,
        ...fallbackCards,
    ]);

    return (
        <div>
            <h4>Cards found: </h4>
            <ul>
                {cards.map(it => (<CardItem card={it} />))}
            </ul>
            <h4>Cards found using fallback method (please check for correctness!): </h4>
            <ul>
                {fallbackCards.map(it => (<CardItem card={it} />))}
            </ul>
            <h4>Cards that couldn't be found: </h4>
            <ul>
                {missingCards.map(it => (
                    <li>{it.name}</li>
                ))}
            </ul>
            <button onClick={() => importToArchidekt(allCards, archidektCollectionId)}>Import to Archidekt</button>
        </div>
    )
}