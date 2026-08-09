import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { ArchidektForm } from "@/components/ArchidektForm";
import { CardList } from "@/components/CardList";
import { GetCardsResponse, makeMessageListener, Message, MESSAGE_QUERY_CARDS, RESULT_PAGE_READY } from "@/messages";
import "./App.css";
import { debugCredentials } from "@/debug";


function App() {
    const [response, setResponse] = useState<GetCardsResponse>();
    const [username, setUsername] = useState<string>(debugCredentials.archidekt.email);
    const [password, setPassword] = useState<string>(debugCredentials.archidekt.password);

    useEffect(() => {
        const listener = makeMessageListener((message: Message) => {
            if (message.type === MESSAGE_QUERY_CARDS) {
                console.log("Received query message", message);
                setResponse(message.data as GetCardsResponse);
            }
        });
        console.log("Setup listener");

        browser.runtime.onMessage.addListener(listener);
        browser.runtime.sendMessage({ type: RESULT_PAGE_READY });

        return () => {
            browser.runtime.onMessage.removeListener(listener);
        }
    }, []);

    if (response === undefined) {
        return (
            <main>
                <div>
                    Loading...
                </div>
            </main>
        )
    }

    return (
        <main>
            <div>
                <ArchidektForm {...{ username, setUsername, password, setPassword }} />
                <p>Cards retrieved:</p>
                <ul>
                    {
                        response.response.map((card) => {
                            return (
                                <li key={card.productId}>
                                    {card.name}, {card.amount}, {card.condition}, {card.language}, {card.price}
                                </li>
                            );
                        })
                    }
                </ul>
                <CardList cardTableData={response.response} archidektCredentials={{ username, password }} />
            </div>
        </main>
    );
}

export default App;
