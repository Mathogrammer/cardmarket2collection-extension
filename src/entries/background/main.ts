import browser, { Runtime } from "webextension-polyfill";
import { importToArchidekt } from "@/archidekt";
import { ROUNDABOUT_MESSAGE, IMPORT_CARDS_TO_ARCHIDEKT, MESSAGE_QUERY_CARDS, Message, RESULT_PAGE_READY, makeMessageListener } from "@/messages";
import axios from "axios";

browser.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

browser.runtime.onMessage.addListener(makeMessageListener((message: Message) => {
    console.log("Received message", message);
    if (message.type === IMPORT_CARDS_TO_ARCHIDEKT) {
        const { cards, archidektCredentials } = message;
        importToArchidekt(axios, browser, cards, archidektCredentials);
    }
    else if (message.type === ROUNDABOUT_MESSAGE) {
        const response = message.data;
        browser.tabs.create({ url: browser.runtime.getURL("src/result-page/index.html"), active: true }).then(() => {
            const listener = makeMessageListener((message: Message, sender: Runtime.MessageSender) => {
                console.log("Received some message", sender.tab?.id, response);
                if (message.type === RESULT_PAGE_READY) {
                    console.log("Received ready message", sender.tab?.id, response);
                    browser.runtime.sendMessage({ type: MESSAGE_QUERY_CARDS, data: response });
                    browser.runtime.onMessage.removeListener(listener);
                }
            });
            browser.runtime.onMessage.addListener(listener);
            console.log("listening for ready message");
        });
    }
}));

console.log("Listening for messages");