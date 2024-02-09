import React, { useCallback, useMemo, useState } from "react";
import browser from "webextension-polyfill";
import logo from "~/assets/logo.svg";
import { CardQueryResponse, MESSAGE_QUERY_CARDS } from "~/messages";
import { CardList } from "./CardList";
import "./PageContent.css";


function PageContent(props: { children: React.ReactNode }) {
    const imageUrl = new URL(logo, import.meta.url).href;

    const [isQuerying, setIsQuerying] = useState(false);
    const [response, setResponse] = useState<CardQueryResponse | undefined>();

    const emptyResponse = useMemo(() => {
        if (response === undefined)
            return false;
        return response.cards.length === 0 && response.missingCards.length === 0;
    }, [response]);

    // TODO: Throttle requests
    const retrieveCards = useCallback(() => {
        browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
            setIsQuerying(true);
            console.log('Sending query message');
            browser.tabs.sendMessage(tab.id!!, { type: MESSAGE_QUERY_CARDS }).then((response: CardQueryResponse) => {
                console.log("received response", response);
                setResponse(response);
                setIsQuerying(false);
            });
        });
    }, []);

    if (isQuerying) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    if (response === undefined || emptyResponse) {
        return (
            <div>
                <img src={imageUrl} height="45" alt="" />
                <h1>{props.children}</h1>
                {emptyResponse && <p>No cards found.</p>}
                <button type="button" onClick={retrieveCards}>
                    Query cards from page
                </button>
            </div>
        )
    }

    return (
        <div>
            <p>Cards retrieved:</p>
            <CardList cards={response.cards} fallbackCards={response.fallbackCards} missingCards={response.missingCards} />
        </div>
    );
}

export default PageContent;
