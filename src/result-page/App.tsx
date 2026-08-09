import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { Loader2 } from "lucide-react";
import { ArchidektForm } from "@/components/ArchidektForm";
import { CardList } from "@/components/CardList";
import { ScannedCardsTable } from "@/components/ScannedCardsTable";
import { TooltipProvider } from "@/components/ui/tooltip";
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
            <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    Waiting for scanned cards...
                </div>
            </main>
        )
    }

    return (
        <TooltipProvider>
            <main className="min-h-screen bg-background text-foreground">
                <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
                    <header className="space-y-1">
                        <h1 className="text-2xl font-semibold">Archidekt import results</h1>
                        <p className="text-muted-foreground">Review the cards scanned from your Cardmarket order before importing them.</p>
                    </header>
                    <ArchidektForm {...{ username, setUsername, password, setPassword }} />
                    <CardList cardTableData={response.response} archidektCredentials={{ username, password }} />
                    <ScannedCardsTable cardTableData={response.response} />
                </div>
            </main>
        </TooltipProvider>
    );
}

export default App;
