import { FC } from 'react';
import { Card } from 'scryfall-sdk';
// import browser from "webextension-polyfill";
import { CardItem } from './CardItem';
import './Cards.css';

type MissingCard = {
    name: string,
    productId: number
}

type CardListProps = {
    cards: Card[],
    fallbackCards: Card[],
    missingCards: MissingCard[],
}

// const importToArchidekt = useCallback((cards: Card[]) => {
//     browser.tabs.create({ url: "https://www.archidekt.com/collection", active: true }).then((tab) => {
//         console.log(tab);
//     })
// }, []);

export const CardList: FC<CardListProps> = ({ cards, fallbackCards, missingCards }) => {
    // const [allCards, setAllCards] = useState([
    //     ...cards,
    //     ...fallbackCards,
    // ]);

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
            {/* <button onClick={() => importToArchidekt(allCards)}>Import to Archidekt</button> */}
        </div>
    )
}