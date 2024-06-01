import { FC, useEffect, useMemo, useState } from 'react'
import { CardmarketLanguageToLanguageCode, Result, ResultTypes, getCardFromProductId } from '~/cardmarket'
import { CardTableData } from '~/messages'

type CardItemProps = {
    result: CardTableData
}

export const NewCardItem: FC<CardItemProps> = ({ result }) => {
    const [scryfallData, setScryfallData] = useState<Result>();

    const { name, expansionName, amount, isFoil, language, price } = useMemo(() => result, [result]);

    useEffect(() => {
        getCardFromProductId(result).then((card) => {
            setScryfallData(card);
        });
    }, [result]);

    if (scryfallData === undefined) {
        return <li>Loading... ()</li>
    }

    return (
        <li>
            {scryfallData.resultType}: {
                scryfallData.resultType === ResultTypes.MISSING
                    ? <>[{amount},"{name}","{isFoil ? "Foil" : "Normal"}","{expansionName}","{CardmarketLanguageToLanguageCode[language]}",{price}]</>
                    : <>[{amount},"{scryfallData.card.name}","{isFoil ? "Foil" : "Normal"}","{scryfallData.card.set_name}","{CardmarketLanguageToLanguageCode[language]}",{price}]</>
            }
        </li>
    )
}