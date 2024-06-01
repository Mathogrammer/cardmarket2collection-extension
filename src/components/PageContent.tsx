import React, { useCallback, useMemo, useState } from "react";
import browser from "webextension-polyfill";
import { GetCardsResponse, MESSAGE_GET_CARDS } from "~/messages";
import "./PageContent.css";


function PageContent(props: { children: React.ReactNode }) {

    const [isQuerying, setIsQuerying] = useState(false);
    const [response, setResponse] = useState<GetCardsResponse | undefined>();

    const emptyResponse = useMemo(() => {
        if (response === undefined)
            return false;
        return response.response.length === 0;
    }, [response]);

    // TODO: Throttle requests
    const retrieveCards = useCallback(() => {
        browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
            setIsQuerying(true);
            console.log('Sending query message');
            browser.tabs.sendMessage(tab.id!!, { type: MESSAGE_GET_CARDS }).then((response: GetCardsResponse) => {
                console.log("received response", response);

                browser.runtime.sendMessage({ type: "FIREFOX_ROUNDABOUT_MESSAGE", data: response });

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
            Loading response page...
        </div>
    );
}

export default PageContent;
