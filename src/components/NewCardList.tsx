import React from 'react';
import { NewCardItem } from './NewCardItem';
import { CardTableData } from '~/messages';

interface NewCardListProps {
    cards: CardTableData[];
}

const NewCardList: React.FC<NewCardListProps> = ({ cards }) => {
    return (
        <ul>
            {cards.map((card) => (
                <NewCardItem key={card.productId} result={card} />
            ))}
        </ul>
    );
};

export default NewCardList;